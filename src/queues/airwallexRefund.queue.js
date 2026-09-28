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

// Define the Airwallex refund queue using the BullMQ Queue class and the custom connection.
export const AIRWALLEX_QUEUE_NAME = "airwallex-refund-queue";
export const airwallexRefundQueue = new Queue(AIRWALLEX_QUEUE_NAME, {
  connection,
});

// Define job names for the Airwallex refund queue.
export const JOB_NAMES = {
  CHECKING_REVERSE_SPLIT_STATUS: "checking-reverse-split-status",
};


// Define a separate queue instance for handling reverse split status checks.
export const airWallexQueue = new Queue(AIRWALLEX_QUEUE_NAME, { connection });


// Enqueue a job to check the status of a reverse split.
export const enqueueReverseSplitStatusCheck  =  async ({reverseSplitId, opts = {} }) =>{
     const intervalMs = opts.intervalMs ?? 1 * 60 * 1000; // 1 minutes
     const maxAttempts = opts.maxAttempts ?? 12;

     return airWallexQueue.add(
       JOB_NAMES.CHECKING_REVERSE_SPLIT_STATUS,
        { reverseSplitId, attempt: 1, maxAttempts, intervalMs },
        {
        // Deterministic jobId per order+attempt avoids accidental duplicate polling
        // chains if enqueueOrderStatusCheck is called twice for the same order.
            jobId: `reverse-split-status:${reverseSplitId}:attempt-1`,
        }
    );
}




