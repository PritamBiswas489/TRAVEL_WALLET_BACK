import "../config/environment.js";
import ThaiPaymentService from "../services/thaiPayment.service.js";
import * as Sentry from "@sentry/node";
 
export default class ThaiPaymentController {
  static async validateQrCode({ headers, user, payload }) {
    const userId = user?.id || 1;
    const { qrCode } = payload;
    console.log("Validating QR code for user ID:", userId);
    console.log("Received QR code:", qrCode);
    return new Promise((resolve) => {
      ThaiPaymentService.validateQrCode(
        { qrCode, userId, headers },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: headers.i18n.__(err.message || "QR_CODE_VALIDATION_FAILED"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: headers.i18n.__("QR_CODE_VALIDATION_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
}
