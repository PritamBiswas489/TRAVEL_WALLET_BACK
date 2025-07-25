import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import TransferRequestService from "../services/transferRequest.service.js";

export default class TransferRequestController {
  static async sendRequest(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const receiverId = payload.receiverId;
    const currency = payload.currency;
    const amount = payload.amount;
    const message = payload.message || "";

    return new Promise((resolve) => {
      TransferRequestService.executeTransferRequest(
        { senderUserId: user.id, receiverId, currency, amount, message, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "FAILED_TO_SEND_TRANSFER_REQUEST"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("TRANSFER_REQUEST_EXECUTED_SUCCESSFULLY"),
            error: null,
          });
        }
      );
    });
  }
  static async acceptRejectTransferRequest(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const transferRequestId = payload.transferRequestId;
    const status = payload.isAccepted === true ? "accepted" : "rejected";

    return new Promise((resolve) => {
      TransferRequestService.acceptRejectTransferRequest(
        { userId: user.id, transferRequestId, status, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "FAILED_TO_ACCEPT_REJECT_TRANSFER_REQUEST"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__(
              response.data.message || "TRANSFER_APPROVED_SUCCESSFULLY"
            ),
            error: null,
          });
        }
      );
    });
  }
  static async getTransferRequestHistory(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const page = payload.page || 1;
    const limit = payload.limit || 10;
    const filter = payload.filter || {};

    return new Promise((resolve) => {
      TransferRequestService.getTransferRequestHistory(
        { userId: user.id, page, limit, filter },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__("FAILED_TO_GET_TRANSFER_REQUEST_HISTORY"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("TRANSFER_REQUEST_HISTORY_RETRIEVED_SUCCESSFULLY"),
            error: null,
          });
        }
      );
    });
  }
    static async getTransferRequestById(request) {
        const {
        headers: { i18n },
        user,
        payload,
        } = request;
    
        const transferRequestId = payload.transferRequestId;
    
        return new Promise((resolve) => {
        TransferRequestService.getTransferRequestById(
            transferRequestId,
            (err, response) => {
            if (err) {
                return resolve({
                status: 400,
                data: null,
                error: {
                    message: i18n.__("FAILED_TO_GET_TRANSFER_REQUEST"),
                    reason: err.message,
                },
                });
            }
            return resolve({
                status: 200,
                data: response.data,
                message: i18n.__("TRANSFER_REQUEST_RETRIEVED_SUCCESSFULLY"),
                error: null,
            });
            }
        );
        });
    }
}
