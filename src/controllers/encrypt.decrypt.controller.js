import "../config/environment.js";
import { buildDecryptRequest } from "../services/crypto.server.js";
import { buildEncryptedRequest } from "../services/crypto.client.service.js";
import * as Sentry from "@sentry/node";

export default class EncryptDecryptController {
  static async encryptRequest(request) {
     const {
      payload,
      headers: { i18n },
      user,
    } = request;
    try {
      const response = await buildEncryptedRequest({ ...payload, loggedInUser: user });
      return {
        status: 200,
        data: response,
        message: "", 
        error: {},
      };
    } catch (e) {
      console.log("Encryption error:", e.message);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("ENCRYPTION_ERROR"), reason: e.message },
      };
    }
  }
    static async decryptRequest(request) {
      const {
        payload,
        headers: { i18n },
        user,
      } = request;
      try {
        const response = await buildDecryptRequest({ envelope: payload.envelope, sig: payload.sig});
        return {
          status: 200,
          data: response,
          message: "",
          error: {},
        };
      } catch (e) {
        console.log("Decryption error:", e.message);
        process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
        return {
          status: 500,
          data: [],
          error: { message: i18n.__("DECRYPTION_ERROR"), reason: e.message },
        };
      }
    }
}
