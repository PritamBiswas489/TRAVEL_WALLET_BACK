import { Worker } from "bullmq";
import IORedis from "ioredis";
import * as Sentry from "@sentry/node";
import "../config/environment.js";

import AirwallexPaymentService from "../services/airwallexPayment.service.js";
import { redisConfig } from "../config/redis.config.js";
import {
  AIRWALLEX_QUEUE_NAME,
  JOB_NAMES,
  enqueueRefund,
} from "../queues/airwallexPaymentIntent.queue.js";

import db from "../databases/models/index.js";
const { AirwallexPaymentIntent } = db;

const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

// Wrap the existing callback-style service methods as promises so the worker
// can just `await` them — no change needed to the service methods themselves.
function fundSplit({ userId, paymentId }) {
  return new Promise((resolve, reject) => {
    AirwallexPaymentService.fundSplitWithConnectedAccount(
      { userId, payload: { paymentId } },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
  });
}

function refund({ userId, paymentId }) {
  return new Promise((resolve, reject) => {
    AirwallexPaymentService.refundPaymentIntent(
      { userId, payload: { paymentId } },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
  });
}
export function startAirwallexPaymentIntentWorker() {
  const worker = new Worker(
    AIRWALLEX_QUEUE_NAME,
    async (job) => {
      switch (job.name) {
        case JOB_NAMES.FUND_SPLIT:
          console.log(
            `🔄 Processing fund-split for intent ${job.data.intentId} (attempt ${job.attemptsMade + 1})`,
          );
          return fundSplit(job.data);

        case JOB_NAMES.REFUND_PAYMENT_INTENT:
          console.log(
            `🔄 Processing refund for intent ${job.data.intentId} (reason: ${job.data.reason || "n/a"}, attempt ${job.attemptsMade + 1})`,
          );
          return refund(job.data);

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
      `✅ ${job.name} completed for intent ${job.data.intentId} (job ${job.id})`,
    );
  });

  worker.on("failed", async (job, err) => {
    const attemptsAllowed = job.opts.attempts ?? 1;
    console.error(
      `❌ ${job.name} attempt ${job.attemptsMade}/${attemptsAllowed} failed for intent ${job.data?.intentId}:`,
      err?.message || err,
    );

    const exhausted = job.attemptsMade >= attemptsAllowed;
    if (!exhausted) return; // BullMQ will retry automatically per the backoff config

    process.env.SENTRY_ENABLED === "true" && Sentry.captureException(err);

    if (job.name === JOB_NAMES.FUND_SPLIT) {
      console.error(
        `❌ Fund split permanently failed for intent ${job.data.intentId} after ${attemptsAllowed} attempts — enqueueing refund`,
      );
      try {

        await enqueueRefund({
          intentId: job.data.intentId,
          userId: job.data.userId,
          paymentId: job.data.paymentId,
          reason: "FUND_SPLIT_EXHAUSTED_RETRIES",
        });

        const [updatedRows] = await AirwallexPaymentIntent.update(
          {
            rechargeStatus: "FAILED",
            paymentRefundStatus: "INITIATED",
          },
          { where: { id: job.data.paymentId } },
        );

        if (!updatedRows) {
            console.warn(
              `⚠️ Refund enqueued for intent ${job.data.intentId}, but payment row ${job.data.paymentId} was not updated`,
            );
        }
      } catch (enqueueErr) {
        // If even enqueueing the refund fails, this needs a human — it's no
        // longer something the queue can retry its way out of.
        console.error(
          `❌ Failed to enqueue refund fallback for intent ${job.data.intentId}:`,
          enqueueErr?.message || enqueueErr,
        );
        process.env.SENTRY_ENABLED === "true" &&
          Sentry.captureException(enqueueErr);
      }
    }

    if (job.name === JOB_NAMES.REFUND_PAYMENT_INTENT) {
      console.error(
        `❌ Refund permanently failed for intent ${job.data.intentId} — manual review required (this payment succeeded but neither split nor refund completed)`,
      );
      // Nothing left to auto-retry here; the failed job stays in the queue
      // (removeOnFail: false) for manual inspection/requeue via the BullMQ
      // dashboard or bullmq-cli.
    }
  });

  worker.on("error", (err) => {
    // Connection-level errors (e.g. Redis dropped), not job failures.
    console.error("❌ Airwallex worker connection error:", err?.message || err);
    process.env.SENTRY_ENABLED === "true" && Sentry.captureException(err);
  });

  console.log(
    `👷 Airwallex PaymentIntent worker started (queue: ${AIRWALLEX_QUEUE_NAME})`,
  );

  return worker;
}
