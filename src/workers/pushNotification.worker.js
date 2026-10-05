// workers/pushNotification.worker.js
// Run with: node workers/pushNotification.worker.js

import { Worker } from "bullmq";
import IORedis from "ioredis";
import { redisConfig } from "../config/redis.config.js";
import { PUSH_NOTIFICATION_QUEUE } from "../queues/pushNotification.queue.js";
import PushNotificationService from "../services/pushNotification.service.js";

const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

// PushNotificationService's static methods are `async` functions that ALSO
// take a Node-style (err, result) callback instead of returning their result.
// node:util's promisify() expects a plain callback-style function and warns
// (DEP0174) when given one that's already `async`, so we wrap them by hand
// instead — same effect, no warning.
function toPromise(fn) {
  return (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, result) => (err ? reject(err) : resolve(result)));
    });
}

const sendNotification = toPromise(PushNotificationService.sendNotification);
const sendNotificationByFcmToken = toPromise(
  PushNotificationService.sendNotificationByFcmToken,
);

async function processJob(job) {
  const { title, body, data } = job.data;

  switch (job.name) {
    case "send-to-user": {
      const { userId } = job.data;
      console.log(`[push] job=${job.id} sending to userId=${userId}`);

      const results = await sendNotification({ userId, title, body, data });

      // sendNotification succeeds (resolves) as long as it found tokens and
      // attempted delivery; individual token failures show up inside
      // `results` rather than rejecting the whole call. Surface them here
      // without failing the whole job over one bad/expired token.
      const failedTokens = results.filter((r) => r.error);
      if (failedTokens.length > 0) {
        console.warn(
          `[push] job=${job.id} ${failedTokens.length}/${results.length} token(s) failed:`,
          failedTokens.map((f) => ({
            token: f.token,
            error: f.error?.message,
          })),
        );
      }

      const sentCount = results.length - failedTokens.length;
      if (sentCount === 0) {
        // Every token failed — treat as a job failure so BullMQ retries it.
        throw new Error(
          `All ${results.length} token(s) failed for userId=${userId}: ` +
            failedTokens.map((f) => f.error?.message).join("; "),
        );
      }

      return { userId, sent: sentCount, failed: failedTokens.length, results };
    }

    case "send-to-token": {
      const { fcmToken } = job.data;
      console.log(
        `[push] job=${job.id} sending to token=${fcmToken.slice(0, 12)}...`,
      );

      const result = await sendNotificationByFcmToken({
        fcmToken,
        title,
        body,
        data,
      });
      return result; // { messageId, token }
    }

    default:
      throw new Error(`Unknown job type: ${job.name}`);
  }
}

export function startPushNotificationWorker() {
  const worker = new Worker(PUSH_NOTIFICATION_QUEUE, processJob, {
    connection,
    concurrency: 10, // tune to your FCM throughput / rate limits
  });

  worker.on("completed", (job, result) => {
    console.log(`[push] job ${job.id} completed:`, result);
  });

  worker.on("failed", (job, err) => {
    console.error(`[push] job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("[push] worker error:", err);
  });

  async function shutdown() {
    console.log("\n[push] shutting down...");
    await worker.close();
    await connection.quit();
    process.exit(0);
  }
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  console.log(`[push] worker listening on queue "${PUSH_NOTIFICATION_QUEUE}"`);
}
