import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import TransferService from "../services/transfer.service.js";

export default class TransferController {
  static async checkReceiverStatus(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const mobileNumber = payload?.mobile;
    
    const userId = user?.id;
    const type = payload?.type;

    //console.log("Check Receiver Status Request", userId, mobileNumber);

    return new Promise((resolve) => {
      TransferService.checkReceiverStatus(
        { userId, mobileNumber,  type },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:  i18n.__(err.message || "FAILED_TO_CHECK_RECEIVER_STATUS"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("RECEIVER_STATUS_CHECKED_SUCCESSFULLY"),
            error: null,
          });
        }
      );
    });
  }
  static executeTransfer(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const receiverId = payload.receiverId;
    const currency = payload.currency;
    const amount = payload.amount;
    const message = payload?.message || ""  ;

    return new Promise((resolve) => {
      TransferService.executeTransfer(
        { senderUserId: user.id, receiverId, currency, amount, message, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "TRANSFER_FAILED"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("TRANSFER_EXECUTED_SUCCESSFULLY"),
            error: null,
          });
        }
      );
    });
  }
  static async acceptRejectTransfer(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const transferId = payload.transferId;
    const status = payload.isAccepted === true ? "accepted" : "rejected";

    return new Promise((resolve) => {
      TransferService.acceptRejectTransfer(
        { userId: user.id, transferId, status, i18n, autoRejected: false },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "FAILED_TO_ACCEPT_REJECT_TRANSFER"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__(
              response.data.message || "TRANSFER_STATUS_UPDATED_SUCCESSFULLY"
            ),
            error: null,
          });
        }
      );
    });
  }
  static async rejectTransferBySender(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const transferId = payload.transferId;

    return new Promise((resolve) => {
      TransferService.rejectTransferBySender(
        { userId: user.id, transferId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "FAILED_TO_REJECT_TRANSFER"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("TRANSFER_REJECTED_SUCCESSFULLY"),
            error: null,
          });
        }
      );
    });
  }
  static async getTransferHistory(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const page = payload.page || 1;
    const limit = payload.limit || 10;
    const filter = payload.filter || {};

    return new Promise((resolve) => {
      TransferService.getTransferHistory(
        { userId: user.id, page, limit, filter },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__("FAILED_TO_GET_TRANSFER_HISTORY"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("TRANSFER_HISTORY_RETRIEVED_SUCCESSFULLY"),
            error: null,
          });
        }
      );
    });
  }
  static async getTransferById(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const transferId = payload.transferId;

    return new Promise((resolve) => {
      TransferService.getTransferById(transferId, (err, response) => {
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
          message: i18n.__("TRANSFER_RETRIEVED_SUCCESSFULLY"),
          error: null,
        });
      });
    });
  }
}
