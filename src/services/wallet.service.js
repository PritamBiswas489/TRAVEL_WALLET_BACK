import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import { getPeleCardCurrencyNumber, amountUptotwoDecimalPlaces } from "../libraries/utility.js";
import CurrencyService from "./currency.service.js";
import SettingsService from "./settings.service.js";
const { WalletPelePayment, Op, User, UserWallet, WalletTransaction, Transfer } = db;

export default class WalletService {
  static async updateUserWalletBalanceAfterPayment(
    paymentData,
    paidCurrency,
    walletAmount
  ) {
    // console.log("user id ", paymentData.userId);
    try {
        let oldWalletBalance = 0;
        let newWalletBalance = 0;

        const existingWallet = await UserWallet.findOne({
          where: { userId: paymentData.userId, currency: paidCurrency },
        });
        if (existingWallet) {
          oldWalletBalance = parseFloat(existingWallet.balance);
        }
         if (paymentData.StatusCode === "000") {
           if (existingWallet) {
                const updatedBalance =
                parseFloat(existingWallet.balance) + walletAmount;
                await UserWallet.update(
                  { balance: updatedBalance },
                  { where: { id: existingWallet.id } }
                );
           }else{
              await UserWallet.create({
                  userId: paymentData.userId,
                  balance: walletAmount,
                  currency: paidCurrency,
              });
           }
         }
         const userWallet = await UserWallet.findOne({
            where: {
              userId: paymentData.userId,
              currency: paidCurrency,
            },
         });
         newWalletBalance = parseFloat(userWallet?.balance || 0);

          const walletTransactionDetails = await WalletTransaction.create({
              userId: paymentData.userId,
              walletId: userWallet?.id || 0,
              paymentAmt: walletAmount,
              paymentCurrency: paidCurrency,
              oldWalletBalance: oldWalletBalance,
              newWalletBalance: newWalletBalance,
              type: "credit",
              description: `Add ${walletAmount} ${paidCurrency}. ${paymentData.StatusCode === "000" ? "completed" : "failed"} payment`,
              status: paymentData.StatusCode === "000" ? "completed" : "failed",
              paymentId: paymentData?.id,
        });
        return { userWallet,  walletTransactionDetails };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return { ERROR: e.message };
    }
  }

  static async getUserWallet(userId, currency = []) {
    try {
      const userWallet = await UserWallet.findAndCountAll({
        where: {
          userId: userId,
          ...(currency.length > 0 && { currency: { [Op.in]: currency } }),
        },
      });
      return userWallet;
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return { ERROR: e.message };
    }
  }
  static async getUserWalletTransactionHistory(userId, { currency, status, page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      const userWalletTransactions = await WalletTransaction.findAndCountAll({
        where: {
          userId: userId,
          ...(currency.length > 0 && { paymentCurrency: { [Op.in]: currency } }),
          ...(status && status.length > 0 && { status: { [Op.in]: status } }),
        },
        include:[
          {
            model: WalletPelePayment,
            as: "walletPayment",
            attributes: [
              "id", 
              "PelecardTransactionId", 
              "VoucherId",
              "CreditCardNumber",
              "Token",
              "CreditCardNumber",
              "CreditCardExpDate",
              "DebitApproveNumber",
              "CardHebName",
              "TotalPayments"
            ],
          },
          {
            model: Transfer,
            as: "transfer",
            include: [
              {
                model: User,
                as: "sender",
                attributes: ["name","phoneNumber"],
              },
              {
                model: User,
                as: "receiver",
                attributes: ["name","phoneNumber"],
              }

            ]
          },
          {
            model: TransferRequests,
            as: "transferRequest",
            include: [
              {
                model: User,
                as: "sender",
                attributes: ["name","phoneNumber"],
              },
              {
                model: User,
                as: "receiver",
                attributes: ["name","phoneNumber"],
              }
            ]
          }
        ],
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit,
      });
      return userWalletTransactions;
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return { ERROR: e.message };
    }
  }
}
