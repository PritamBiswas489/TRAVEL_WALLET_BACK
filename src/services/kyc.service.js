import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import crypto from "crypto";

export default class KycService {
  static async getSumSubAccessToken(userId, externalActionId) {
    try {
      const APP_TOKEN = process.env.SUMSUB_API_KEY; // Your token
      const SECRET_KEY = process.env.SUMSUB_API_SECRET; // ⚠️ Replace with your secret from Sumsub dashboard

      const URL_PATH = "/resources/accessTokens/sdk"; // Exact path, no domain
      const FULL_URL = process.env.SUMSUB_API_URL + URL_PATH;
      const body = {
        userId: "1",
        levelName: "id-and-liveness",
        applicantIdentifiers: {
          email: "string@example.com",
          phone: "+911234567890",
        },
        externalActionId: "action-001",
        ttlInSecs: 600,
      };
      const bodyJson = JSON.stringify(body);
      const ts = Math.floor(Date.now() / 1000);

      const stringToSign = `${ts}POST${URL_PATH}${bodyJson}`;

      const signature = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(stringToSign)
        .digest("hex");

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": APP_TOKEN,
        "X-App-Access-Sig": signature,
        "X-App-Access-Ts": ts,
      };
      const response = await axios.post(FULL_URL, bodyJson, { headers });
      if (response.data?.token) {
        return { token: response.data.token };
      } else {
        throw new Error("Failed to retrieve access token from SumSub");
      }
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { error: error.message };
    }
  }
}
