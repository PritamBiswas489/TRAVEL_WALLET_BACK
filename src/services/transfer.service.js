import db from "../databases/models/index.js";

import "../config/environment.js";
import * as Sentry from "@sentry/node";
import UserService from "./user.service.js";
const { Op, User, Transfer, WalletTransaction, UserWallet } = db;
import { handleCallback } from "../libraries/utility.js";
import NotificationService from "./notification.service.js";

export default class TransferService {
  static async checkReceiverStatus({ userId, mobileNumber }, callback) {
    console.log("Check Receiver Status", userId, mobileNumber);
    try {
      const user = await User.findOne({
        where: {
          phoneNumber: mobileNumber,
        },
        attributes: ["id"],
      });
     

      if (!user?.id) {
        console.log("No user found with the selected mobile number");
        return callback(
          new Error("NO_USER_FOUND_SELECTED_MOBILE_NUMBER"),
          null
        );
      }
      if(user.id === userId) {
        return callback(
          new Error("CANT_SEND_MONEY_TO_SELF"),
          null
        );
      }
      const userDetails = await UserService.getUserDetails(user.id);

      if (userDetails?.kyc?.status !== "Approved") {
        return callback(
          new Error("CANT_SEND_MONEY_BECAUSE_OF_UNAPPROVED_KYC"),
          null
        );
      }
      return callback(null, { data: userDetails });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return callback(new Error("FAILED_TO_CHECK_RECEIVER_STATUS"), null);
    }
  }
  static async executeTransfer(
    { senderUserId, receiverId, currency, amount, i18n },
    callback
  ) {
    const tran = await db.sequelize.transaction();
    try {
      const senderUserDetails = await UserService.getUserDetails(senderUserId);
      const receiverUserDetails = await UserService.getUserDetails(receiverId);
      if(senderUserId === receiverId) {
        await tran.rollback();
        return callback(new Error("CANT_SEND_MONEY_TO_SELF"), null);

      }
      if (!receiverUserDetails) {
        await tran.rollback();
        return callback(
          new Error("NO_USER_FOUND_SELECTED_MOBILE_NUMBER"),
          null
        );
      }
      if (receiverUserDetails?.kyc?.status !== "Approved") {
        await tran.rollback();
        return callback(
          new Error("CANT_SEND_MONEY_BECAUSE_OF_UNAPPROVED_KYC"),
          null
        );
      }
      const senderWallet = senderUserDetails.wallets.find(
        (wallet) => wallet.currency === currency
      );
      if (!senderWallet) {
        await tran.rollback();
        return callback(new Error("SENDER_WALLET_NOT_FOUND"), null);
      }
      if (senderWallet.status !== "active" || senderWallet.locked === true) {
        await tran.rollback();
        return callback(new Error("SENDER_WALLET_NOT_ACTIVE_OR_LOCKED"), null);
      }
      if (parseFloat(senderWallet.balance) < parseFloat(amount)) {
        await tran.rollback();
        return callback(new Error("INSUFFICIENT_BALANCE"), null);
      }
      const pendingTransfer = await Transfer.findOne({
        where: {
          senderId: senderUserId,
          receiverId: receiverId,
          status: "pending",
        },
      });
      if (pendingTransfer) {
        await tran.rollback();
        return callback(new Error("PENDING_TRANSFER_EXISTS"), null);
      }
      const senderOldBalance = parseFloat(senderWallet.balance);
      const newSenderBalance = senderOldBalance - parseFloat(amount);

      const createTransfer = await Transfer.create(
        {
          senderId: senderUserId,
          receiverId: receiverId,
          currency: currency,
          amount: amount,
          status: "pending",
        },
        { transaction: tran }
      );

      const createTransaction = await WalletTransaction.create(
        {
          userId: senderUserId,
          walletId: senderWallet.id,
          type: "debit",
          paymentAmt: amount,
          paymentCurrency: currency,
          oldWalletBalance: senderOldBalance,
          newWalletBalance: newSenderBalance,
          currency: currency,
          transferId: createTransfer.id,
          description: `Transfer to  (${receiverUserDetails.phoneNumber})`,
          status: "completed",
        },
        { transaction: tran }
      );

      await UserWallet.update(
        {
          balance: newSenderBalance,
        },
        {
          where: {
            userId: senderUserId,
            currency: currency,
          },
          transaction: tran,
        }
      );

      await tran.commit();

      const senderWalletDetails = await UserWallet.findOne({
        where: {
          userId: senderUserId,
          currency: currency,
        },
      });
      NotificationService.walletTransferNotification(createTransfer.id, i18n);

      return callback(null, {
        data: {
          transaction: createTransaction,
          transfer: createTransfer,
          senderWallet: senderWalletDetails,
        },
      });
    } catch (error) {
      if (tran?.finished !== "commit") {
        await tran.rollback();
      }
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return callback(new Error("TRANSFER_FAILED"), null);
    }
  }
  static async acceptRejectTransfer(
    { transferId, userId, status, i18n },
    callback
  ) {
    // console.log("Accept/Reject Transfer", transferId, userId, status);
    

    const tran = await db.sequelize.transaction();
    try {
      const transfer = await Transfer.findOne({
        where: {
          id: transferId,
          receiverId: userId,
          status: "pending",
        },
      });
      if (!transfer) {
        await tran.rollback();
        return callback(new Error("TRANSFER_NOT_FOUND_OR_NOT_PENDING"), null);
      }
      // Check if receiver rejected the transfer
      if (status === "rejected") {
        await transfer.update({ status: "rejected" }, { transaction: tran });
        //add to sender wallet transaction
        const senderWallet = await UserWallet.findOne({
          where: {
            userId: transfer.senderId,
            currency: transfer.currency,
          },
          transaction: tran,
        });

        const oldBalance = parseFloat(senderWallet.balance);
        const newBalance = oldBalance + parseFloat(transfer.amount);
        await UserWallet.update(
          { balance: newBalance },
          {
            where: {
              id: senderWallet.id,
            },
            transaction: tran,
          }
        );
        const walletTransaction = await WalletTransaction.create(
          {
            userId: transfer.senderId,
            walletId: senderWallet.id,
            type: "credit",
            paymentAmt: transfer.amount,
            paymentCurrency: transfer.currency,
            oldWalletBalance: oldBalance,
            newWalletBalance: newBalance,
            transferId: transfer.id,
            description: `Transfer rejected, amount refunded to sender's wallet`,
            status: "completed",
          },
          { transaction: tran }
        );

        await tran.commit();
        const senderWalletDetails = await UserWallet.findOne({
          where: {
            userId: transfer.senderId,
            currency: transfer.currency,
          },
        });
        NotificationService.updatePendingTransferNotificationStatus(transferId, "rejected");
        NotificationService.walletTransferRejectionNotification(
          transferId,
          i18n
        );
        return callback(null, {
          data: {
            walletTransaction,
            senderWallet: senderWalletDetails,
            transfer: { ...transfer.toJSON(), status: "rejected" },
            message: "TRANSFER_REJECTED_SUCCESSFULLY",
          },
        });
      }
      if (status === "accepted") {
        await transfer.update({ status: "accepted" }, { transaction: tran });

        // Find or create receiver wallet
        let receiverWallet = await UserWallet.findOne({
          where: {
            userId: transfer.receiverId,
            currency: transfer.currency,
          },
          transaction: tran,
        });

        let oldBalance = receiverWallet
          ? parseFloat(receiverWallet.balance)
          : 0;
        let newBalance = oldBalance + parseFloat(transfer.amount);

        if (!receiverWallet) {
          receiverWallet = await UserWallet.create(
            {
              userId: transfer.receiverId,
              balance: newBalance,
              currency: transfer.currency,
            },
            { transaction: tran }
          );
        } else {
          await receiverWallet.update(
            { balance: newBalance },
            { transaction: tran }
          );
        }

        const walletTransaction = await WalletTransaction.create(
          {
            userId: transfer.receiverId,
            walletId: receiverWallet.id,
            type: "credit",
            paymentAmt: transfer.amount,
            paymentCurrency: transfer.currency,
            oldWalletBalance: oldBalance,
            newWalletBalance: newBalance,
            transferId: transfer.id,
            description: `Transfer accepted, amount credited to receiver's wallet`,
            status: "completed",
          },
          { transaction: tran }
        );

        await tran.commit();

        const receiverWalletDetails = await UserWallet.findOne({
          where: {
            userId: transfer.receiverId,
            currency: transfer.currency,
          },
        });
        NotificationService.updatePendingTransferNotificationStatus(transferId, "accepted");
        NotificationService.walletTransferAcceptanceNotification(
          transferId,
          i18n
        );

        return callback(null, {
          data: {
            walletTransaction,
            receiverWallet: receiverWalletDetails,
            transfer: { ...transfer.toJSON(), status: "accepted" },
            message: "TRANSFER_ACCEPTED_SUCCESSFULLY",
          },
        });
      }

      await tran.rollback();
      return callback(new Error("INVALID_STATUS"), null);
    } catch (error) {
      if (tran?.finished !== "commit") {
        await tran.rollback();
      }
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return callback(new Error("FAILED_TO_ACCEPT_REJECT_TRANSFER"), null);
    }
  }
  static async getTransferHistory(
    { userId, page = 1, limit = 10, filter = {} },
    callback
  ) {
    try {
      let whereClause = {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      };

      if (filter.type && filter.type.length === 1 && filter.type.includes("incoming")) {
        whereClause = { receiverId: userId };
      } else if (filter.type && filter.type.length === 1 && filter.type.includes("outgoing")) {
        whereClause = { senderId: userId };
      }
      console.log("Where Clause:", whereClause);
      if (filter.status && filter.status.length > 0) {
        whereClause.status = { [Op.in]: filter.status };
      }

      const transfers = await Transfer.findAll({
        where: whereClause,
        order: [["createdAt", "DESC"]],
        limit: limit,
        offset: (page - 1) * limit,
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["name", "phoneNumber"],
          },
          {
            model: User,
            as: "receiver",
            attributes: ["name", "phoneNumber"],
          },
          // {
          //     model: WalletTransaction,
          //     as: "transactions",
          //     attributes: ["id", "type", "paymentAmt", "paymentCurrency", "status", "createdAt"],
          // },
        ],
      });

      return callback(null, { data: transfers });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return callback(error, null);
    }
  }
  static async getTransferById(transferId, callback) {
    try {
      const transfer = await Transfer.findOne({
        where: {
          id: transferId,
        },
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["name", "phoneNumber"],
          },
          {
            model: User,
            as: "receiver",
            attributes: ["name", "phoneNumber"],
          },
        ],
      });

      if (!transfer) {
        return handleCallback(new Error("TRANSFER_NOT_FOUND"), null, callback);
      }
      return handleCallback(null, { data: transfer }, callback);
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return handleCallback(error, null, callback);
    }
  }
}
