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
    TransferService.getTransferById(transferId, async (error, result) => {
      if (error)
        return console.error("Error fetching transfer details:", error);

      const { senderId, receiverId, amount, currency, sender, receiver, id } =
        result.data;
      const transferJSONB = result.data.get({ plain: true });
      const currencySymbol = getcurrencySymbols(currency) || currency;
      const messageTitle = i18n.__("TRANSFER_NOTIFICATION_TITLE");
      const messageBody = i18n.__("TRANSFER_NOTIFICATION_BODY", {
        amount: String(amount) + currencySymbol,
        senderPhoneNumber: sender?.phoneNumber,
        receiverPhoneNumber: receiver?.phoneNumber,
      });

      const notificationData = await Notification.create({
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
            notificationId: String(notificationData?.id),
          },
        },
        (err, res) => {
          if (err) console.error("Error sending push notification:", err);
          else console.log("Push notification sent successfully:", res);
        }
      );

      //sending notification to sender
       const messageTitleSender =  i18n.__("TRANSFER_NOTIFICATION_TITLE_SENDER");
       const messageBodySender = i18n.__("TRANSFER_NOTIFICATION_BODY_SENDER", {
         amount: String(amount) + currencySymbol,
         senderPhoneNumber: sender?.phoneNumber,
         receiverPhoneNumber: receiver?.phoneNumber,
       });
       const sendNotificationData = await Notification.create({
        userId: senderId,
        type: "SENDER_TRANSFER",
        title: messageTitleSender,
        message: messageBodySender,
        metadata: transferJSONB,
      });


       PushNotificationService.sendNotification(
        {
          userId: senderId,
          title: messageTitleSender,
          body: messageBodySender,
          data: {
            transferId: String(id),
            action: "SENDER_TRANSFER",
            amount: String(amount) + currencySymbol,
            senderPhoneNumber: sender?.phoneNumber,
            receiverPhoneNumber: receiver?.phoneNumber,
            notificationId: String(sendNotificationData?.id),
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
    });
  }
static async walletTransferRejectionBySenderNotification(transferId, i18n, autoRejected = false) {
    TransferService.getTransferById(transferId, async (error, result) => {
      if (error)
        return console.error("Error fetching transfer details:", error);

      const { senderId, amount, currency, receiver } = result.data;
      const transferJSONB = result.data.get({ plain: true });
      const currencySymbol = getcurrencySymbols(currency) || currency;
      const messageTitle = i18n.__("TRANSFER_REJECTION_NOTIFICATION_TITLE_BY_SENDER");
      let messageBody = i18n.__("TRANSFER_REJECTION_NOTIFICATION_BODY_BY_SENDER", {
        amount: String(amount) + currencySymbol,
        receiverPhoneNumber: receiver?.phoneNumber,
      });
      if(autoRejected) {
        messageBody = i18n.__("TRANSFER_REJECTION_NOTIFICATION_BODY_AUTO", {
          amount: String(amount) + currencySymbol,
          receiverPhoneNumber: receiver?.phoneNumber,
        });
      }

      const notificationData = await Notification.create({
        userId: senderId,
        type: "TRANSFER_REJECTION_BY_SENDER",
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
            action: "TRANSFER_REJECTION_BY_SENDER",
            amount: String(amount) + currencySymbol,
            receiverPhoneNumber: receiver?.phoneNumber,
            notificationId: String(notificationData?.id),
          },
        },
        (err, res) => {
          if (err)
            console.log("Error sending push notification:", err?.message);
          else console.log("Push notification sent successfully:", res);
        }
      );
      console.log(
        "Creating wallet transfer notification with data:",
        transferJSONB
      );
    });
  }
  static async walletTransferRejectionNotification(transferId, i18n, autoRejected = false) {
    TransferService.getTransferById(transferId, async (error, result) => {
      if (error)
        return console.error("Error fetching transfer details:", error);

      const { senderId, amount, currency, receiver } = result.data;
      const transferJSONB = result.data.get({ plain: true });
      const currencySymbol = getcurrencySymbols(currency) || currency;
      const messageTitle = i18n.__("TRANSFER_REJECTION_NOTIFICATION_TITLE");
      let messageBody = i18n.__("TRANSFER_REJECTION_NOTIFICATION_BODY", {
        amount: String(amount) + currencySymbol,
        receiverPhoneNumber: receiver?.phoneNumber,
      });
      if(autoRejected) {
        messageBody = i18n.__("TRANSFER_REJECTION_NOTIFICATION_BODY_AUTO", {
          amount: String(amount) + currencySymbol,
          receiverPhoneNumber: receiver?.phoneNumber,
        });
      }

      const notificationData = await Notification.create({
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
            notificationId: String(notificationData?.id),
          },
        },
        (err, res) => {
          if (err)
            console.log("Error sending push notification:", err?.message);
          else console.log("Push notification sent successfully:", res);
        }
      );
      console.log(
        "Creating wallet transfer notification with data:",
        transferJSONB
      );
    });
  }
  
  static async walletTransferAcceptanceNotification(transferId, i18n) {
    TransferService.getTransferById(transferId, async (error, result) => {
      if (error)
        return console.error("Error fetching transfer details:", error);

      const { senderId, amount, currency, receiver } = result.data;
      const transferJSONB = result.data.get({ plain: true });
      const currencySymbol = getcurrencySymbols(currency) || currency;
      const messageTitle = i18n.__("TRANSFER_ACCEPTED_NOTIFICATION_TITLE");
      const messageBody = i18n.__("TRANSFER_ACCEPTED_NOTIFICATION_BODY", {
        amount: String(amount) + currencySymbol,
        receiverPhoneNumber: receiver?.phoneNumber,
      });

      const notificationData = await Notification.create({
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
            notificationId: String(notificationData?.id),
          },
        },
        (err, res) => {
          if (err)
            console.error("Error sending push notification:", err?.message);
          else console.log("Push notification sent successfully:", res);
        }
      );
      console.log(
        "Creating wallet transfer notification with data:",
        transferJSONB
      );
    });
  }
  static async transferRequestNotification(transferRequestId, i18n) {
    TransferRequestService.getTransferRequestById(
      transferRequestId,
      async (error, result) => {
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

        const notificationData = await Notification.create({
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
              notificationId: String(notificationData.id),
            },
          },
          (err, res) => {
            if (err) console.error("Error sending push notification:", err);
            else console.log("Push notification sent successfully:", res);
          }
        );
        //sender notification
        const messageTitleSender = i18n.__("TRANSFER_REQUEST_NOTIFICATION_TITLE_SENDER");
        const messageBodySender = i18n.__("TRANSFER_REQUEST_NOTIFICATION_BODY_SENDER", {
          amount: String(amount) + currencySymbol,
          senderPhoneNumber,
          receiverPhoneNumber,
        });
        const senderNotificationData = await Notification.create({
          userId: senderId,
          type: "SENDER_TRANSFER_REQUEST",
          title: messageTitleSender,
          message: messageBodySender,
          metadata: transferJSONB,
        });

        PushNotificationService.sendNotification(
          {
            userId: senderId,
            title: messageTitleSender,
            body: messageBodySender,
            data: {
              transferId: String(result.data.id),
              action: "SENDER_TRANSFER_REQUEST",
              amount: String(amount) + currencySymbol,
              receiverPhoneNumber,
              senderPhoneNumber,
              notificationId: String(senderNotificationData.id),
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
  static async transferRequestRejectionNotification(transferRequestId, i18n, autoRejected) {
    TransferRequestService.getTransferRequestById(
      transferRequestId,
      async (error, result) => {
        if (error)
          return console.error(
            "Error fetching transfer request details:",
            error
          );

        const { senderId, amount, currency, receiver } = result.data;
        const transferJSONB = result.data.get({ plain: true });
        const receiverPhoneNumber = receiver?.phoneNumber;
        const currencySymbol = getcurrencySymbols(currency) || currency;
        const messageTitle = i18n.__(
          "TRANSFER_REQUEST_REJECTION_NOTIFICATION_TITLE"
        );
        let messageBody = i18n.__(
          "TRANSFER_REQUEST_REJECTION_NOTIFICATION_BODY",
          {
            amount: String(amount) + currencySymbol,
            receiverPhoneNumber,
          }
        );
        if (autoRejected) {
          messageBody = i18n.__(
            "TRANSFER_REQUEST_AUTO_REJECTION_NOTIFICATION_BODY",
            {
              amount: String(amount) + currencySymbol,
              receiverPhoneNumber,
            }
          );
        }

        const notificationData = await Notification.create({
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
              notificationId: String(notificationData.id),
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

  static async transferRequestRejectionBySenderNotification(transferRequestId, i18n)  {
     TransferRequestService.getTransferRequestById(
      transferRequestId,
      async (error, result) => {
        if (error)
          return console.error(
            "Error fetching transfer request details:",
            error
          );

        const { senderId, amount, currency, receiver } = result.data;
        const transferJSONB = result.data.get({ plain: true });
        const receiverPhoneNumber = receiver?.phoneNumber;
        const currencySymbol = getcurrencySymbols(currency) || currency;
        const messageTitle = i18n.__(
          "SENDER_TRANSFER_REQUEST_REJECTION_NOTIFICATION_TITLE"
        );
        let messageBody = i18n.__(
          "SENDER_TRANSFER_REQUEST_REJECTION_NOTIFICATION_BODY",
          {
            amount: String(amount) + currencySymbol,
            receiverPhoneNumber,
          }
        );
        
        const notificationData = await Notification.create({
          userId: senderId,
          type: "SENDER_TRANSFER_REQUEST_REJECTION",
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
              action: "SENDER_TRANSFER_REQUEST_REJECTION",
              amount: String(amount) + currencySymbol,
              receiverPhoneNumber,
              notificationId: String(notificationData.id),
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
      async (error, result) => {
        if (error)
          return console.error(
            "Error fetching transfer request details:",
            error
          );

        const { senderId, amount, currency, receiver } = result.data;
        const transferJSONB = result.data.get({ plain: true });
        const receiverPhoneNumber = receiver?.phoneNumber;
        const currencySymbol = getcurrencySymbols(currency) || currency;
        const messageTitle = i18n.__(
          "TRANSFER_REQUEST_APPROVAL_NOTIFICATION_TITLE"
        );
        const messageBody = i18n.__(
          "TRANSFER_REQUEST_APPROVAL_NOTIFICATION_BODY",
          {
            amount: String(amount) + currencySymbol,
            receiverPhoneNumber,
          }
        );

        const notificationData = await Notification.create({
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
              notificationId: String(notificationData.id),
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
  static async markAsRead(userId, notificationId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        return null;
      }

      notification.isRead = true;
      await notification.save();

      return { ...notification.toJSON(), isRead: true };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return null;
    }
  }
  static async getLastUnreadNotification(userId) {
    try {
      const lastNotification = await Notification.findOne({
        where: { userId, isRead: false },
        order: [["createdAt", "DESC"]],
      });
      return lastNotification;
    } catch (error) {
      console.error("Error fetching last notification:", error);
      return null;
    }
  }
  static async markAllAsReads(userId) {
    try {
      const [updatedCount] = await Notification.update(
        { isRead: true },
        {
          where: { userId, isRead: false },
        }
      );
      return updatedCount > 0;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }
  static async countNotifications(userId) {
    try {
      const count = await Notification.count({
        where: { userId },
      });
      return count;
    } catch (error) {
      console.error("Error counting notifications:", error);
      return 0;
    }
  }
  static async countUnreadNotifications(userId) {
    try {
      const count = await Notification.count({
        where: { userId, isRead: false },
      });
      return count;
    } catch (error) {
      console.error("Error counting notifications:", error);
      return 0;
    }
  }
  static async getLastPendingTransferNotification(userId) {
    // console.log(
    //   "Fetching last pending transfer notification for user:",
    //   userId
    // );
    try {
      const notifications = await db.sequelize.query(
        `
      SELECT n.*, row_to_json(t.*) AS transfer
      FROM "notifications" n
      JOIN "transfer" t
        ON t.id = (n.metadata->>'id')::bigint AND t.status = 'pending'
      WHERE n."userId" = :userId AND n."isRead" = false AND n.type = 'TRANSFER'
      ORDER BY n."createdAt" DESC
      LIMIT 1
    `,
        {
          replacements: { userId },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );
      const { transfer, ...notificationWithoutTransfer } = notifications[0] || {};
      return { ...notificationWithoutTransfer, metadata: { ...notificationWithoutTransfer.metadata, status: transfer.status } };

    } catch (error) {
      console.error(
        "Error fetching last pending transfer notification:",
        error
      );
      return null;
    }
  }
  static async updatePendingTransferNotificationStatus(transferid, status) {
    try {
      const notification = await Notification.findOne({
        where: {
          type: "TRANSFER",
          isRead: false,
          metadata: {
            id: transferid,
          },
        },
       });
       const senderTransferNotification = await Notification.findOne({
         where: {
           type: "SENDER_TRANSFER",
           isRead: false,
           metadata: {
             id: transferid,
           },
         },
       });
       if (notification) {
         notification.set("metadata", { ...notification.metadata, status });
         await notification.save();
         
       }
       if (senderTransferNotification) {
         senderTransferNotification.set("metadata", { ...senderTransferNotification.metadata, status });
         await senderTransferNotification.save();
         
       }
       return { notification, senderTransferNotification };
    } catch (error) {
      console.error("Error fetching pending transfer notifications:", error);
      return null;
    }

  }
  static async updatePendingTransferRequestNotificationStatus(transferid, status) {
    try {
      const notification = await Notification.findOne({
        where: {
          type: "TRANSFER_REQUEST",
          isRead: false,
          metadata: {
            id: transferid,
          },
        },
       });
       const senderNotification  = await Notification.findOne({
         where: {
           type: "SENDER_TRANSFER_REQUEST",
           isRead: false,
           metadata: {
             id: transferid,
           },
         },
       });
       if(notification) {
        notification.set('metadata', { ...notification.metadata, status });
        await notification.save();
        return notification;
       }
       if(senderNotification) {
         senderNotification.set('metadata', { ...senderNotification.metadata, status });
         await senderNotification.save();
         return senderNotification;
       }
    } catch (error) {
      console.error("Error fetching pending transfer notifications:", error);
      return null;
    }

  }
}
