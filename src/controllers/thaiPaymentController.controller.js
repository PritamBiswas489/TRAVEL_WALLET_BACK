import "../config/environment.js";
import ThaiPaymentService from "../services/thaiPayment.service.js";
import * as Sentry from "@sentry/node";
import { buildDecryptRequest } from "../services/crypto.server.js";
import { buildAes256GcmEncryptRequest } from "../services/crypto.client.service.js";
import FavouriteQrCodeService from "../services/favouriteQrCode.service.js";

export default class ThaiPaymentController {
  static async getpaymentQueryData({ headers, user, payload }) {
    const userId = user?.id;
    const { qrCode, amount } = payload;
    console.log("Validating QR code for user ID:", userId);
    console.log("Received QR code:", qrCode);
    return new Promise((resolve) => {
      ThaiPaymentService.getpaymentQueryData(
        { qrCode, amount, userId, headers },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: headers.i18n.__(
                  err.message || "QR_CODE_VALIDATION_FAILED",
                ),
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
  // This method is currently a placeholder. You can implement it based on your specific requirements for fetching payment query data related to crypto payments.
  static async cryptoGetpaymentQueryData(request) {
    const { headers, user, payload } = request;
    const { envelope, sig } = payload;
    const userId = user?.id;
    const decryptRequest = await buildDecryptRequest({ envelope, sig });
    if (decryptRequest?.error) {
      return {
        status: 400,
        data: null,
        error: {
          message: i18n.__(decryptRequest.error || "PAYMENT_VALIDATION_FAILED"),
          reason: "Encryption failed",
        },
      };
    }
    const { qrCode, amount } = decryptRequest;
    console.log("Validating QR code for user ID:", userId);
    console.log("Received QR code:", qrCode);
    return new Promise((resolve) => {
      ThaiPaymentService.getpaymentQueryData(
        { qrCode, amount, userId, headers },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: headers.i18n.__(
                  err.message || "QR_CODE_VALIDATION_FAILED",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: buildAes256GcmEncryptRequest(response.data),
            message: headers.i18n.__("QR_CODE_VALIDATION_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
  static async processTransfer({ headers, user, payload }) {
    const userId = user?.id;

    const deviceLocationLatLng = headers.deviceLocation || "";
    console.log("Device location from headers:", deviceLocationLatLng);
    if (deviceLocationLatLng) {
      const [latitude, longitude] = deviceLocationLatLng.split(",");
      payload.latitude = latitude;
      payload.longitude = longitude;
    }

    return new Promise((resolve) => {
      ThaiPaymentService.processTransfer(
        { payload, userId, headers },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: headers.i18n.__(
                  err.message || "TRANSFER_PROCESSING_FAILED",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: headers.i18n.__("TRANSFER_PROCESSING_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
  static async cryptoProcessTransfer(request) {
    const { headers, user, payload } = request;
    const { envelope, sig } = payload;
    const userId = user?.id;
    const decryptRequest = await buildDecryptRequest({ envelope, sig });
    if (decryptRequest?.error) {
      return {
        status: 400,
        data: null,
        error: {
          message: i18n.__(decryptRequest.error || "PAYMENT_VALIDATION_FAILED"),
          reason: "Encryption failed",
        },
      };
    }

    const deviceLocationLatLng = headers.deviceLocation || "";
    console.log("Device location from headers:", deviceLocationLatLng);
    if (deviceLocationLatLng) {
      const [latitude, longitude] = deviceLocationLatLng.split(",");
      decryptRequest.latitude = latitude;
      decryptRequest.longitude = longitude;
    }

    return new Promise((resolve) => {
      ThaiPaymentService.processTransfer(
        { payload: decryptRequest, userId, headers },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: headers.i18n.__(
                  err.message || "TRANSFER_PROCESSING_FAILED",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: buildAes256GcmEncryptRequest(response.data),
            message: headers.i18n.__("TRANSFER_PROCESSING_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
  static async confirmTransfer({ headers, user, payload }) {
    const userId = user?.id;
    return new Promise((resolve) => {
      ThaiPaymentService.confirmTransfer(
        { payload, userId, headers },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: headers.i18n.__(
                  err.message || "TRANSFER_CONFIRMATION_FAILED",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: headers.i18n.__("TRANSFER_CONFIRMATION_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
  static async getTransferDetails({ headers, user, payload }) {
    const userId = user?.id;
    return new Promise((resolve) => {
      ThaiPaymentService.getTransferDetails(
        { payload, userId, headers },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: headers.i18n.__(
                  err.message || "TRANSFER_DETAILS_FETCH_FAILED",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: headers.i18n.__("TRANSFER_DETAILS_FETCH_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
  static async deactivateWallet({ headers, user, payload }) {
    return new Promise((resolve) => {
      ThaiPaymentService.deactivateWallet(
        { payload, headers },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: headers.i18n.__(
                  err.message || "WALLET_DEACTIVATION_FAILED",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: headers.i18n.__("WALLET_DEACTIVATION_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
  static async markTransactionAsFavorite(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const userId = user?.id || 1;

    payload.country = "TH";
    return new Promise((resolve) => {
      FavouriteQrCodeService.addFavouriteQrCode(
        { userId, payload, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "MARK_TRANSACTION_AS_FAVORITE_FAILED",
                ),
                reason: err.message,
              },
            });
          }

          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("MARK_TRANSACTION_AS_FAVORITE_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
  static async getExpensesTransactions(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const userId = user?.id || 1;

    return new Promise((resolve) => {
      ThaiPaymentService.getExpensesTransactions(
        { payload, userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "GET_EXPENSES_TRANSACTIONS_FAILED",
                ),
                reason: err.message,
              },
            });
          }

          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("GET_EXPENSES_TRANSACTIONS_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
  static async getExpensesReport(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const userId = user?.id || 1;

    return new Promise((resolve) => {
      ThaiPaymentService.getExpensesReport(
        { payload, userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "GET_EXPENSES_REPORT_FAILED"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("GET_EXPENSES_REPORT_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
}
