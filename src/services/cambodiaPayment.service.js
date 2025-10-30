import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import { walletCurrencies } from "../config/walletCurrencies.js";
import { paymentCurrencies } from "../config/paymentCurrencies.js";
import KessPayApiService from "./kesspayApi.service.js";
import UserService from "./user.service.js";
import CurrencyService from "./currency.service.js";
import { v4 as uuidv4 } from "uuid";

const {
  ExpensesCategories,
  UserWallet,
  WalletTransaction,
  kessPayTransactionInfos,
  Op,
  fn,
  col,
} = db;

export default class CambodiaPaymentService {
  //Buy Expense
  static async buyExpense({ payload, userId, i18n }, callback) {
    const tran = await db.sequelize.transaction();
    try {
      const walletCurrency = payload?.walletCurrency;
      const amount = parseFloat(payload?.transactionAmount || 0);
      const transactionCurrency = payload?.transactionCurrency; //KHR or USD
      const merchantName = payload?.merchantName;
      const merchantCity = payload?.merchantCity;
      const qrCode = payload?.qrCode;
      const expenseCatId = payload?.expenseCatId || 1;

      if (walletCurrencies[walletCurrency] === undefined) {
        await tran.rollback();
        return callback(new Error("INVALID_WALLET_CURRENCY"), null);
      }

      if (!amount || amount <= 0) {
        await tran.rollback();
        return callback(new Error("INVALID_AMOUNT"), null);
      }
      if (!qrCode) {
        await tran.rollback();
        return callback(new Error("MISSING_QR_CODE"), null);
      }

      const expenseDet = await ExpensesCategories.findOne({
        where: { id: expenseCatId },
      });
      const expenseCatName = expenseDet ? expenseDet.title : "General Expense";

      const userWallet = await UserWallet.findOne({
        where: {
          userId: userId,
          currency: walletCurrency,
        },
        lock: tran.LOCK.UPDATE,
        transaction: tran,
      });

      if (!userWallet) {
        await tran.rollback();
        return callback(
          new Error("USER_WALLET_NOT_FOUND_FOR_SELECTED_CURRENCY"),
          null
        );
      }

      const userWalletBalance = parseFloat(userWallet.balance || 0); // balance in selected currency

      console.log("User wallet balance:", userWalletBalance, walletCurrency);

      const convertActualPaymentAmountToSelectedCurrency = await new Promise(
        (resolve, reject) => {
          CurrencyService.currencyConverterPaymentCurToWalletCur(
            transactionCurrency,
            walletCurrency,
            amount,
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

      const actualPaymentAmountToSelectedCurrency = parseFloat(
        convertActualPaymentAmountToSelectedCurrency.data
          .converted_amount_with_delta_percentage
      );

      if (userWalletBalance < actualPaymentAmountToSelectedCurrency) {
        await tran.rollback();
        return callback(new Error("INSUFFICIENT_WALLET_BALANCE"), null);
      }

      console.log({
        transactionCurrency,
        amount,
        actualPaymentAmountToSelectedCurrency,
        walletCurrency,
        userWalletBalance,
      });

      const out_trade_no = uuidv4();
      const dt = {
        transactionCurrency,
        transactionAmount: amount,
        walletCurrency,
        amountInUserWalletCurrency: actualPaymentAmountToSelectedCurrency,
        userId: userId,
        expenseCatId: expenseCatId,
        receiver_name: merchantName,
        qr_code: qrCode,
        merchantName: merchantName,
        merchantCity: merchantCity,
        latitude: payload?.latitude || null,
        longitude: payload?.longitude || null,
        out_trade_no,
      };

      const kesspayTransaction = await kessPayTransactionInfos.create(dt, {
        transaction: tran,
      });
      const kesspayTransactionId = kesspayTransaction.id;

      const getAccessToken = await KessPayApiService.accessToken();

      if (!getAccessToken?.access_token) {
        await tran.rollback();
        return callback(new Error("TOKEN_RETRIEVAL_FAILED"), null);
      }

      const khqrScanResponse = await new Promise((resolve, reject) =>
        KessPayApiService.scanKHQR(
          {
            token: getAccessToken?.access_token,
            data: {
              qrcode: qrCode,
              out_trade_no,
              currency: transactionCurrency,
              amount: amount,
            },
            i18n,
          },
          (err, res) => {
            if (err) {
              return reject(err);
            }
            resolve(res);
          }
        )
      );

      kesspayTransaction.transaction_ref =
        khqrScanResponse?.data?.transaction_ref || null;
      kesspayTransaction.transaction_status =
        khqrScanResponse?.data?.status || "FAILED";
      kesspayTransaction.callBack_data = khqrScanResponse?.data || null;
      kesspayTransaction.receiver_name =
        khqrScanResponse?.data?.receiver_info?.receiver_name || null;
      kesspayTransaction.receiver_bank =
        khqrScanResponse?.data?.receiver_info?.receiver_bank || null;
      kesspayTransaction.receiver_bakong_id =
        khqrScanResponse?.data?.receiver_info?.receiver_bakong_id || null;
      kesspayTransaction.receiver_acc_info =
        khqrScanResponse?.data?.receiver_info?.receiver_acc_info || null;
      await kesspayTransaction.save({ transaction: tran });

      //refund if failed
      let walletTransaction = null;
      if (kesspayTransaction.transaction_status === "SUCCEEDED") {
        const oldWalletBalance = userWalletBalance;
        const newWalletBalance = parseFloat(
          (userWalletBalance - actualPaymentAmountToSelectedCurrency).toFixed(6)
        );

        userWallet.balance = newWalletBalance;
        await userWallet.save({ transaction: tran });

        walletTransaction = await WalletTransaction.create(
          {
            userId: userId,
            walletId: userWallet.id,
            type: "debit",
            paymentAmt: actualPaymentAmountToSelectedCurrency,
            paymentCurrency: walletCurrency,
            oldWalletBalance: oldWalletBalance,
            newWalletBalance: newWalletBalance,
            kesspayTransactionId,
            description: i18n.__(
              {
                phrase: "EXPENSE_PAYMENT_TRANSACTION_SUCCESSFUL",
                locale: "en",
              },
              {
                amount: actualPaymentAmountToSelectedCurrency,
                currency: walletCurrency,
                merchantName,
                merchantCity,
                expenseCatName,
              }
            ),
            description_he: i18n.__(
              {
                phrase: "EXPENSE_PAYMENT_TRANSACTION_SUCCESSFUL",
                locale: "he",
              },
              {
                amount: actualPaymentAmountToSelectedCurrency,
                currency: walletCurrency,
                merchantName,
                merchantCity,
                expenseCatName,
              }
            ),
            status: "completed",
          },
          { transaction: tran }
        );
      }
      await tran.commit();
      return callback(null, {
        data: { kesspayTransaction, walletTransaction, khqrScanResponse },
      });
    } catch (e) {
      console.error("Error in buyExpense:", e);
      if (tran?.finished !== "commit") {
        await tran.rollback();
      }
      if (process.env.SENTRY_ENABLED === "true") {
        Sentry.captureException(e);
      }
      return callback(new Error("BUY_EXPENSE_FAILED"), null);
    }
  }
}
