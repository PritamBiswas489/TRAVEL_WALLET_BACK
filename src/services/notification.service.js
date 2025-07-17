import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
const { Notification, Op, User } = db;
import PushNotificationService from "./pushNotification.service.js";
import TransferService from "./transfer.service.js";
import { getcurrencySymbols } from "../libraries/utility.js";
 

export default class NotificationService {

    static async walletTransferNotification(transferId, i18n) {
        TransferService.getTransferById(transferId, (error, result) => {
            if (error) {
            console.error("Error fetching transfer details:", error);
            return;
            }
            const senderId = result.data.senderId;
            const receiverId = result.data.receiverId;
            const amount = result.data.amount;
            const currency = result.data.currency;
            const transferJSONB = result.data.get({ plain: true });
            const senderName = result?.data?.sender?.name;
            const senderPhoneNumber = result?.data?.sender?.phoneNumber;
            const receiverName = result?.data?.receiver?.name;
            const receiverPhoneNumber = result?.data?.receiver?.phoneNumber;
            console.log({senderId, receiverId, amount, currency, senderName, senderPhoneNumber, receiverName, receiverPhoneNumber});
            console.log(transferJSONB);
            const currentLanguage = i18n.getLocale();
            const messageTitle = i18n.__("TRANSFER_NOTIFICATION_TITLE");
            const currencySymbol = getcurrencySymbols(currency) || currency;

            const messageBody =  i18n.__("TRANSFER_NOTIFICATION_BODY", { amount: String(amount) + currencySymbol, senderPhoneNumber, receiverPhoneNumber });
            console.log(messageTitle, messageBody);
            Notification.create({
                userId: receiverId,
                type: "TRANSFER",
                title: messageTitle,
                message: messageBody,
                metadata: transferJSONB,
            });
            
            PushNotificationService.sendNotification({
                userId:  receiverId,
                title: messageTitle,
                body: messageBody,
                data: {
                   transferId: String(result.data.id),
                   action:"TRANSFER",
                   amount: String(amount) + currencySymbol,
                   senderPhoneNumber,
                },
            },(error, response) => {
                if (error) {
                    console.error("Error sending push notification:", error);
                } else {
                    console.log("Push notification sent successfully:", response);
                }
            });
            console.log("Creating wallet transfer notification with data:", transferJSONB);
        });
    }
    static async walletTransferRejectionNotification(transferId, i18n) {
        TransferService.getTransferById(transferId, (error, result) => {
            if (error) {
            console.error("Error fetching transfer details:", error);
            return;
            }
            const senderId = result.data.senderId;
            const receiverId = result.data.receiverId;
            const amount = result.data.amount;
            const currency = result.data.currency;
            const transferJSONB = result.data.get({ plain: true });
            const senderName = result?.data?.sender?.name;
            const senderPhoneNumber = result?.data?.sender?.phoneNumber;
            const receiverName = result?.data?.receiver?.name;
            const receiverPhoneNumber = result?.data?.receiver?.phoneNumber;
            console.log({senderId, receiverId, amount, currency, senderName, senderPhoneNumber, receiverName, receiverPhoneNumber});
            console.log(transferJSONB);
            const currentLanguage = i18n.getLocale();
            const messageTitle = i18n.__("TRANSFER_REJECTION_NOTIFICATION_TITLE");
            const currencySymbol = getcurrencySymbols(currency) || currency;

            const messageBody =  i18n.__("TRANSFER_REJECTION_NOTIFICATION_BODY", { amount: String(amount) + currencySymbol,   receiverPhoneNumber });
            console.log(messageTitle, messageBody);
            Notification.create({
                userId: senderId,
                type: "TRANSFER_REJECTION",
                title: messageTitle,
                message: messageBody,
                metadata: transferJSONB,
            });
            
            PushNotificationService.sendNotification({
                userId:  senderId,
                title: messageTitle,
                body: messageBody,
                data: {
                   transferId: String(result.data.id),
                   action:"TRANSFER_REJECTION",
                   amount: String(amount) + currencySymbol,
                   receiverPhoneNumber,
                },
            },(error, response) => {
                if (error) {
                    console.log("Error sending push notification:", error?.message);
                } else {
                    console.log("Push notification sent successfully:", response);
                }
            });
            console.log("Creating wallet transfer notification with data:", transferJSONB);
        });
    }
    static async walletTransferAcceptanceNotification(transferId, i18n) {
         TransferService.getTransferById(transferId, (error, result) => {
            if (error) {
            console.error("Error fetching transfer details:", error);
            return;
            }
            const senderId = result.data.senderId;
            const receiverId = result.data.receiverId;
            const amount = result.data.amount;
            const currency = result.data.currency;
            const transferJSONB = result.data.get({ plain: true });
            const senderName = result?.data?.sender?.name;
            const senderPhoneNumber = result?.data?.sender?.phoneNumber;
            const receiverName = result?.data?.receiver?.name;
            const receiverPhoneNumber = result?.data?.receiver?.phoneNumber;
            console.log({senderId, receiverId, amount, currency, senderName, senderPhoneNumber, receiverName, receiverPhoneNumber});
            console.log(transferJSONB);
            const currentLanguage = i18n.getLocale();
            const messageTitle = i18n.__("TRANSFER_ACCEPTED_NOTIFICATION_TITLE");
            const currencySymbol = getcurrencySymbols(currency) || currency;

            const messageBody =  i18n.__("TRANSFER_ACCEPTED_NOTIFICATION_BODY", { amount: String(amount) + currencySymbol,   receiverPhoneNumber });
            console.log(messageTitle, messageBody);
            Notification.create({
                userId: senderId,
                type: "TRANSFER_ACCEPTED",
                title: messageTitle,
                message: messageBody,
                metadata: transferJSONB,
            });
            
            PushNotificationService.sendNotification({
                userId:  senderId,
                title: messageTitle,
                body: messageBody,
                data: {
                   transferId: String(result.data.id),
                   action:"TRANSFER_ACCEPTED",
                   amount: String(amount) + currencySymbol,
                   receiverPhoneNumber,
                },
            },(error, response) => {
                if (error) {
                    console.log("Error sending push notification:", error?.message);
                } else {
                    console.log("Push notification sent successfully:", response);
                }
            });
            console.log("Creating wallet transfer notification with data:", transferJSONB);
        });
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