// queues/pushNotification.queue.js
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { redisConfig } from "../config/redis.config.js";

export const PUSH_NOTIFICATION_QUEUE = "push-notification-queue";

const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});


export const pushNotificationQueue = new Queue(PUSH_NOTIFICATION_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 3, // retry transient FCM/network failures
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

/**
 * Enqueue a notification to every FCM token on file for a user
 * (mirrors PushNotificationService.sendNotification).
 */
export async function enqueueUserNotification({ userId, title, body, data = {} }, opts = {}) {
  return pushNotificationQueue.add(
    "send-to-user",
    { userId, title, body, data },
    opts
  );
}

/**
 * Enqueue a notification to a single, specific FCM token
 * (mirrors PushNotificationService.sendNotificationByFcmToken).
 */
export async function enqueueTokenNotification({ fcmToken, title, body, data = {} }, opts = {}) {
  return pushNotificationQueue.add(
    "send-to-token",
    { fcmToken, title, body, data },
    opts
  );
}

/**
 * Enqueue the same notification to many users at once, in a single
 * round trip to Redis.
 */
export async function enqueueBulkUserNotifications(users, { title, body, data = {} }) {
  return pushNotificationQueue.addBulk(
    users.map(({ userId }) => ({
      name: "send-to-user",
      data: { userId, title, body, data },
    }))
  );
}
