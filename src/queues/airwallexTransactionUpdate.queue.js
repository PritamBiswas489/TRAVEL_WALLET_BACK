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

export const AIRWALLEX_QUEUE_NAME = "airwallex-transaction-update";

export const JOB_NAMES = {
  UPDATE_WALLET_TRANSACTIONS: "update-wallet-transactions",
};

export const airwallexUpdateTransactionQueue = new Queue(AIRWALLEX_QUEUE_NAME, { connection });

 
export const enqueueUpdateTransactions = async ({   userId  }) => {
    console.log(`Enqueuing update transactions job for userId: ${userId}`);
  try{
    console.log(`Attempting to enqueue update transactions job for userId: ${userId}`);
     return airwallexUpdateTransactionQueue.add(
        JOB_NAMES.UPDATE_WALLET_TRANSACTIONS,
        { userId },
        {
        jobId: `update-wallet-transactions-${userId}`,
        attempts: 3,
        backoff: { type: "exponential", delay: 15000 },
        removeOnComplete: 1000,
        removeOnFail: false,
        },
  );
  } catch (error) {
    console.error(
      `Failed to enqueue update transactions job for userId: ${userId}:`,
      error?.message || error,
    );
    throw error;
  }

 
};

export default airwallexUpdateTransactionQueue;
