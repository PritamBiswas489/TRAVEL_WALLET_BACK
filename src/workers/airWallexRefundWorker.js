import { Worker } from "bullmq";
import IORedis from "ioredis";
import * as Sentry from "@sentry/node";
import "../config/environment.js";
import { redisConfig } from "../config/redis.config.js";
import {
  AIRWALLEX_QUEUE_NAME,
  JOB_NAMES,
  enqueueRefundProcess,
  airWallexQueue,
} from "../queues/airwallexRefund.queue.js";
import db from "../databases/models/index.js";
import AirwallexPaymentService from "../services/airwallexPayment.service.js";
import WorkerErrorLogService from "../services/workerErrorLog.service.js";

const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

async function refundProcessExecute(job) {
  const {    userId, paymentId, amount  } = job.data;
  return new Promise((resolve, reject) => {
    AirwallexPaymentService.refundPaymentIntent(
      { userId, payload: { paymentId, amount } },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
  });
}
//check reverse split status worker function
async function checkReverseSplitStatus(job) {
  const {
     reverseSplitId, 
     userId,  
     attempt, 
     maxAttempts, 
     intervalMs 
  } = job.data;

  console.log(
    `Checking status: reverseSplitId=${reverseSplitId}, attempt=${attempt}`,
  );

  let checkStatusResponse = null;
  let apiError = null;

  try {
    checkStatusResponse = await new Promise((resolve, reject) => {
      AirwallexPaymentService.getMainPaymentReverseSplitStatusBySplitId(
        {
          userId: userId,
          payload: {
            splitId: reverseSplitId,
          },
        },
        (err, result) => {
          if (err) {
            return reject(err);
          }

          resolve(result);
        },
      );
    });
  } catch (error) {
    apiError = error;

    console.error(
      `❌ Error checking reverse split status for reverseSplitId=${reverseSplitId}:`,
      error?.message || error,
    );
  }

  //status of the reverse split
  const status = checkStatusResponse?.data?.status;

  // Settled
  if (status === "SETTLED") {
    console.log(`✅ Reverse split settled: ${reverseSplitId}`);
    //initiate any post-settlement actions if needed
  
     enqueueRefundProcess({ reverseSplitDetails: checkStatusResponse?.data, userId });
     

    return {
      reverseSplitId,
      userId,
      status: "settled",
      attempts: attempt,
    };
  }

  // Maximum attempts reached
  if (attempt >= maxAttempts) {
    console.log(
      `[reverse-split-status] reverseSplitId=${reverseSplitId} ` +
        `not settled after ${attempt} attempts. ` +
        `Last status: ${status || "unknown"}`,
    );

    return {
      reverseSplitId,
      userId,
      status: "gave_up",
      lastStatus: status || "unknown",
      attempts: attempt,
      lastError: apiError?.message || null,
    };
  }

  // Continue polling even if API failed
  const nextAttempt = attempt + 1;

  await airWallexQueue.add(
    JOB_NAMES.CHECKING_REVERSE_SPLIT_STATUS,
    {
      reverseSplitId,
      userId,
      attempt: nextAttempt,
      maxAttempts,
      intervalMs,
    },
    {
      delay: intervalMs,
      jobId: `reverse-split-status:${reverseSplitId}:attempt-${nextAttempt}`,
    },
  );

  return {
    reverseSplitId,
    userId,
    status: "checking",
    attempts: attempt,
    nextAttempt,
    apiError: apiError?.message || null,
  };
}
/**
 * Starts the AirWallex refund worker to process jobs from the AirWallex refund queue.
 * This worker listens for specific job types defined in JOB_NAMES and handles them accordingly.
 * Errors are reported to Sentry for monitoring and debugging.
 */
export function startAirWallexRefundWorker() {
  const worker = new Worker(
    AIRWALLEX_QUEUE_NAME,
    async (job) => {
      switch (job.name) {
        case JOB_NAMES.CHECKING_REVERSE_SPLIT_STATUS:
          return await checkReverseSplitStatus(job);
        case JOB_NAMES.REFUND_PAYMENT_INTENT:
          return await refundProcessExecute(job);
        default:
          // Unknown job name — fail fast rather than silently no-op-ing.
          throw new Error(`Unrecognized job name: ${job.name}`);
      }
    },
    {
      connection,
      concurrency: 5,
    },
  );
  worker.on("completed", (job) => {
    console.log(`✅ ${job.name} completed for  (job ${job.id})`);
  });
  worker.on("failed", async (job, err) => {
    console.error(`❌ ${job.name} failed for  (job ${job.id}): ${err.message}`);
    try {
      await WorkerErrorLogService.logJobFailure({
        queue: AIRWALLEX_QUEUE_NAME,
        job,
        err,
      });
    } catch (logErr) {
      console.error(
        `Failed to log job failure for ${job.name} (job ${job.id}): ${logErr.message}`,
      );
    }
  });
  worker.on("error", async (err) => {
    // Connection-level errors (e.g. Redis dropped), not job failures.
    console.error("❌ Airwallex worker connection error:", err?.message || err);
    await WorkerErrorLogService.logWorkerError({
      queue: AIRWALLEX_QUEUE_NAME,
      err,
    });
    process.env.SENTRY_ENABLED === "true" && Sentry.captureException(err);
  });
   console.log(
      `👷 Airwallex Refund worker started (queue: ${AIRWALLEX_QUEUE_NAME})`,
    );
  return;
}
