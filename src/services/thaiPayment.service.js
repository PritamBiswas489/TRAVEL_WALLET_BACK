import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import { parseThaiQR, mapQRToQueryParams } from "../libraries/ipps/qrParser.js";
import {
  registerWallet,
  transferQuery,
  transferConfirm,
  deactivateWallet
} from "../libraries/ipps/ppxcClient.js";
import UserService from "./user.service.js";
import CurrencyService from "./currency.service.js";
import { walletCurrencies } from "../config/walletCurrencies.js";
import { paymentCurrencies } from "../config/paymentCurrencies.js";
 
const { Op, fn, col, User, ThaiPayments, UserWallet , ExpensesCategories, WalletTransaction, UserThaiWalletIds } = db;

export default class ThaiPaymentService {
  // This function fetches user details and registers a wallet for the user if not already registered
  static async getUserWallet(userid) {
    const existingWalletRecord = await UserThaiWalletIds.findOne({
      where: { user_id: userid },
    });
    if (existingWalletRecord) {
      console.log("Existing wallet record found for user ID:", userid);
      return { walletId: existingWalletRecord.wallet_id };
    }
    const getUser = await UserService.getUserById(userid);
    console.log("User data fetched for wallet registration:", getUser);
    const externalWalletUserId = `user-${userid}-${Date.now()}`;
    const customerEnglishName = getUser.name || null;
    if (!customerEnglishName) {
      return { ERROR: "MISSING_USER_NAME" };
    }
    //check name text english or not
    if (!/^[A-Za-z\s]+$/.test(customerEnglishName)) {
      return { ERROR: "CUSTOMER_NAME_MUST_BE_ENGLISH" };
    }
    const senderTaxId = getUser.passportId || null;
    if(!senderTaxId){
      return { ERROR: "MISSING_USER_PASSPORT_ID" };
    }
    const senderAccountName = customerEnglishName;
    const documentExpiry = getUser.passportExpiryDate ? new Date(getUser.passportExpiryDate).toISOString().split("T")[0] : null;
    if (!documentExpiry) {
      return { ERROR: "MISSING_USER_PASSPORT_EXPIRY_DATE" };
    }
    if (!getUser.dob) {
      return { ERROR: "MISSING_USER_DOB" };
    }
    const dateOfBirth = getUser.dob
      ? new Date(getUser.dob).toISOString().split("T")[0]
      : null;
    const phoneNumber = getUser.phoneNumber || null;
    if (!phoneNumber) {
      return { ERROR: "MISSING_USER_PHONE_NUMBER" };
    }
    const nationality = getUser.nationality || null;
    if (!nationality) {
      return { ERROR: "MISSING_USER_NATIONALITY" };
    }
    const address = getUser.address || null;
    if (!address) {
      return { ERROR: "MISSING_USER_ADDRESS" };
    }
    //prepare data for wallet registration
    const insertData = {
      externalWalletUserId,
      customerEnglishName,
      senderTaxId,
      senderAccountName,
      documentExpiry,
      dateOfBirth,
      phoneNumber,
      nationality,
      address,
    };

    console.log("Data prepared for wallet registration:", insertData);
    try {
      const walletResponse = await registerWallet(insertData);
      if (walletResponse?.walletId) {
         await UserThaiWalletIds.create({
                user_id: userid,
                wallet_id: walletResponse.walletId,
                external_wallet_user_id: externalWalletUserId,
            });
        return { walletId: walletResponse.walletId };
      } else {
        return { ERROR: "WALLET_REGISTRATION_FAILED" };
      }
    } catch (e) {
      console.error("Error during wallet registration:", e);
      return { ERROR: "WALLET_REGISTRATION_FAILED" };
    }
   
  }
  // This function processes the QR code and maps it to query parameters for payment processing
  static async getpaymentQueryData(
    { qrCode, amount, userId, headers },
    callback,
  ) {
    console.log(
      "Starting QR code validation in service layer for user ID:",
      userId,
    );
    console.log("QR code received for validation:", qrCode);
    try {
      const getUserPPXCWallet = await ThaiPaymentService.getUserWallet(userId);
      if (getUserPPXCWallet?.ERROR) {
        return callback(new Error(getUserPPXCWallet.ERROR));
      }
      const parsed = parseThaiQR(qrCode);
      const walletId = getUserPPXCWallet.walletId; // Assuming this is the wallet ID returned from the registration function
      const overrideAmount = amount; // Use the amount from the payload if provided
      const queryParams = mapQRToQueryParams(
        parsed,
        walletId,
        overrideAmount ?? null,
      );
      console.log("===================================================");
      console.log("Parsed QR in service layer:", parsed);
      console.log("=================================================");
      console.log("Mapped Query Params in service layer:", queryParams);

      if (!queryParams?.receiverType || !queryParams?.receiverValue) {
        return callback(new Error("MISSING_RECEIVER_INFO"));
      }
      if (queryParams.receiverType === "BILLERID") {
        if (!queryParams.billReference1)
          return callback(new Error("MISSING_BILLING_RECEIVER_INFO"));
      }
      return callback(null, { data: queryParams });
    } catch (e) {
      console.error("Error during QR code validation:", e);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return callback(new Error("FAILED_TO_PROCESS_QR_CODE"));
    }
  }
  // This function will handle the actual transfer processing based on the mapped query parameters
  static async processTransfer({ payload, userId, headers }, callback) {
    const tran = await db.sequelize.transaction();
    console.log(
      "Starting transfer processing in service layer for user ID:",
      userId,
    );
    console.log("Payload received for transfer processing:", payload);

    try {
      const { walletCurrency, expenseCatId, paymentParams,  } = payload;
      const latitude = payload.latitude || null;
      const longitude = payload.longitude || null;
      const amount = paymentParams.amount;
      const qrCode = payload.qrCode || null;
      const memo = payload.memo || null;
      const expenseDet = await ExpensesCategories.findOne({
        where: { id: expenseCatId },
      });
      if (!expenseDet) {
        await tran.rollback();
        return callback(new Error("EXPENSE_CATEGORY_NOT_FOUND"), null);
      }
      const expenseCatName = expenseDet?.title || "Expense Category";
       

      if (!amount || amount <= 0) {
        await tran.rollback();
        return callback(new Error("INVALID_AMOUNT"), null);
      }
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
          null,
        );
      }
      const userWalletBalance = parseFloat(userWallet.balance || 0); // balance in selected currency
      const convertActualPaymentAmountToSelectedCurrency = await new Promise(
        (resolve, reject) => {
          CurrencyService.currencyConverterPaymentCurToWalletCur(
            "THB",
            walletCurrency,
            amount,
            (err, res) => {
              if (err) {
                console.error("Currency conversion error:", err);
                process.env.SENTRY_ENABLED === "true" &&
                  Sentry.captureException(
                    new Error(
                      "Currency conversion failed during buy expense in Thai Payment Service",
                    ),
                  );
                reject(err);
              } else {
                resolve(res);
              }
            },
          );
        },
      );
      const actualPaymentAmountToSelectedCurrency = parseFloat(
        convertActualPaymentAmountToSelectedCurrency.data
          .converted_amount_with_delta_percentage,
      );
      if (userWalletBalance < actualPaymentAmountToSelectedCurrency) {
        await tran.rollback();
        return callback(new Error("INSUFFICIENT_WALLET_BALANCE"), null);
      }

      const insertedPayment = await ThaiPayments.create(
        {
          user_id: userId,
          query_params: paymentParams,
          wallet_currency: walletCurrency,
          wallet_payment_amt: actualPaymentAmountToSelectedCurrency,
          expense_cat_id: expenseCatId,
          qr_code: qrCode,
          memo: memo,
          amount: amount,
          latitude,
          longitude,
        },
        {
          transaction: tran,
        },
      );
      if (!insertedPayment) {
        await tran.rollback();
        return callback(new Error("FAILED_TO_LOG_PAYMENT"));
      }
      const result = await transferQuery(paymentParams);
      console.log("Transfer query result:", result);
      if (!result?.lookupRef) {
        await tran.rollback();
        return callback(new Error("TRANSFER_PROCESSING_FAILED"));
      }
      insertedPayment.transfer_query_response = result;
      await insertedPayment.save({ transaction: tran });

      const oldWalletBalance = userWalletBalance;
      const newWalletBalance = parseFloat(
        (userWalletBalance - actualPaymentAmountToSelectedCurrency).toFixed(6)
      );
      userWallet.balance = newWalletBalance;
      await userWallet.save({ transaction: tran });

      // Log the wallet transaction
       const walletTransaction = await WalletTransaction.create(
          {
            userId: userId,
            walletId: userWallet.id,
            type: "debit",
            paymentAmt: actualPaymentAmountToSelectedCurrency,
            paymentCurrency: walletCurrency,
            oldWalletBalance: oldWalletBalance,
            newWalletBalance: newWalletBalance,
            thaiPaymentId: insertedPayment.id,
            description: headers.i18n.__(
              {
                phrase: "EXPENSE_PAYMENT_TRANSACTION_SUCCESSFUL",
                locale: "en",
              },
              {
                amount: actualPaymentAmountToSelectedCurrency,
                currency: walletCurrency,
                merchantName:result?.receiverNameEn || "Merchant from thailand",
                merchantCity:"Thailand",
                expenseCatName,
              }
            ),
            description_he: headers.i18n.__(
              {
                phrase: "EXPENSE_PAYMENT_TRANSACTION_SUCCESSFUL",
                locale: "he",
              },
              {
                amount: actualPaymentAmountToSelectedCurrency,
                currency: walletCurrency,
                merchantName:result?.receiverNameEn || "Merchant from thailand",
                merchantCity:"Thailand",
                expenseCatName,
              }
            ),
            status: "completed",
          },
          { transaction: tran }
        );
      await tran.commit();
      return callback(null, { data: { payment: insertedPayment, transaction: walletTransaction } });
    } catch (e) {
      console.error("Error during transfer processing:", e);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      await tran.rollback();
      return callback(new Error("FAILED_TO_PROCESS_TRANSFER"));
    }
  }
  // This function will confirm the transfer based on the lookup reference and update the payment record accordingly
  static async confirmTransfer({ payload, userId, headers }, callback) {
    try {
      console.log("Confirm transfer called with payload:", payload);
      const { id } = payload;
      if (!id) {
        return callback(new Error("MISSING_TRANSFER_ID"));
      }
      const paymentRecord = await ThaiPayments.findOne({
        include: [
            {
                model: ExpensesCategories,
                as: "expenseCategory",
                required: false,
            }
        ],
        where: { id, user_id: userId },
      });
      if (!paymentRecord) {
        return callback(new Error("TRANSFER_RECORD_NOT_FOUND"));
      }
      console.log("Payment record found for confirmation:", paymentRecord);
      const lookupRef = paymentRecord.transfer_query_response?.lookupRef;
      const receiverBank = paymentRecord.transfer_query_response?.receiverBank;
      const queryParams = paymentRecord.query_params;
      if (!lookupRef || !queryParams) {
        return callback(new Error("MISSING_TRANSFER_DATA"));
      }
      const confirmParams = {
        ...queryParams,
        lookupRef,
        receiverBank,
      };
      console.log(
        "Parameters prepared for transfer confirmation:",
        confirmParams,
      );
      const confirmResult = await transferConfirm(confirmParams);
      if (!confirmResult) {
        return callback(new Error("TRANSFER_CONFIRMATION_FAILED"));
      }
      
      if (
        confirmResult.data?.code === "0000" ||
        confirmResult.data?.code === "00"
      ) {
        paymentRecord.payment_status = "confirmed";
      } else {
        paymentRecord.payment_status = "failed";
        const tran = await db.sequelize.transaction();
         const expenseDet = await ExpensesCategories.findOne({
            where: { id: paymentRecord.expense_cat_id },
          });
          const expenseCatName = expenseDet?.title || "General Expense";
          const userWallet = await UserWallet.findOne({
            where: {
              userId: paymentRecord.user_id,
              currency: paymentRecord.wallet_currency,
            },
            lock: tran.LOCK.UPDATE,
            transaction: tran,
          });
          if(userWallet){
            const oldWalletBalance = parseFloat(userWallet.balance || 0);
            const amountInUserWalletCurrency =
                parseFloat(paymentRecord.wallet_payment_amt) || 0;
            const newWalletBalance = parseFloat(
                (oldWalletBalance + amountInUserWalletCurrency).toFixed(6)
            );
            userWallet.balance = newWalletBalance;
            await userWallet.save({ transaction: tran });


            await WalletTransaction.create(
            {
              userId: paymentRecord.user_id,
              walletId: userWallet.id,
              type: "credit",
              paymentAmt: amountInUserWalletCurrency,
              paymentCurrency: paymentRecord.wallet_currency,
              oldWalletBalance,
              newWalletBalance,
              thaiPaymentId: paymentRecord.id,
              description: headers.i18n.__(
                { phrase: "EXPENSE_PAYMENT_TRANSACTION_FAILED2", locale: "en" },
                {
                  amount: amountInUserWalletCurrency,
                  currency: paymentRecord.wallet_currency,
                  merchantName: paymentRecord.transfer_query_response?.receiverNameEn || "Merchant from thailand",
                  merchantCity: "Thailand",
                  expenseCatName,
                }
              ),
              description_he: headers.i18n.__(
                { phrase: "EXPENSE_PAYMENT_TRANSACTION_FAILED2", locale: "he" },
                {
                  amount: amountInUserWalletCurrency,
                  currency: paymentRecord.wallet_currency,
                  merchantName: paymentRecord.transfer_query_response?.receiverNameEn || "Merchant from thailand",
                  merchantCity: "Thailand",
                  expenseCatName,
                }
              ),
              status: "completed",
            },
            { transaction: tran }
          );
          await tran.commit();
          }


      }
      paymentRecord.confirmation_data = confirmResult;
      await paymentRecord.save();

      const pt = paymentRecord.toJSON(); 
       
      return callback(null, {
        data: { ...pt , amountInUserWalletCurrency: pt.wallet_payment_amt, walletCurrency: pt.wallet_currency, createdAt: pt.created_at },
         
      });
    } catch (e) {
      console.error("Error during transfer confirmation:", e);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return callback(new Error("FAILED_TO_CONFIRM_TRANSFER"));
    }
  }

  // This function retrieves the transfer details for a given transfer ID and user ID
  static async getTransferDetails({ payload, userId, headers }, callback) {
    const { id } = payload;
    if (!id) {
      return callback(new Error("MISSING_TRANSFER_ID"));
    }
    try {
      const paymentRecord = await ThaiPayments.findOne({
        where: { id, user_id: userId },
        include: [
            {
                model: ExpensesCategories,
                as: "expenseCategory",
                attributes: ["id", "title"],
            }
        ]
      });
      if (!paymentRecord) {
        return callback(new Error("TRANSFER_RECORD_NOT_FOUND"));
      }
      return callback(null, { data: paymentRecord });
    } catch (e) {
      console.error("Error fetching transfer details:", e);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return callback(new Error("FAILED_TO_FETCH_TRANSFER_DETAILS"));
    }
  }
  static async deactivateWallet({ payload, headers }, callback) {
    try {      
    console.log("Deactivate wallet called with payload:", payload);
      const { id } = payload;
        if (!id) {
          return callback(new Error("MISSING_WALLET_ID"));
        }
        const existingWalletRecord = await UserThaiWalletIds.findOne({
          where: { user_id : id },
        });
        if(!existingWalletRecord) {
            return callback(new Error("WALLET_RECORD_NOT_FOUND"));
        }
        await UserThaiWalletIds.destroy({
            where: { user_id: id },
        });
        const result = await deactivateWallet(existingWalletRecord.external_wallet_user_id);
        
        return callback(null, {
          data: result,
           message: headers.i18n.__("WALLET_DEACTIVATION_SUCCESSFUL"),
        });
    }catch(e){
      console.error("Error during wallet deactivation:", e);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return callback(new Error("FAILED_TO_DEACTIVATE_WALLET"));
    }

  }
  static async getExpensesTransactions({ payload, userId, i18n }, callback) {
      try {
        console.log(
          "Fetching expenses transactions with payload:",
          payload,
          "for user ID:",
          userId
        );
        const page = parseInt(payload?.page) || 1;
        const limit = parseInt(payload?.limit) || 10;
        const offset = (page - 1) * limit;
        const categoryId = payload?.categoryId || null;
        const month = payload?.month || null;
        const year = payload?.year || null;
  
        const whereClause = {
          user_id: userId,
          payment_status: "confirmed",
        };
        if (categoryId) {
          whereClause.expense_cat_id = categoryId;
        }
        if (month) {
          whereClause.created_month = month;
        }
        if (year) {
          whereClause.created_year = year;
        }
  
        const response = await ThaiPayments.findAndCountAll({
          order: [["created_at", "DESC"]],
          offset: offset,
          limit: limit,
          where: whereClause,
          include: [
            {
              model: ExpensesCategories,
              as: "expenseCategory",
              attributes: { exclude: ["created_at", "updated_at"] },
            },
          ],
        });
        return callback(null, { data: response });
      } catch (e) {
        if (process.env.SENTRY_ENABLED === "true") {
          Sentry.captureException(e);
        }
        console.log("Error in getExpensesTransactions:", e.message);
        callback(new Error("FAILED_TO_FETCH_EXPENSES_TRANSACTIONS"), null);
      }
    }
    //get expenses report
    static async getExpensesReport({ payload, userId, i18n }, callback) {
      try {
        console.log(
          "Generating expenses report with payload:",
          payload,
          "for user ID:",
          userId
        );
        const month = payload?.month;
        const year = payload?.year;
  
        const whereClause = {
          user_id: userId,
          payment_status: "confirmed",
        };
        // Add month/year filters only if provided
        if (month) {
          whereClause.created_month = month;
        }
        if (year) {
          whereClause.created_year = year;
        }
  
        const results = await ThaiPayments.findAll({
          attributes: ["expense_cat_id", [fn("SUM", col("amount")), "totalAmount"]],
          where: whereClause,
          group: ["expense_cat_id"],
          raw: false,
        });
        // const results = resultsRaw ? resultsRaw.map(r => r.get({ plain: true })) : [];
        //get expenses categories
        const getExpenseCategories = await ExpensesCategories.findAll({
          attributes: { exclude: ["created_at", "updated_at"] },
        });
        let totalExpenseAmt = 0; // total expense amount
        let reportArray = []; //report array to hold final report
        if (results.length > 0) {
          const totalamt = results.reduce((sum, record) => {
            return sum + parseFloat(record.getDataValue("totalAmount") || 0);
          }, 0);
          totalExpenseAmt = parseFloat(totalamt.toFixed(2));
        }
  
        for (const cat of getExpenseCategories) {
          const found = results.find(
            (r) => parseInt(r.getDataValue("expense_cat_id")) === parseInt(cat.id)
          );
          reportArray.push({
            catDetails: cat,
            totalAmount: found
              ? parseFloat(found.getDataValue("totalAmount") || 0)
              : 0,
            percentage:
              totalExpenseAmt > 0
                ? parseFloat(
                    (
                      ((found
                        ? parseFloat(found.getDataValue("totalAmount") || 0)
                        : 0) /
                        totalExpenseAmt) *
                      100
                    ).toFixed(2)
                  )
                : 0,
          });
        }
        // console.log("Expenses report results:", results);
        return callback(null, {
          data: {
            currency: paymentCurrencies["THB"],
            totalExpenseAmt,
            reportArray,
          },
        });
      } catch (e) {
        if (process.env.SENTRY_ENABLED === "true") {
          Sentry.captureException(e);
        }
        console.log("Error in getExpensesReport:", e.message);
        callback(new Error("FAILED_TO_FETCH_EXPENSES_REPORT"), null);
      }
    }
}
