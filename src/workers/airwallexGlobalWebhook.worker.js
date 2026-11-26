import { Worker } from "bullmq";
import IORedis from "ioredis";
import * as Sentry from "@sentry/node";
import "../config/environment.js";

import AirwallexPaymentController from "../controllers/airwallexPayment.controller.js";
import AirwallexDirectBankTransferController from "../controllers/airwallexDirectBankTransfer.controller.js";
import i18n from "../config/i18.config.js";
import { redisConfig } from "../config/redis.config.js";
import {
  kycEventNames,
  depositEventNames,
  transferEventNames,
  chargesWebhookEventNames,
  cardholderWebhookEventNames,
  debitCardWebhookEventNames,
  cardTransactionsWebhookEventNames,
  transactionDisputeWebhookEventNames,
  paymentIntentWebhookEventNames,
  fundSplitWebhookEventNames,
  paymentIntentReturnWebhookEventNames,
  offboardingWebhookEventNames,
  paymentAttemptWebhookEventNames,
  directBankTransferWebhookEventNames,
  balanceImpactingWebhooks,
} from "../config/webhookEvents.js";
import {
  AIRWALLEX_GLOBAL_WEBHOOK_QUEUE_NAME,
} from "../queues/airwallexGlobalWebhook.queue.js";
import WorkerErrorLogService from "../services/workerErrorLog.service.js";

const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

// Order matches the original route's if/else chain; first match wins.
const eventHandlers = [
  [kycEventNames, (args) => AirwallexPaymentController.airwallexKycWebhook(args)],
  [depositEventNames, (args) => AirwallexPaymentController.handleDepositWebhook(args)],
  [transferEventNames, (args) => AirwallexPaymentController.airwallexConnectedTransferWebhook(args)],
  [chargesWebhookEventNames, (args) => AirwallexPaymentController.handleAirwallexChargesWebhook(args)],
  [cardholderWebhookEventNames, (args) => AirwallexPaymentController.handleCardHolderWebhook(args)],
  [debitCardWebhookEventNames, (args) => AirwallexPaymentController.handleDebitCardWebhook(args)],
  [cardTransactionsWebhookEventNames, (args) => AirwallexPaymentController.handleCardTransactionsWebhook(args)],
  [transactionDisputeWebhookEventNames, (args) => AirwallexPaymentController.handleTransactionDisputeWebhook(args)],
  [paymentIntentWebhookEventNames, (args) => AirwallexPaymentController.handlePaymentIntentWebhook(args)],
  [paymentAttemptWebhookEventNames, (args) => AirwallexPaymentController.handlePaymentAttemptWebhook(args)],
  [fundSplitWebhookEventNames, (args) => AirwallexPaymentController.handleFundSplitWebhook(args)],
  [paymentIntentReturnWebhookEventNames, (args) => AirwallexPaymentController.handlePaymentIntentReturnWebhook(args)],
  [offboardingWebhookEventNames, (args) => AirwallexPaymentController.handleOffboardingWebhook(args)],
  [directBankTransferWebhookEventNames, (args) => AirwallexDirectBankTransferController.handleDirectBankTransferWebhook(args)],
];

async function processGlobalWebhook({ payload, headers }) {
  if (!headers?.i18n) {
    i18n.setLocale("en");
    headers.i18n = i18n;
  }

  if (balanceImpactingWebhooks.includes(payload?.name)) {
    try {
      await AirwallexPaymentController.handleBalanceUpdateWebhook({
        payload,
        headers,
      });
    } catch (error) {
      console.error("Error handling balance update webhook:", error);
    }
  }

  const match = eventHandlers.find(([names]) => names.includes(payload?.name));
  if (!match) {
    console.log(
      "XXXXXX Airwallex global webhook event not matched Event name:",
      payload?.name,
    );
    return null;
  }

  return match[1]({ payload, headers });
}

export function startAirwallexGlobalWebhookWorker() {
  const worker = new Worker(
    AIRWALLEX_GLOBAL_WEBHOOK_QUEUE_NAME,
    async (job) => {
      console.log(
        `🔄 Processing Airwallex global webhook ${job.data?.payload?.name} (attempt ${job.attemptsMade + 1})`,
      );
      return processGlobalWebhook(job.data);
    },
    {
      connection,
      concurrency: 5,
    },
  );

  worker.on("failed", async (job, err) => {
    const attemptsAllowed = job?.opts?.attempts ?? 1;
    console.error(
      `❌ Airwallex global webhook ${job?.data?.payload?.name} attempt ${job?.attemptsMade}/${attemptsAllowed} failed:`,
      err?.message || err,
    );

    try {
      await WorkerErrorLogService.logJobFailure({
        queue: AIRWALLEX_GLOBAL_WEBHOOK_QUEUE_NAME,
        job,
        err,
      });
    } catch (logErr) {
      console.error("❌ Failed to log job failure:", logErr?.message || logErr);
    }

    if (job?.attemptsMade >= attemptsAllowed) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(err);
    }
  });

  worker.on("error", async (err) => {
    console.error("❌ Airwallex global webhook worker error:", err?.message || err);
    await WorkerErrorLogService.logWorkerError({
      queue: AIRWALLEX_GLOBAL_WEBHOOK_QUEUE_NAME,
      err,
    });
    process.env.SENTRY_ENABLED === "true" && Sentry.captureException(err);
  });

  console.log(
    `👷 Airwallex global webhook worker started (queue: ${AIRWALLEX_GLOBAL_WEBHOOK_QUEUE_NAME})`,
  );

  return worker;
}
