import { Queue } from "bullmq";
import IORedis from "ioredis";
import { redisConfig } from "../config/redis.config.js";

// BullMQ requires its own connection with maxRetriesPerRequest: null (it
// manages retries itself), so it can't reuse the shared `redisClient`
// instance directly — but it uses the exact same host/port/auth/db as the
// rest of the app via redisConfig.
const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

export const AIRWALLEX_QUEUE_NAME = "airwallex-payment-intent";

export const JOB_NAMES = {
  FUND_SPLIT: "fund-split",
  REFUND_PAYMENT_INTENT: "refund-payment-intent",
};

export const airwallexQueue = new Queue(AIRWALLEX_QUEUE_NAME, { connection });

/**
 * Enqueue a fund-split job for a successfully paid PaymentIntent.
 * jobId is deterministic (fund-split-<intentId>) so BullMQ itself rejects a
 * second enqueue for the same intent — this replaces the manual
 * `airwallex:fundsplit:lock:<intentId>` Redis key from the old inline logic.
 */
export async function enqueueFundSplit({ intentId, userId, paymentId }) {
  return airwallexQueue.add(
    JOB_NAMES.FUND_SPLIT,
    { intentId, userId, paymentId },
    {
      jobId: `fund-split-${paymentId}`,
      attempts: 5,
      backoff: { type: "exponential", delay: 10000 }, // 10s, 20s, 40s, 80s, 160s
      removeOnComplete: 1000,
      removeOnFail: false, // keep failed jobs visible for manual review / requeue
    },
  );
}

/**
 * Enqueue a refund job. Used as the automatic fallback when fund-split
 * permanently fails, and can also be called directly for other refund flows.
 */
export async function enqueueRefund({ intentId, userId, paymentId, reason }) {
  return airwallexQueue.add(
    JOB_NAMES.REFUND_PAYMENT_INTENT,
    { intentId, userId, paymentId, reason },
    {
      jobId: `refund-${paymentId}`,
      attempts: 3,
      backoff: { type: "exponential", delay: 15000 },
      removeOnComplete: 1000,
      removeOnFail: false,
    },
  );
}

export default airwallexQueue;
