import db from "../databases/models/index.js";
import "../config/environment.js";
import axios from "axios";
import KycService from "../services/kyc.service.js";

export default class KycController {
  static async getAccessToken(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    try {
      const userId = user?.id || 1;
      const externalActionId = 1;
      const accessToken = await KycService.getSumSubAccessToken(
        userId,
        externalActionId
      );
      if (accessToken.error) {
        return {
          status: 400,
          data: null,
          error: {
            message: i18n.__("SUMSUB_ACCESS_TOKEN_ERROR"),
            reason: accessToken.error,
          },
        };
      }

      return {
        status: 200,
        data: { accessToken: accessToken?.token ? accessToken.token : null },
        message: i18n.__("SUMSUB_ACCESS_TOKEN_SUCCESS"),
        error: {},
      };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return {
        status: 500,
        data: null,
        error: {
          message: i18n.__("SUMSUB_ACCESS_TOKEN_ERROR"),
          reason: error.message,
        },
      };
    }
  }
}
