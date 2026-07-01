import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import "../config/environment.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import AirwallexPaymentService from "../services/airwallexPayment.service.js";

export default class AirwallexPaymentController {
  static async createMerchantOrderIdRequestId(request) {
    const {
      payload,
      headers: { i18n, deviceLocation },
      user,
    } = request;

    const userId = user?.id || 1;

    const deviceLocationLatLng = deviceLocation || "";
    if (deviceLocationLatLng) {
      const [latitude, longitude] = deviceLocationLatLng.split(",");
      payload.latitude = latitude;
      payload.longitude = longitude;
    }

    return new Promise((resolve) => {
      AirwallexPaymentService.createMerchantOrderIdRequestId(
        { payload, userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message ||
                    "FAILED_TO_CREATE_MERCHANT_ORDER_ID_REQUEST_ID",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__(
              "MERCHANT_ORDER_ID_REQUEST_ID_CREATED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async airWallexCreateCustomerAccount(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    const userId = user?.id || 1;

    return new Promise((resolve) => {
      AirwallexPaymentService.airWallexCreateCustomerAccount(
        { payload, userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_CREATE_CUSTOMER_ACCOUNT",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("CUSTOMER_ACCOUNT_CREATED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async airwallexSubmitKycDocuments(request) {
    const {
      payload,
      headers: { i18n },
      user,
      files,
    } = request;

    const userId = user?.id || 1;

    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexSubmitKycDocuments(
        { payload, userId, i18n, files },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_SUBMIT_KYC_DOCUMENTS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("KYC_DOCUMENTS_SUBMITTED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async getAndUpdateAirWallexCustomerAccount(request) {
    const {
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;

    return new Promise((resolve) => {
      AirwallexPaymentService.getAndUpdateAirWallexCustomerAccount(
        { userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_UPDATE_CUSTOMER_ACCOUNT",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("CUSTOMER_ACCOUNT_UPDATED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async getAirWallexKycDetails(request) {
    const {
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.getAirWallexKycDetails(
        { userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "FAILED_TO_GET_KYC_DETAILS"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("KYC_DETAILS_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async airWallexAuthorizeAccount(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    const userId = user?.id || 1;

    return new Promise((resolve) => {
      AirwallexPaymentService.airWallexAuthorizeAccount(
        { payload, userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_AUTHORIZE_CUSTOMER_ACCOUNT",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("CUSTOMER_ACCOUNT_AUTHORIZED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async airwallexKycWebhook(request) {
    const { payload, headers } = request;
    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexKycWebhook(
        { payload, headers },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: err.message || "FAILED_TO_PROCESS_KYC_WEBHOOK",
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: "KYC Webhook processed successfully",
            error: null,
          });
        },
      );
    });
  }

  static async handlePaymentWebhook(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    console.log("Received webhook payload:", payload);

    await AirwallexPaymentService.handlePaymentWebhook({ payload });
    return {
      status: 200,
      message: "Webhook received",
      data: {},
      error: {},
    };
  }
  static async testModeUpdateAccountStatus(request) {
    const {
      payload,
      headers: { i18n },
    } = request;
    const { accountId, status } = payload;
    return new Promise((resolve) => {
      AirwallexPaymentService.testModeUpdateAccountStatus(
        { accountId, status, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: err.message || "FAILED_TO_UPDATE_ACCOUNT_STATUS",
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: "Account status updated successfully",
            error: null,
          });
        },
      );
    });
  }
  static async savedVerifiedKycDocuments(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.savedVerifiedKycDocuments(
        { userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: err.message || "FAILED_TO_SAVE_VERIFIED_KYC_DOCUMENTS",
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: "Verified KYC documents saved successfully",
            error: null,
          });
        },
      );
    });
  }
  static async sandboxAddDeposit(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    const {
      useId,
      globalAccountId,
      amount,
      payerBankname,
      payerCountry,
      payerName,
      reference,
      statementRef,
      status,
    } = payload;
    return new Promise((resolve) => {
      AirwallexPaymentService.sandboxAddDeposit(
        {
          userId,
          globalAccountId,
          amount,
          payerBankname,
          payerCountry,
          payerName,
          reference,
          statementRef,
          status,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: err.message || "FAILED_TO_ADD_DEPOSIT",
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: "Deposit added successfully",
            error: null,
          });
        },
      );
    });
  }

  static async getGlobalAccounts(request) {
    const {
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.getGlobalAccounts(
        { userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_GET_GLOBAL_ACCOUNTS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("GLOBAL_ACCOUNTS_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async getAccountBalance(request) {
    const {
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.getAccountBalance(
        { userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_GET_ACCOUNT_BALANCE",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("ACCOUNT_BALANCE_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async getTransactionHistory(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id;
    const { currency, from_post_at, to_post_at, page, page_size } =
      payload || {};
    return new Promise((resolve) => {
      AirwallexPaymentService.getTransactionHistory(
        {
          userId,
          i18n,
          currency,
          fromPostAt: from_post_at,
          toPostAt: to_post_at,
          page,
          pageSize: page_size ? parseInt(page_size, 10) : undefined,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_GET_TRANSACTION_HISTORY",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("TRANSACTION_HISTORY_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async getAirwallexTransferById(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id;
    const { transferId } = payload || {};
    return new Promise((resolve) => {
      AirwallexPaymentService.getAirwallexTransferById(
        {
          userId,
          transferId,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_GET_TRANSFER_DETAILS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("TRANSFER_DETAILS_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async airwallexConnectedTransferWebhook(request) {
    const { payload } = request;
    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexConnectedTransferWebhook(
        payload,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:
                  err.message || "FAILED_TO_PROCESS_CONNECTED_TRANSFER_WEBHOOK",
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: "Connected transfer webhook processed successfully",
            error: null,
          });
        },
      );
    });
  }

  static async testModeTransferBetweenConnectedAccounts(request) {
      const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.testModeTransferBetweenConnectedAccounts(
        {
          userId,
          payload,
          i18n,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_TRANSFER_BETWEEN_CONNECTED_ACCOUNTS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("TRANSFER_BETWEEN_CONNECTED_ACCOUNTS_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
  static async updateUserTransactionHistoryTable(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.updateUserTransactionHistoryTable(
        { userId },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_UPDATE_TRANSACTION_HISTORY",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("TRANSACTION_HISTORY_UPDATED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async getWalletTransactionHistory(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id;
    const { page, limit, filter } = payload || {};
    return new Promise((resolve) => {
      AirwallexPaymentService.getWalletTransactionHistory(
        {
          userId,
          page,
          limit,
          filter,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_GET_WALLET_TRANSACTION_HISTORY",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("WALLET_TRANSACTION_HISTORY_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async handleDepositWebhook(request) {
    const { payload, headers } = request;
    return new Promise((resolve) => {
      AirwallexPaymentService.handleDepositWebhook(
        payload, headers, 
        (err, response) => {

          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: err.message || "FAILED_TO_PROCESS_DEPOSIT_WEBHOOK",
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: "Deposit webhook processed successfully",
            error: null,
          });
        }
      );
    });
  }
  static async airwallexQrPaymentTransferToPlatformWallet(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexQrPaymentTransferToPlatformWallet(
        {
          userId,
          payload,
          i18n,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_TRANSFER_TO_PLATFORM_WALLET",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("TRANSFER_TO_PLATFORM_WALLET_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
   
  static async airwallexQrPaymentRefundFromPlatformWalletToConnectedAccount(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexQrPaymentRefundFromPlatformWalletToConnectedAccount(
        {
          userId,
          payload,
          i18n,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_REFUND_FROM_PLATFORM_WALLET_TO_CONNECTED_ACCOUNT",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("REFUND_FROM_PLATFORM_WALLET_TO_CONNECTED_ACCOUNT_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }
  static async getAirwallexQrPaymentDetails(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id;
    const { id } = payload || {};
    return new Promise((resolve) => {
      AirwallexPaymentService.getAirwallexQrPaymentDetails(
        {
          userId,
          chargeId: id,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_GET_QR_PAYMENT_DETAILS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("QR_PAYMENT_DETAILS_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async handleAirwallexChargesWebhook(request) {
    const { payload } = request;
    return new Promise((resolve) => {
      AirwallexPaymentService.handleAirwallexChargesWebhook(
        payload,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: err.message || "FAILED_TO_PROCESS_AIRWALLEX_CHARGES_WEBHOOK",
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: "Airwallex charges webhook processed successfully",
            error: null,
          });
        }
      );
    });
  }

}
