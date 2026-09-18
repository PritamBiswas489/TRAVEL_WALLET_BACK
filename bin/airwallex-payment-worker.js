import { startAirwallexPaymentIntentWorker } from "../src/workers/airwallexPaymentIntent.worker.js";
import { walletTransactionsUpdateWorker } from "../src/workers/airWallexWalletUpdateWorker.js";
startAirwallexPaymentIntentWorker();
walletTransactionsUpdateWorker();