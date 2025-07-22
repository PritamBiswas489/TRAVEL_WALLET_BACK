import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
const { Notification, Op, User } = db;
import PushNotificationService from "./pushNotification.service.js";
import TransferService from "./transfer.service.js";
import { getcurrencySymbols } from "../libraries/utility.js";
import TransferRequestService from "./transferRequest.service.js";

export default class NotificationService {
static async walletTransferNotification(transferId, i18n) {
    TransferService.getTransferById(transferId, (error, result) => {
        if (error) return console.error("Error fetching transfer details:", error);

        const { senderId, receiverId, amount, currency, sender, receiver, id } = result.data;
        const transferJSONB = result.data.get({ plain: true });
        const currencySymbol = getcurrencySymbols(currency) || currency;
        const messageTitle = i18n.__("TRANSFER_NOTIFICATION_TITLE");
        const messageBody = i18n.__("TRANSFER_NOTIFICATION_BODY", {
            amount: String(amount) + currencySymbol,
            senderPhoneNumber: sender?.phoneNumber,
            receiverPhoneNumber: receiver?.phoneNumber,
        });

        Notification.create({
            userId: receiverId,
            type: "TRANSFER",
            title: messageTitle,
            message: messageBody,
            metadata: transferJSONB,
        });

        PushNotificationService.sendNotification(
            {
                userId: receiverId,
                title: messageTitle,
                body: messageBody,
                data: {
                    transferId: String(id),
                    action: "TRANSFER",
                    amount: String(amount) + currencySymbol,
                    senderPhoneNumber: sender?.phoneNumber,
                },
            },
            (err, res) => {
                if (err) console.error("Error sending push notification:", err);
                else console.log("Push notification sent successfully:", res);
            }
        );
        console.log("Creating wallet transfer notification with data:", transferJSONB);
    });
}
  
static async walletTransferRejectionNotification(transferId, i18n) {
    TransferService.getTransferById(transferId, (error, result) => {
        if (error) return console.error("Error fetching transfer details:", error);

        const { senderId, amount, currency, receiver } = result.data;
        const transferJSONB = result.data.get({ plain: true });
        const currencySymbol = getcurrencySymbols(currency) || currency;
        const messageTitle = i18n.__("TRANSFER_REJECTION_NOTIFICATION_TITLE");
        const messageBody = i18n.__("TRANSFER_REJECTION_NOTIFICATION_BODY", {
            amount: String(amount) + currencySymbol,
            receiverPhoneNumber: receiver?.phoneNumber,
        });

        Notification.create({
            userId: senderId,
            type: "TRANSFER_REJECTION",
            title: messageTitle,
            message: messageBody,
            metadata: transferJSONB,
        });

        PushNotificationService.sendNotification(
            {
                userId: senderId,
                title: messageTitle,
                body: messageBody,
                data: {
                    transferId: String(result.data.id),
                    action: "TRANSFER_REJECTION",
                    amount: String(amount) + currencySymbol,
                    receiverPhoneNumber: receiver?.phoneNumber,
                },
            },
            (err, res) => {
                if (err) console.log("Error sending push notification:", err?.message);
                else console.log("Push notification sent successfully:", res);
            }
        );
        console.log("Creating wallet transfer notification with data:", transferJSONB);
    });
}
static async walletTransferAcceptanceNotification(transferId, i18n) {
    TransferService.getTransferById(transferId, (error, result) => {
        if (error) return console.error("Error fetching transfer details:", error);

        const { senderId, amount, currency, receiver } = result.data;
        const transferJSONB = result.data.get({ plain: true });
        const currencySymbol = getcurrencySymbols(currency) || currency;
        const messageTitle = i18n.__("TRANSFER_ACCEPTED_NOTIFICATION_TITLE");
        const messageBody = i18n.__("TRANSFER_ACCEPTED_NOTIFICATION_BODY", {
            amount: String(amount) + currencySymbol,
            receiverPhoneNumber: receiver?.phoneNumber,
        });

        Notification.create({
            userId: senderId,
            type: "TRANSFER_ACCEPTED",
            title: messageTitle,
            message: messageBody,
            metadata: transferJSONB,
        });

        PushNotificationService.sendNotification(
            {
                userId: senderId,
                title: messageTitle,
                body: messageBody,
                data: {
                    transferId: String(result.data.id),
                    action: "TRANSFER_ACCEPTED",
                    amount: String(amount) + currencySymbol,
                    receiverPhoneNumber: receiver?.phoneNumber,
                },
            },
            (err, res) => {
                if (err) console.error("Error sending push notification:", err?.message);
                else console.log("Push notification sent successfully:", res);
            }
        );
        console.log("Creating wallet transfer notification with data:", transferJSONB);
    });
}
  static async transferRequestNotification(transferRequestId, i18n) {
    TransferRequestService.getTransferRequestById(
      transferRequestId,
      (error, result) => {
        if (error)
          return console.error("Error fetching transfer details:", error);

        const { senderId, receiverId, amount, currency } = result.data;
        const transferJSONB = result.data.get({ plain: true });
        const senderPhoneNumber = result?.data?.sender?.phoneNumber;
        const receiverPhoneNumber = result?.data?.receiver?.phoneNumber;
        const currencySymbol = getcurrencySymbols(currency) || currency;
        const messageTitle = i18n.__("TRANSFER_REQUEST_NOTIFICATION_TITLE");
        const messageBody = i18n.__("TRANSFER_REQUEST_NOTIFICATION_BODY", {
          amount: String(amount) + currencySymbol,
          senderPhoneNumber,
          receiverPhoneNumber,
        });

        Notification.create({
          userId: receiverId,
          type: "TRANSFER_REQUEST",
          title: messageTitle,
          message: messageBody,
          metadata: transferJSONB,
        });

        PushNotificationService.sendNotification(
          {
            userId: receiverId,
            title: messageTitle,
            body: messageBody,
            data: {
              transferId: String(result.data.id),
              action: "TRANSFER_REQUEST",
              amount: String(amount) + currencySymbol,
              senderPhoneNumber,
            },
          },
          (err, res) => {
            if (err) console.error("Error sending push notification:", err);
            else console.log("Push notification sent successfully:", res);
          }
        );

        console.log(
          "Creating wallet transfer notification with data:",
          transferJSONB
        );
      }
    );
  }
  static async transferRequestRejectionNotification(transferRequestId, i18n) {
    TransferRequestService.getTransferRequestById(
      transferRequestId,
      (error, result) => {
        if (error)
          return console.error("Error fetching transfer request details:", error);

        const { senderId, amount, currency, receiver } = result.data;
        const transferJSONB = result.data.get({ plain: true });
        const receiverPhoneNumber = receiver?.phoneNumber;
        const currencySymbol = getcurrencySymbols(currency) || currency;
        const messageTitle = i18n.__("TRANSFER_REQUEST_REJECTION_NOTIFICATION_TITLE");
        const messageBody = i18n.__("TRANSFER_REQUEST_REJECTION_NOTIFICATION_BODY", {
          amount: String(amount) + currencySymbol,
          receiverPhoneNumber,
        });

        Notification.create({
          userId: senderId,
          type: "TRANSFER_REQUEST_REJECTION",
          title: messageTitle,
          message: messageBody,
          metadata: transferJSONB,
        });

        PushNotificationService.sendNotification(
          {
            userId: senderId,
            title: messageTitle,
            body: messageBody,
            data: {
              transferId: String(result.data.id),
              action: "TRANSFER_REQUEST_REJECTION",
              amount: String(amount) + currencySymbol,
              receiverPhoneNumber,
            },
          },
          (err, res) => {
            if (err) console.error("Error sending push notification:", err);
            else console.log("Push notification sent successfully:", res);
          }
        );

        console.log(
          "Creating wallet transfer request rejection notification with data:",
          transferJSONB
        );
      }
    );


  }

  static async transferRequestApprovalNotification(transferRequestId, i18n) {
    TransferRequestService.getTransferRequestById(
      transferRequestId,
      (error, result) => {
        if (error)
          return console.error("Error fetching transfer request details:", error);

        const { senderId, amount, currency, receiver } = result.data;
        const transferJSONB = result.data.get({ plain: true });
        const receiverPhoneNumber = receiver?.phoneNumber;
        const currencySymbol = getcurrencySymbols(currency) || currency;
        const messageTitle = i18n.__("TRANSFER_REQUEST_APPROVAL_NOTIFICATION_TITLE");
        const messageBody = i18n.__("TRANSFER_REQUEST_APPROVAL_NOTIFICATION_BODY", {
          amount: String(amount) + currencySymbol,
          receiverPhoneNumber,
        });

        Notification.create({
          userId: senderId,
          type: "TRANSFER_REQUEST_APPROVAL",
          title: messageTitle,
          message: messageBody,
          metadata: transferJSONB,
        });

        PushNotificationService.sendNotification(
          {
            userId: senderId,
            title: messageTitle,
            body: messageBody,
            data: {
              transferId: String(result.data.id),
              action: "TRANSFER_REQUEST_APPROVAL",
              amount: String(amount) + currencySymbol,
              receiverPhoneNumber,
            },
          },
          (err, res) => {
            if (err) console.error("Error sending push notification:", err);
            else console.log("Push notification sent successfully:", res);
          }
        );

        console.log(
          "Creating wallet transfer request approval notification with data:",
          transferJSONB
        );
      }
    );

  }

  static async getNotifications(userId, page, limit) {
    try {
      const notifications = await Notification.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit,
        offset: (page - 1) * limit,
      });
      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }
}
