import { startAirwallexPaymentIntentWorker } from "../src/workers/airwallexPaymentIntent.worker.js";
import { walletTransactionsUpdateWorker } from "../src/workers/airWallexWalletUpdateWorker.js";
import { startAirWallexRefundWorker } from "../src/workers/airWallexRefundWorker.js";
import { startPushNotificationWorker } from "../src/workers/pushNotification.worker.js";
startAirwallexPaymentIntentWorker();
walletTransactionsUpdateWorker();
startAirWallexRefundWorker();
startPushNotificationWorker();