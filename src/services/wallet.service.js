import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import { getPeleCardCurrencyNumber, amountUptotwoDecimalPlaces } from "../libraries/utility.js";
import CurrencyService from "./currency.service.js";
import SettingsService from "./settings.service.js";
const { WalletPelePayment, Op, User, UserWallet, WalletTransaction } = db;

export default class WalletService {
  static async updateUserWalletBalanceAfterPayment(
    paymentData,
    paidCurrency,
    walletAmount
  ) {
    // console.log("user id ", paymentData.userId);
    try {
        const thbrate = await CurrencyService.getCurrencyByCode(
            `${paidCurrency}_TO_THB`
        );
        if (!thbrate?.data?.value) {
            return { ERROR: "Currency rate not found" };
        }
        const setting = await SettingsService.getSetting("delta_percentage");
        const thaiRate = thbrate?.data?.value;
        const deltaCutPercentage = parseFloat(setting.data.value) || 0;
        const cutValue = (thaiRate * deltaCutPercentage) / 100;
        const finalRateValue = thaiRate - cutValue;
        const thaiAmount = amountUptotwoDecimalPlaces(walletAmount * finalRateValue);
        const currencyDetails = { thaiRate, deltaCutPercentage, cutValue, finalRateValue, thaiAmount };
        let oldWalletBalance = 0;
        let newWalletBalance = 0;
      

        const existingWallet = await UserWallet.findOne({
          where: { userId: paymentData.userId },
        });
        if (existingWallet) {
          oldWalletBalance = parseFloat(existingWallet.balance);
        }

      if (paymentData.StatusCode === "000") {

       
        if (existingWallet) {
          // Update existing wallet balance
          const updatedBalance =
            parseFloat(existingWallet.balance) + thaiAmount;
          await UserWallet.update(
            { balance: updatedBalance },
            { where: { id: existingWallet.id } }
          );
        } else {
          // Create new wallet entry
          await UserWallet.create({
            userId: paymentData.userId,
            balance: thaiAmount,
          });
        }
      }
     
      //Fetch the updated user wallet
      const userWallet = await UserWallet.findOne({
        where: {
          userId: paymentData.userId,
        },
      });
      newWalletBalance = parseFloat(userWallet?.balance || 0);
       //update wallet transaction table
      const walletTransactionDetails = await WalletTransaction.create({
        userId: paymentData.userId,
        walletId: userWallet?.id || 0,
        paymentAmt: walletAmount,
        paymentCurrency: paidCurrency,
        thbAmount: thaiAmount,
        oldWalletBalance: oldWalletBalance,
        newWalletBalance: newWalletBalance,
        type: "credit",
        description: `Add ${thaiAmount} THB. ${paymentData.StatusCode === "000" ? "completed" : "failed"} payment`,
        status: paymentData.StatusCode === "000" ? "completed" : "failed",
        paymentId: paymentData?.id,
      });
      return { userWallet, currencyDetails, walletTransactionDetails };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return { ERROR: e.message };
    }
  }

  static async getUserWallet(userId) {
    try {
      const userWallet = await UserWallet.findOne({
        where: {
          userId: userId,
        },
      });
      return userWallet;
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return { ERROR: e.message };
    }
  }
  static async getUserWalletTransactionHistory(userId, { page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      const userWalletTransactions = await WalletTransaction.findAndCountAll({
        where: {
          userId: userId,
        },
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
