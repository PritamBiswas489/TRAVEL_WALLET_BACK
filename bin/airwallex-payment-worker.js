import { startAirwallexPaymentIntentWorker } from "../src/workers/airwallexPaymentIntent.worker.js";
import { walletTransactionsUpdateWorker } from "../src/workers/airWallexWalletUpdateWorker.js";
import { startAirWallexRefundWorker } from "../src/workers/airWallexRefundWorker.js";
startAirwallexPaymentIntentWorker();
walletTransactionsUpdateWorker();
startAirWallexRefundWorker();