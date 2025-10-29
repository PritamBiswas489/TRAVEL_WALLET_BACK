import "../config/environment.js";
import * as Sentry from "@sentry/node";
import axios from "axios";

export default class KessPayApiService {
  static async accessToken() {
    try {
      const response = await axios.post(
        `${process.env.KESSPAY_API_URL}/oauth/token`,
        {
          grant_type: "password",
          client_id: process.env.KESSPAY_CLIENT_ID,
          client_secret: process.env.KESSPAY_CLIENT_SECRET,
          username: process.env.KESSPAY_USERNAME,
          password: process.env.KESSPAY_PASSWORD,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (e) {
      console.log("PisoPay access token error:", e.message);
      if (process.env.SENTRY_ENABLED === "true") {
        Sentry.captureException(e);
      }
      throw e;
    }
  }
}
