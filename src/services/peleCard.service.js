import "../config/environment.js";
import * as Sentry from "@sentry/node";
import axios from "axios";

export default class PeleCardService {
  static async ConvertToToken(data) {
    const reqData = {
      terminalNumber: process.env.PELECARD_TERMINAL_NUMBER,
      user: process.env.PELECARD_USER,
      password: process.env.PELECARD_PASSWORD,
      shopNumber: process.env.PELECARD_SHOP_NUMBER,
      creditCard: data?.cardNumber,
      creditCardDateMmYy: data?.creditCardDateMmYy.replace("/", ""),
      addFourDigits: "false",
    };

    try {
      const response = await axios.post(
        "https://gateway21.pelecard.biz/services/ConvertToToken",
        reqData,
        {
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
        }
      );

      return response?.data || {};
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        ERROR: 1,
      };
    }
  }
  static async getErrorMeaning(errorCode, lang) {
        const  endPoint = 'https://gateway20.pelecard.biz/services/GetErrorMessageHe';
        try {
            const response = await axios.post(endPoint, {
                terminalNumber: process.env.PELECARD_TERMINAL_NUMBER,
                user: process.env.PELECARD_USER,
                password: process.env.PELECARD_PASSWORD,
                shopNumber: process.env.PELECARD_SHOP_NUMBER,
                ErrorCode: errorCode
            }, {
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
            });
    
            return response.data ||  {};
        } catch (e) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
            return { ERROR: 1 };
        }

  }
}
