import "../config/environment.js";
import db from "../databases/models/index.js";
import crypto from "crypto";
import UserService from "./user.service.js";
import * as Sentry from "@sentry/node";
import { generateUniqueCode } from "../libraries/utility.js";
const { UserOwnGeneratedQrCodes, User } = db;



export default class QrGenerateCodeService {
  static async generateUniqueCode(
    userId,
    mobile,
    field = "token",
    length = 6,
    attempt = 1,
  ) {
    return generateUniqueCode(
      UserOwnGeneratedQrCodes,
      userId,
      mobile,
      field,
      length,
      attempt,
    );
  }

  static async getPersonalQr(_params, callback) {
    try {
      const userId = _params.userId;
      const payload = _params.payload;
      const userDetails = await UserService.getUserDetails(userId);

      if (userDetails?.avatar) {
        userDetails.avatar = `${process.env.BASE_URL}/${userDetails.avatar}`;
      }
      const token = await this.generateUniqueCode(
        userId,
        userDetails?.phoneNumber,
      );
      console.log("Generated token:", token);
      const qrCodeData = await UserOwnGeneratedQrCodes.create({
        userId,
        token,
        paymentUrl: `${process.env.APP_PAY_URL}/${token}`,
        amount: null,
        currency: "ILS",
        amountType: "open",
      });
      return callback(null, {
        data: {
          payment_url: qrCodeData.paymentUrl,
          token: qrCodeData.token,
          amount: qrCodeData.amount,
          currency: qrCodeData.currency,
          amount_type: qrCodeData.amountType,
          recipient: {
            public_id: userDetails?.id,
            display_name: userDetails?.name || null,
            avatar: userDetails?.avatar || null,
          },
        },
      });
    } catch (e) {
      console.error("Error in getPersonalQr:", e);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return callback(new Error("INTERNAL_SERVER_ERROR"), null);
    }
  }

  static async createPaymentRequest(_params, callback) {
    try {
      const userId = _params.userId;
      const payload = _params.payload;
      const userDetails = await UserService.getUserDetails(userId);
      const { amount, currency } = payload || {};

      if (userDetails?.avatar) {
        userDetails.avatar = `${process.env.BASE_URL}/${userDetails.avatar}`;
      }
      const token = await this.generateUniqueCode(
        userId,
        userDetails?.phoneNumber,
      );
      console.log("Generated token:", token);
      const qrCodeData = await UserOwnGeneratedQrCodes.create({
        userId,
        token,
        paymentUrl: `${process.env.APP_PAY_URL}/${token}`,
        amount: amount ?? null,
        currency: currency ?? "ILS",
        amountType: "open",
      });
      return callback(null, {
        data: {
          payment_url: qrCodeData.paymentUrl,
          token: qrCodeData.token,
          amount: qrCodeData.amount,
          currency: qrCodeData.currency,
          amount_type: qrCodeData.amountType,
          recipient: {
            public_id: userDetails?.id,
            display_name: userDetails?.name || null,
            avatar: userDetails?.avatar || null,
          },
        },
      });
    } catch (e) {
      console.error("Error in createPaymentRequest:", e);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return callback(new Error("INTERNAL_SERVER_ERROR"), null);
    }
  }

  static async getPaymentLinkByToken(_params, callback) {
    try {
      const token = _params?.payload?.token || _params?.token || null;

      if (!token) {
        return callback(new Error("TOKEN_REQUIRED"), null);
      }

      const qrCodeData = await UserOwnGeneratedQrCodes.findOne({
        where: {
          token,
        },
      });

      if (!qrCodeData) {
        return callback(new Error("PAYMENT_LINK_NOT_FOUND"), null);
      }

      const userDetails = await UserService.getUserDetails(qrCodeData.userId);

      if (userDetails?.avatar) {
        userDetails.avatar = `${process.env.BASE_URL}/${userDetails.avatar}`;
      }

      return callback(null, {
        data: {
          payment_url: qrCodeData.paymentUrl,
          token: qrCodeData.token,
          amount: qrCodeData.amount,
          currency: qrCodeData.currency,
          amount_type: qrCodeData.amountType,
          recipient: {
            public_id: userDetails?.id || null,
            display_name: userDetails?.name || null,
            avatar: userDetails?.avatar || null,
          },
        },
      });
    } catch (e) {
      console.error("Error in getPaymentLinkByToken:", e);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return callback(new Error("INTERNAL_SERVER_ERROR"), null);
    }
  }
}
