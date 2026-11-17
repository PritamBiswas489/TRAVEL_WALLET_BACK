import { Worker } from "bullmq";
import IORedis from "ioredis";
import * as Sentry from "@sentry/node";
import "../config/environment.js";
import {
  AIRWALLEX_QUEUE_NAME,
  JOB_NAMES,
} from "../queues/virtualCardDebitCardCharge.queue.js";
import AirwallexPaymentService from "../services/airwallexPayment.service.js";
import { redisConfig } from "../config/redis.config.js";
import WorkerErrorLogService from "../services/workerErrorLog.service.js";

const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

export function startVirtualCardPaymentChargeWorker() {
  const worker = new Worker(
    AIRWALLEX_QUEUE_NAME,
    async (job) => {
      switch (job.name) {
        case JOB_NAMES.APPLY_VIRTUAL_CARD_DEBIT_CARD_CHARGE:
          try {
            const result = await new Promise((resolve, reject) => {
              AirwallexPaymentService.chargeUserForDebitVirtualCardPayment(
                { id: job.data.id },
                (error, res) => {
                  if (error) {
                    // Sanitize error before rejecting to avoid circular references
                    const sanitizedError = new Error(
                      error?.message || String(error),
                    );
                    sanitizedError.stack = error?.stack;
                    reject(sanitizedError);
                  } else {
                    // Extract only serializable data to avoid circular references
                    const safeRes = res?.data || res;
                    resolve(safeRes);
                  }
                },
              );
            });
            return result;
          } catch (error) {
            const sanitizedError = new Error(error?.message || String(error));
            sanitizedError.stack = error?.stack;
            process.env.SENTRY_ENABLED === "true" &&
              Sentry.captureException(sanitizedError);
            throw sanitizedError;
          }
        default:
          throw new Error(`Unknown job name: ${job.name}`);
      }
    },
    {
      connection,
      concurrency: 5, // Set the desired concurrency level for processing jobs
    },
  );
  worker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed`);
  });
  worker.on("failed", async (job, err) => {
    console.error(`Job ${job.id} has failed with error: ${err?.message}`);
    try {
      const sanitizedErr = {
        message: err?.message || String(err),
        stack: err?.stack,
      };
      await WorkerErrorLogService.logJobFailure({
        queue: AIRWALLEX_QUEUE_NAME,
        job,
        err: sanitizedErr,
      });
    } catch (logErr) {
      console.error(
        `Failed to log job failure for ${job.name} (job ${job.id}): ${logErr.message}`,
      );
    }
  });
  worker.on("error", async (err) => {
    console.error(`Worker encountered an error: ${err.message}`);
    process.env.SENTRY_ENABLED === "true" && Sentry.captureException(err);
    await WorkerErrorLogService.logWorkerError({
      queue: AIRWALLEX_QUEUE_NAME,
      err,
    });
  });
  console.log(
    `👷 Virtual Card Payment Charge worker started (queue: ${AIRWALLEX_QUEUE_NAME})`,
  );

  return worker;
}
