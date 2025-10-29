import "../config/environment.js";
import KessPayApiService from "../services/kesspayApi.service.js";

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
}
