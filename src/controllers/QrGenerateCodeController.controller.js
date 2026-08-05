import "../config/environment.js";
import QrGenerateCodeService from "../services/qrGenerateCode.service.js";

export default class QrGenerateCodeController {
  static async getPersonalQr(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id || 1;

    return new Promise((resolve) => {
      QrGenerateCodeService.getPersonalQr(
        { userId, payload, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "GET_PERSONAL_QR_FAILED"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("GET_PERSONAL_QR_SUCCESSFUL"),
            error: null,
          });
        }
      );
    });
  }

  static async createPaymentRequest(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id || 1;

    return new Promise((resolve) => {
      QrGenerateCodeService.createPaymentRequest(
        { userId, payload, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "CREATE_PAYMENT_REQUEST_FAILED"
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("CREATE_PAYMENT_REQUEST_SUCCESSFUL"),
            error: null,
          });
        }
      );
    });
  }

  static async getPaymentLinkByToken(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id || 1;

    return new Promise((resolve) => {
      QrGenerateCodeService.getPaymentLinkByToken(
        { userId, payload, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "GET_PAYMENT_LINK_FAILED"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("GET_PAYMENT_LINK_SUCCESSFUL"),
            error: null,
          });
        }
      );
    });
  }
}
