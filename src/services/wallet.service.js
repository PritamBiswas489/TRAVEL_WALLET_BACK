import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import { getPeleCardCurrencyNumber, amountUptotwoDecimalPlaces } from "../libraries/utility.js";
import CurrencyService from "./currency.service.js";
import SettingsService from "./settings.service.js";
const { WalletPelePayment, Op, User, UserWallet } = db;

export default class WalletService {
  static async updateUserWalletBalanceAfterPayment(
    paymentData,
    paidCurrency,
    paidAmount
  ) {
    // console.log("user id ", paymentData.userId);
    try {
        let currencyDetails = {};
      if (paymentData.StatusCode === "000") {
        const currencies = getPeleCardCurrencyNumber();
        const formCurrency =
          Object.keys(currencies).find(
            (k) => String(currencies[k]) === paymentData.DebitCurrency
          ) ?? paidCurrency;
        const thbrate = await CurrencyService.getCurrencyByCode(
          `${formCurrency}_TO_THB`
        );
        if (!thbrate?.data?.value) {
          return { ERROR: "Currency rate not found" };
        }
         const setting = await SettingsService.getSetting('delta_percentage');
        const thaiRate = thbrate?.data?.value;
        const deltaCutPercentage = parseFloat(setting.data.value) || 0;
        const cutValue = (thaiRate * deltaCutPercentage) / 100;
        const finalRateValue = thaiRate - cutValue;
        // console.log("THB Rate: ", thaiRate);
        // console.log("Cut Value: ", cutValue);
        // console.log("Final Value: ", finalRateValue);

        const thaiAmount = amountUptotwoDecimalPlaces(paidAmount * finalRateValue);
        // console.log("Thai Amount: ", thaiAmount);

        currencyDetails = {thaiRate, deltaCutPercentage, cutValue, finalRateValue, thaiAmount};

        const existingWallet = await UserWallet.findOne({
          where: { userId: paymentData.userId },
        });
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
      // Fetch the updated user wallet
      const userWallet = await UserWallet.findOne({
        where: {
          userId: paymentData.userId,
        },
      });
      return { userWallet, currencyDetails };
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
}
