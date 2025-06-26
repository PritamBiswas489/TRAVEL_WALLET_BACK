import InterestRatesService from "../services/interestRates.service.js";
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
}
