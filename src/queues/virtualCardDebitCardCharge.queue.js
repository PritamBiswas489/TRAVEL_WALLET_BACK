import { Queue } from "bullmq";
import IORedis from "ioredis";
import { redisConfig } from "../config/redis.config.js";


const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

export const AIRWALLEX_QUEUE_NAME = "virtual_card_debit_card_charge";


export const JOB_NAMES = {
  APPLY_VIRTUAL_CARD_DEBIT_CARD_CHARGE: "apply-virtual-card-debit-card-charge",
};

export const airwallexVirtualCardChargeQueue = new Queue(AIRWALLEX_QUEUE_NAME, { connection });

// Add a job to apply virtual card debit card charge
export async function enqueueApplyVirtualCardDebitCardChargeJob(virtualCardPaymentid) {
    return airwallexVirtualCardChargeQueue.add(
        JOB_NAMES.APPLY_VIRTUAL_CARD_DEBIT_CARD_CHARGE,
        { id: virtualCardPaymentid },
        {
          jobId: `apply-virtual-card-debit-card-charge-${virtualCardPaymentid}`,
          attempts: 3,
          backoff: { type: "exponential", delay: 10000 }, // 10s, 20s, 40s, 80s, 160s
          removeOnComplete: 5,
          removeOnFail: false, // keep failed jobs visible for manual review / requeue
        },
      );
}
