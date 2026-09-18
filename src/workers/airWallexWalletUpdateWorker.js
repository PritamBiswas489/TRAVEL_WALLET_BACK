import { Worker } from "bullmq";
import IORedis from "ioredis";
import * as Sentry from "@sentry/node";
import "../config/environment.js";

import AirwallexPaymentService from "../services/airwallexPayment.service.js";
import { redisConfig } from "../config/redis.config.js";
import {
  AIRWALLEX_QUEUE_NAME,
  JOB_NAMES,
} from "../queues/airwallexTransactionUpdate.queue.js";

const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

function updateWalletTransactions({ userId }) {
  return new Promise((resolve, reject) => {
    AirwallexPaymentService.updateUserTransactionHistoryTable(
      { userId },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
  });
}

export function walletTransactionsUpdateWorker() {

  const worker = new Worker(
    AIRWALLEX_QUEUE_NAME,
    async (job) => {
        console.log(`Received job ${job.name} for user ${job.data.userId}`);
      switch (job.name) {
        case JOB_NAMES.UPDATE_WALLET_TRANSACTIONS:
          console.log(
            `🔄 Processing wallet transactions update for user ${job.data.userId} (attempt ${job.attemptsMade + 1})`,
          );
          return updateWalletTransactions(job.data);

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
    console.log(
      `✅ ${job.name} completed for user ${job.data.userId} (job ${job.id})`,
    );
  });

  worker.on("failed", async (job, err) => {
    const attemptsAllowed = job.opts.attempts ?? 1;
    console.error(
      `❌ ${job.name} attempt ${job.attemptsMade}/${attemptsAllowed} failed for user ${job.data?.userId}:`,
      err?.message || err,
    );

    const exhausted = job.attemptsMade >= attemptsAllowed;
    if (!exhausted) return; // BullMQ will retry automatically per the backoff config

    process.env.SENTRY_ENABLED === "true" && Sentry.captureException(err);
  });

  worker.on("error", (err) => {
    // Connection-level errors (e.g. Redis dropped), not job failures.
    console.error("❌ Airwallex worker connection error:", err?.message || err);
    process.env.SENTRY_ENABLED === "true" && Sentry.captureException(err);
  });

  console.log(
    `👷 Wallet transactions update worker started (queue: ${AIRWALLEX_QUEUE_NAME})`,
  );

  return worker;
}
