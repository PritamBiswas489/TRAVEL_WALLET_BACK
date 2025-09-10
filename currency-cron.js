import CurrencyService from "./src/services/currency.service.js";
import "./src/config/environment.js";
// cronJob.js
import cron from "node-cron";
import * as Sentry from "@sentry/node";
import axios from "axios";
import CronTrackService from "./src/services/crontrack.service.js";
import { paymentCurrencies } from "./src/config/paymentCurrencies.js";
import { walletCurrencies } from "./src/config/walletCurrencies.js";

// Your scheduled task
export const updateCurrencyRates = async () => {
  try {
    const apiKey = process.env.FIXER_API_KEY;

    const response = await axios.get("http://data.fixer.io/api/latest", {
      params: {
        access_key: apiKey,
        symbols: [...Object.keys(paymentCurrencies), ...Object.keys(walletCurrencies)].join(","),
      },
    });

    const rates = response.data.rates;

    const currencies = [...Object.keys(paymentCurrencies), ...Object.keys(walletCurrencies)];
    const result = {};

    // EUR to each currency
    currencies.forEach((cur) => {
      result[`EUR_TO_${cur}`] = rates[cur];
      result[`${cur}_TO_EUR`] = 1 / rates[cur];
    });

    // Each pair conversion
    currencies.forEach((from) => {
      currencies.forEach((to) => {
      if (from !== to) {
        result[`${from}_TO_${to}`] = rates[to] / rates[from];
      }
      });
    });

    

    const insertOrUpdateCurrencyResult =
      await CurrencyService.insertOrUpdateCurrency(result);

      console.log("Currency rates update result:", insertOrUpdateCurrencyResult);
  } catch (error) {
    if (process.env.SENTRY_ENABLED === "true") {
      Sentry.captureException(error);
    }
  }
};

// Schedule the task to run every day at 1 AM

//  await updateCurrencyRates();

cron.schedule(
  "0 1 * * *", // Run at 1 AM daily
  async () => {
    console.log("[Cron] ⏰ Running scheduled job at 1 AM...");
    await updateCurrencyRates();
    await CronTrackService.addCronTrack("updateCurrencyRates");
  },
  {
    scheduled: true,
    timezone: process.env.TIMEZONE || "Asia/Bangkok",
  }
);