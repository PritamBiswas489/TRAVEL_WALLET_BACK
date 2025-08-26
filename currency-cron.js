import CurrencyService from "./src/services/currency.service.js";
import "./src/config/environment.js";
// cronJob.js
import cron from "node-cron";
import * as Sentry from "@sentry/node";
import axios from "axios";
import CronTrackService from "./src/services/crontrack.service.js";

// Your scheduled task
export const updateCurrencyRates = async () => {
  try {
    const apiKey = process.env.FIXER_API_KEY;

    const response = await axios.get("http://data.fixer.io/api/latest", {
      params: {
        access_key: apiKey,
        symbols: "ILS,THB,USD",
      },
    });

    const rates = response.data.rates;

    if (rates && rates.ILS && rates.THB && rates.USD) {
      // console.log("Exchange rates fetched successfully:", rates);

      const rate_ils_to_thb = rates.THB / rates.ILS;
      const rate_thb_to_ils = rates.ILS / rates.THB;
      const rate_usd_to_ils = rates.ILS / rates.USD;
      const rate_usd_to_thb = rates.THB / rates.USD;
      const rate_thb_to_usd = rates.USD / rates.THB;
      const rate_ils_to_usd = rates.USD / rates.ILS;
      const rate_thb_to_eur = 1 / rates.THB;

      const insertOrUpdateCurrencyResult =
        await CurrencyService.insertOrUpdateCurrency({
          ILS_TO_THB: rate_ils_to_thb,
          THB_TO_ILS: rate_thb_to_ils,
          EUR_TO_ILS: rates.ILS,
          EUR_TO_THB: rates.THB,
          USD_TO_ILS: rate_usd_to_ils,
          USD_TO_THB: rate_usd_to_thb,
          THB_TO_USD: rate_thb_to_usd,
          ILS_TO_USD: rate_ils_to_usd,
          EUR_TO_USD: rates.USD,
          THB_TO_EUR: rate_thb_to_eur,
        });
    }
  } catch (error) {
    if (process.env.SENTRY_ENABLED === "true") {
      Sentry.captureException(error);
    }
  }
};

// Schedule the task to run every day at 1 AM



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