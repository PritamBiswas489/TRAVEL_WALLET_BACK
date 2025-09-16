import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { walletCurrencies } from "../config/walletCurrencies.js";
import PisoPayApiService from "./pisoPayApi.service.js";
import UserService from "./user.service.js";
import CurrencyService from "./currency.service.js";
const { PisoPayTransactionInfos, ExpensesCategories } = db;

 
export default class PhilippinesPaymentService {
  //track transaction info
  static async trackTransaction(paymentData) {
    try {
      const createdRecord = await PisoPayTransactionInfos.create({
        transaction_info_code: paymentData.transaction_info_code,
        transaction_type: paymentData.transaction_type,
        transaction_channel: paymentData.transaction_channel,
        remittance_method_code: paymentData.remittance_method_code,
        sender_customer_code: paymentData.sender_customer_code,
        sender_customer_details: paymentData.sender_customer_details,
        beneficiary_customer_code: paymentData.beneficiary_customer_code,
        beneficiary_customer_details: paymentData.beneficiary_customer_details,
        relationship: paymentData.relationship,
        purpose: paymentData.purpose,
        client_fee_rebate_json: paymentData.client_fee_rebate_json,
        amount: paymentData.amount,
        client_fee: paymentData.client_fee,
        client_rebate: paymentData.client_rebate,
        amount_deduct: paymentData.amount_deduct,
        callback_url: paymentData.callback_url,
        qr_code: paymentData.qr_code,
        date_time: paymentData.date_time,
        userId: paymentData.userId,
        expenseCatId: paymentData.expenseCatId,
        memo: paymentData.memo,
        amountInUserWalletCurrency: paymentData.amountInUserWalletCurrency,
        walletCurrency: paymentData.walletCurrency,
      });
      return createdRecord;
    } catch (e) {
      if (process.env.SENTRY_ENABLED === "true") {
        Sentry.captureException(e);
      }
    }
  }
  //update transaction status
  static async updateTransactionStatus(payload) {
    try {
      const { transaction_info_code, status } = payload;
      let statusValue = "Pending";
      if (parseInt(status) === 0) {
        statusValue = "Success";
      } else if (parseInt(status) === 2) {
        statusValue = "Cancelled";
      } else if (parseInt(status) === 3) {
        statusValue = "Failed";
      }

      const record = await PisoPayTransactionInfos.findOne({
        where: { transaction_info_code: transaction_info_code },
      });
      if (record) {
        record.transaction_status = statusValue;
        record.callBack_data = payload;
        await record.save();
        console.log("Transaction status updated for:", transaction_info_code);
      } else {
        throw new Error("RECORD_NOT_FOUND");
      }
    } catch (e) {
      if (process.env.SENTRY_ENABLED === "true") {
        Sentry.captureException(e);
      }
    }
  }
  static async buyExpense({ payload, userId, i18n }, callback) {
    try {
      console.log(
        "Buying expense with payload:",
        payload,
        "for user ID:",
        userId
      );
      const walletCurrency = payload?.walletCurrency;
      const amount = parseFloat(payload?.amount || 0);
      const qrCode = payload?.qrCode;
      const expenseCatId = payload?.expenseCatId || 1;
      const memo = payload?.memo || "Expense payment";

      if (walletCurrencies[walletCurrency] === undefined) {
        return callback(new Error("INVALID_WALLET_CURRENCY"), null);
      }
      if (!amount || amount <= 0) {
        return callback(new Error("INVALID_AMOUNT"), null);
      }
      if (!qrCode) {
        return callback(new Error("MISSING_QR_CODE"), null);
      }
      const responseToken = await PisoPayApiService.login();
      if (!responseToken?.token) {
        return callback(new Error("TOKEN_RETRIEVAL_FAILED"), null);
      }

      try {
        const responseQrCodeValidation = await new Promise(
          (resolve, reject) => {
            PisoPayApiService.validateTransaction(
              {
                token: responseToken?.token,
                qrCode,
                i18n,
                purpose: "EXPENSE_PAYMENT",
                dt: { amount },
              },
              (err, res) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(res);
                }
              }
            );
          }
        );
        const actualPaymentAmount = parseFloat(
          responseQrCodeValidation.data.amount
        ); // actual amount in PHP
        const qrIType = responseQrCodeValidation.data.qrIType;
        const getUserDetails = await UserService.getUserDetails(userId);
        if (!getUserDetails?.wallets?.length) {
          return callback(new Error("USER_WALLET_NOT_FOUND"), null);
        }

        const userWallet = getUserDetails.wallets.find(
          (w) => w.currency === walletCurrency
        );
        if (!userWallet) {
          return callback(
            new Error("USER_WALLET_NOT_FOUND_FOR_SELECTED_CURRENCY"),
            null
          );
        }
        const userWalletBalance = parseFloat(userWallet.balance || 0); // balance in selected currency
        const convertActualPaymentAmountToSelectedCurrency = await new Promise(
          (resolve, reject) => {
            CurrencyService.currencyConverterPaymentCurToWalletCur(
              "PHP",
              walletCurrency,
              actualPaymentAmount,
              (err, res) => {
                if (err) {
                  console.error("Currency conversion error:", err);
                  process.env.SENTRY_ENABLED === "true" &&
                    Sentry.captureException(
                      new Error(
                        "Currency converstion failed during buy expense in Pisopay"
                      )
                    );
                  reject(err);
                } else {
                  resolve(res);
                }
              }
            );
          }
        );

        const actualPaymentAmountToSelectedCurrency =
          convertActualPaymentAmountToSelectedCurrency.data
            .converted_amount_with_delta_percentage;
        if (userWalletBalance < actualPaymentAmountToSelectedCurrency) {
          return callback(new Error("INSUFFICIENT_WALLET_BALANCE"), null);
        }
        console.log(
          "Proceeding with expense payment. Actual payment amount in PHP:",
          actualPaymentAmount,
          "which is",
          actualPaymentAmountToSelectedCurrency,
          walletCurrency,
          "User wallet balance:",
          userWalletBalance,
          walletCurrency
        );

        const initiatePisoPayTransaction = await new Promise(
          (resolve, reject) => {
            PisoPayApiService.initiateTransaction(
              {
                token: responseToken?.token,
                qrCode,
                amount: actualPaymentAmount,
                i18n,
                purpose: "EXPENSE_PAYMENT",
              },
              (err, res) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(res);
                }
              }
            );
          }
        );
        const dt = initiatePisoPayTransaction.data;
        dt.userId = userId;
        dt.expenseCatId = expenseCatId;
        dt.memo = memo;
        dt.amountInUserWalletCurrency = actualPaymentAmountToSelectedCurrency;
        dt.walletCurrency = walletCurrency;
        const trackedTransaction = await this.trackTransaction(dt);
        return callback(null, { data: trackedTransaction });
        // Proceed with the expense payment logic using response
      } catch (err) {
        console.log("QR Code validation failed");
        return callback(err, null);
      }
    } catch (e) {
      if (process.env.SENTRY_ENABLED === "true") {
        Sentry.captureException(e);
      }
    }
  }
  static async getExpenseTransactionDetails(
    { transaction_info_code, userId, i18n },
    callback
  ) {
    try {
      const response = await PisoPayTransactionInfos.findOne({
        where: { transaction_info_code, userId },
         include: [
          {
            model: ExpensesCategories,
            as: "expenseCategory",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
      });
      if (!response) {
        return callback(new Error("EXPENSE_TRANSACTION_NOT_FOUND"), null);
      }
      return callback(null, { data: response });
    } catch (error) {
      console.error("Error fetching expense transaction details:", error);
      return callback(error, null);
    }
  }
}
