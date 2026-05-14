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
    const { payload } = request;
    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexKycWebhook(
        { payload },
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
        }
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
        }
        );

      });
    }

}
