import "../config/environment.js";
import KessPayApiService from "../services/kesspayApi.service.js";
import CambodiaPaymentService from "../services/cambodiaPayment.service.js";

export default class CambodiaPaymentController {
  static async getToken() {
    const responseToken = await KessPayApiService.accessToken();
    if (responseToken?.access_token) {
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
  //decode KHQR
  static async decodeKHQR(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const qrCode = payload?.qrcode || null;
    const responseToken = await KessPayApiService.accessToken();
    if (!responseToken?.access_token) {
      return {
        status: 500,
        error: "Unable to retrieve token",
        data: {},
        message: "",
      };
    }

    return new Promise((resolve) => {
      KessPayApiService.decodeKHQR(
        { token: responseToken?.access_token, qrCode, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "DECODE_QRCODE_FAILED"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("DECODE_QRCODE_SUCCESSFUL"),
            error: null,
          });
        }
      );
    });
  }
  //Buy Expense
  static async buyExpense(request) {
    const {
      headers: { i18n, deviceLocation },
      user,
      payload,
    } = request;

    const userId = user?.id || 1;

    const deviceLocationLatLng = deviceLocation || "";
    console.log("Device location from headers:", deviceLocationLatLng);
    if (deviceLocationLatLng) {
      const [latitude, longitude] = deviceLocationLatLng.split(",");
      payload.latitude = latitude;
      payload.longitude = longitude;
    }

    console.log(
      "Buying expense with payload:",
      payload,
      "for user ID:",
      userId
    );

    return new Promise((resolve) => {
      CambodiaPaymentService.buyExpense(
        { payload, userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "BUY_EXPENSE_FAILED"),
                reason: err.message,
              },
            });
          }

          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("BUY_EXPENSE_SUCCESSFUL"),
            error: null,
          });
        }
      );
    });
  }
}
