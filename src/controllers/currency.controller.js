import db from "../databases/models/index.js";
import "../config/environment.js";
import axios from "axios";
import CurrencyService from "../services/currency.service.js";
import * as Sentry from "@sentry/node";

export default class CurrencyController {
  static async fixerExchangeRates(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    

    try {
      const apiKey = process.env.FIXER_API_KEY;

      const response = await axios.get("http://data.fixer.io/api/latest", {
        params: {
          access_key: apiKey,
          symbols: "ILS,THB",
        },
      });

      const rates = response.data.rates;

      if (rates && rates.ILS && rates.THB) {
        // console.log("Exchange rates fetched successfully:", rates);

        const rate_ils_to_thb = rates.THB / rates.ILS;
        const rate_thb_to_ils = rates.ILS / rates.THB;

        const insertOrUpdateCurrencyResult =
          await CurrencyService.insertOrUpdateCurrency({
            ILS_TO_THB: rate_ils_to_thb,
            THB_TO_ILS: rate_thb_to_ils,
            EUR_TO_ILS: rates.ILS,
            EUR_TO_THB: rates.THB,
          });

        if (insertOrUpdateCurrencyResult?.ERROR) {
          return {
            status: 500,
            data: [],
            error: {
              message: i18n.__("CURRENCY_UPDATE_FAILED"),
              reason: insertOrUpdateCurrencyResult.ERROR,
            },
          };
        }

        return {
          status: 200,
          data: {
            ILS_TO_THB: rate_ils_to_thb,
            THB_TO_ILS: rate_thb_to_ils,
            EUR_TO_ILS: rates.ILS,
            EUR_TO_THB: rates.THB,
          },
          message: i18n.__("CURRENCY_UPDATED_SUCCESSFULLY"),
          error: {},
        };
      } else {
        return {
          status: 500,
          data: [],
          error: {
            message: i18n.__("RATES_NOT_AVAILABLE"),
            reason: "Invalid response from Fixer API",
          },
        };
      }
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }

  static async getCurrencyByCode(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    try {
      const { code } = payload;
      const currency = await CurrencyService.getCurrencyByCode(code);
      return {
        status: 200,
        data: currency.data || [],
        message: i18n.__("CURRENCY_RETRIEVED_SUCCESSFULLY"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }

  static async getAllCurrencies(request) {
     const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const currencies = await CurrencyService.getAllCurrencies();
      return {
        status: 200,
        data: currencies.data || [],
        message: i18n.__("CURRENCY_RETRIEVED_SUCCESSFULLY"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }
}
