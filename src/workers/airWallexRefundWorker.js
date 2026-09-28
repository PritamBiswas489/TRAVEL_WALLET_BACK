import { Worker } from "bullmq";
import IORedis from "ioredis";
import * as Sentry from "@sentry/node";
import "../config/environment.js";
import { redisConfig } from "../config/redis.config.js";
import {
  AIRWALLEX_QUEUE_NAME,
  JOB_NAMES,
  enqueueReverseSplitStatusCheck,
  airWallexQueue,
} from "../queues/airwallexRefund.queue.js";
import db from "../databases/models/index.js";

const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

async function checkReverseSplitStatus(job) {
  const { reverseSplitId, attempt, maxAttempts, intervalMs } = job.data;

  console.log(`Checking Status......reverseSplitId: ${reverseSplitId}, attempt: ${attempt}`);

  if (attempt >= maxAttempts) {
    console.log(
      `[reverse-split-status] reverseSplitId=${reverseSplitId} not settled after ${attempt} attempts. ` +
        `Reached max attempts — stopping (last status: checking.`,
    );
    // Completed, not failed: the job did exactly what it was asked to do
    // (poll up to maxAttempts times). Handle the "gave up" case downstream
    // by inspecting job.returnvalue.status, or emit your own event/alert here.
    return {
      reverseSplitId,
      status: "gave_up",
      lastStatus: "unknown",
      attempts: attempt,
    };
  }
  const nextAttempt = attempt + 1;
  await airWallexQueue.add(
    JOB_NAMES.CHECKING_REVERSE_SPLIT_STATUS,
    { reverseSplitId, attempt: nextAttempt, maxAttempts, intervalMs },
    {
      delay: intervalMs,
      jobId: `reverse-split-status:${reverseSplitId}:attempt-${nextAttempt}`,
    },
  );
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
  });
  worker.on("error", (err) => {
    // Connection-level errors (e.g. Redis dropped), not job failures.
    console.error("❌ Airwallex worker connection error:", err?.message || err);
    process.env.SENTRY_ENABLED === "true" && Sentry.captureException(err);
  });
  return;
}
