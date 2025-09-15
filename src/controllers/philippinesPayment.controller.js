import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import PisoPayApiService from "../services/pisoPayApi.service.js";
import PhilippinesPaymentService from "../services/philippinesPayment.service.js";

export default class PhilippinesPaymentController {
  static async getToken() {
    const responseToken = await PisoPayApiService.login();
    if (responseToken?.token) {
      return { status: 200, data: responseToken, message: "", error: {} };
    } else {
      return {
        status: 500,
        error: "Unable to retrieve token",
        data: {},
        message: "",
      };
    }
  }
  static async validatePisoPayTransaction(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const qrCode = payload?.qrCode || null;

    return new Promise((resolve) => {
      PisoPayApiService.validateTransaction(
        { qrCode, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "PAYMENT_VALIDATION_FAILED"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: (response.data),
            message: i18n.__("PAYMENT_VALIDATION_SUCCESSFUL"),
            error: null,
          });
        }
      );
    });
  }

  static async initiatePisoPayTransaction(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const qrCode = payload?.qrCode || null;
    const amount = payload?.amount || null;

    return new Promise((resolve) => {
      PisoPayApiService.initiateTransaction(
        { qrCode, amount, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "PAYMENT_INITIATION_FAILED"),
                reason: err.message,
              },
            });
          }
          PhilippinesPaymentService.trackTransaction(response.data);
          return resolve({
            status: 200,
            data: (response.data),
            message: i18n.__("PAYMENT_INITIATION_SUCCESSFUL"),
            error: null,
          });
        }
      );
    });
  }

  
  static async callbackTransaction(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    if(payload?.transaction_info_code){
        await PhilippinesPaymentService.updateTransactionStatus(payload);
    }
  }
}