import db from "../databases/models/index.js";
import "../config/environment.js";
import axios from "axios";
import KycService from "../services/kyc.service.js";
import * as Sentry from "@sentry/node";
import UserService from "../services/user.service.js";
 

export default class KycController {
  static async createApplicant(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const userId = user?.id;
      
      const applicant = await KycService.createApplicant({
        userId
      });
      if (applicant.error) {
        return {
          status: 400,
          data: null,
          error: {
            message: i18n.__("APPLICANT_CREATION_ERROR"),
            reason: applicant.error,
          },
        };
      }
      if(applicant?.id){
         return {
          status: 200,
          data: applicant,
          message: i18n.__("APPLICANT_CREATION_SUCCESS"),
          error: {},
        };
      }else{
        throw new Error(i18n.__("APPLICANT_CREATION_ERROR"));
      }

  } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return {
        status: 500,
        data: null,
        error: {
          message: i18n.__("APPLICANT_CREATION_ERROR"),
          reason: error.message,
        },
      };
    }
  }
  static async getAccessToken(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    try {
      const userId = user?.id;
      const accessToken = await KycService.getSumSubAccessToken(userId);
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
  static async getUserKycData(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const userId = user?.id;
      const kycData = await UserService.getUserKycData(userId);
      if (kycData.error) {
        return {
          status: 400,
          data: null,
          error: {
            message: i18n.__("USER_KYC_DATA_ERROR"),
            reason: kycData.error,
          },
        };
      }

      return {
        status: 200,
        data: kycData,
        message: i18n.__("USER_KYC_DATA_SUCCESS"),
        error: {},
      };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return {
        status: 500,
        data: null,
        error: {
          message: i18n.__("USER_KYC_DATA_ERROR"),
          reason: error.message,
        },
      };
    }



  }
}
