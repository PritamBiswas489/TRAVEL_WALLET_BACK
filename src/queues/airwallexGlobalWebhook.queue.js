import { Queue } from "bullmq";
import IORedis from "ioredis";
import { randomUUID } from "crypto";
import { redisConfig } from "../config/redis.config.js";

const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

export const AIRWALLEX_GLOBAL_WEBHOOK_QUEUE_NAME = "airwallex-global-webhook";

export const JOB_NAMES = {
  PROCESS_GLOBAL_WEBHOOK: "process-global-webhook",
};

export const airwallexGlobalWebhookQueue = new Queue(
  AIRWALLEX_GLOBAL_WEBHOOK_QUEUE_NAME,
  { connection },
);

// Airwallex event ids are unique per event; using them as jobId makes
// redelivered webhooks a no-op while the job is still retained.
export const enqueueAirwallexGlobalWebhook = ({ payload, headers }) => {
  // Drop the i18n instance attached by the route; it is not serializable and
  // the worker sets its own.
  console.log("Enqueuing Airwallex global webhook with payload:", payload?.name);
  const plainHeaders = Object.fromEntries(
    Object.entries(headers).filter(([key]) => key !== "i18n"),
  );
  
  return airwallexGlobalWebhookQueue.add(
    JOB_NAMES.PROCESS_GLOBAL_WEBHOOK,
    { payload, headers: plainHeaders },
    {
      jobId: payload?.id ? `airwallex-global-${payload.id}` : randomUUID(),
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 5,
      removeOnFail: false,
    },
  );
};

export default airwallexGlobalWebhookQueue;
