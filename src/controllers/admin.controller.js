import InterestRatesService from "../services/interestRates.service.js";
import * as Sentry from "@sentry/node";
import "../config/environment.js";
import TrackIpAddressDeviceIdService from "../services/trackIpAddressDeviceId.service.js";
export default class AdminController {
  static async getInstallmentPaymentInterestRates(request) {
    const { payload, headers: { i18n }, user } = request;
    try {
      const settings = await InterestRatesService.getInterestRates();
      if (settings.ERROR) {
        return {
          status: 500,
          data: [],
          error: {
            message: i18n.__("CATCH_ERROR"),
            reason: "Error fetching settings",
          },
        };
      }
      return {
        status: 200,
        data: settings.data,
        message: i18n.__("SETTINGS_FETCHED_SUCCESSFULLY"),
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
  static async addInstallmentPaymentInterestRates(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    try {
      Object.values(payload).forEach((setting) => {
        InterestRatesService.addInterestRate(setting.payment_number, setting.interest_rate);
      });
      return {
        status: 200,
        data: [],
        message: i18n.__("SETTINGS_UPDATED_SUCCESSFULLY"),
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
  static async getApiEndpointLogs(request) {
    const { payload, headers: { i18n }, user } = request;
    const page = parseInt(payload.page, 10) || 1;
    const limit = parseInt(payload.limit, 10) || 10;
    try {
      const logs = await TrackIpAddressDeviceIdService.getApiEndpointLogs({ page, limit });
      if (logs.ERROR) {
        return {
          status: 500,
          data: [],
          error: {
            message: i18n.__("CATCH_ERROR"),
            reason: "Error fetching API endpoint logs",
          },
        };
      }
      return {
        status: 200,
        data: logs.data,
        pagination: logs.pagination || { page, limit },
        message: i18n.__("API_LOGS_FETCHED_SUCCESSFULLY"),
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
