import db from "../databases/models/index.js";
import "../config/environment.js";
import axios from "axios";
import CurrencyService from "../services/currency.service.js";
import * as Sentry from "@sentry/node";
import PeleCardService from "../services/peleCard.service.js";
import DepositService from "../services/deposit.service.js";
import WalletService from "../services/wallet.service.js";
import { peleCardValidator } from "../validators/peleAddCard.validator.js";
import { peleAddToWalletValidator } from "../validators/peleAddToWallet.validator.js";
import PaymentService from "../services/payment.service.js";
const { User, UserCard, Currency, Op } = db;

export default class DepositController {
  static async peleCardPaymentConvertToToken(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    try {
      const { cardholderName, cardNumber, creditCardDateMmYy, cvv } = payload;

      const [validationError, validatedData] = await peleCardValidator(
        {
          cardholderName,
          cardNumber,
          creditCardDateMmYy,
          cvv,
        },
        i18n
      );
      if (validationError) {
        return validationError;
      }
      const currentLocale = i18n.getLocale();
      const response = await PeleCardService.ConvertToToken({
        cardholderName,
        cardNumber,
        creditCardDateMmYy,
        cvv,
      });

      if (response?.StatusCode) {
        if (response?.StatusCode === "000" && response?.ResultData) {
          const { ResultData } = response;
          const upgradedData = {
            ...ResultData,
            cardHolderName: cardholderName || null,
            userId: user?.id || null,
            nationalId: null,
          };
          const resSaveCardDetails =
            await DepositService.SaveCardDetails(upgradedData);
          if (resSaveCardDetails?.ERROR) {
            return {
              status: 500,
              data: [],
              error: {
                message: i18n.__("PELECARD_SAVE_CARD_FAILED"),
                reason: resSaveCardDetails.ERROR,
              },
            };
          }
          return {
            status: 200,
            data: resSaveCardDetails,
            message: i18n.__("CARD_DETAILS_SAVED_SUCCESSFULLY"),
            error: {},
          };
        } else {
          if (currentLocale === "he") {
            const errorMeaning = await PeleCardService.getErrorMeaning(
              response?.StatusCode
            );
            return {
              status: 500,
              data: [],
              error: {
                message:
                  errorMeaning || i18n.__("PELECARD_CONVERT_TO_TOKEN_FAILED"),
                reason:
                  errorMeaning || i18n.__("PELECARD_CONVERT_TO_TOKEN_FAILED"),
              },
            };
          } else {
            return {
              status: 500,
              data: [],
              error: {
                message:
                  response?.ErrorMessage ||
                  i18n.__("PELECARD_CONVERT_TO_TOKEN_FAILED"),
                reason:
                  response?.ErrorMessage ||
                  i18n.__("PELECARD_CONVERT_TO_TOKEN_FAILED"),
              },
            };
          }
        }
      } else {
        return {
          status: 500,
          data: [],
          error: {
            message: i18n.__("PELECARD_CONVERT_TO_TOKEN_FAILED"),
            reason: response?.ERROR || "Unknown error",
          },
        };
      }
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }
  static async getPeleCardUserCardList(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const userWithCards = await User.findOne({
        where: { id: user.id },
        include: [
          {
            model: UserCard,
            as: "cards",
            separate: true, // Important: allows independent sorting
            order: [["created_at", "DESC"]],
          },
        ],
      });
      if (!userWithCards) {
        return {
          status: 404,
          data: [],
          error: { message: i18n.__("USER_NOT_FOUND", { id: user.id }) },
        };
      }
      return {
        status: 200,
        data: userWithCards?.cards || [],
        message: i18n.__("PELECARD_USER_CARD_LIST_FETCHED"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }
  static async removeUserCard(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const { cardId } = payload;
      const userCard = await UserCard.findOne({
        where: { id: cardId, userId: user.id },
      });

      if (!userCard) {
        return {
          status: 404,
          data: [],
          error: { message: i18n.__("USER_CARD_NOT_FOUND") },
        };
      }

      await userCard.destroy();

      return {
        status: 200,
        data: [],
        message: i18n.__("USER_CARD_REMOVED_SUCCESSFULLY"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }
  static async makePaymentAddToWallet(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const [validationError, validatedData] = await peleAddToWalletValidator(
        payload,
        i18n
      );
      if (validationError) {
        return validationError;
      }

      const amount = validatedData?.amount; // Amount to be added to wallet
      const fromCurrency = validatedData?.fromCurrency; // Currency payment
      const cardToken = validatedData?.cardToken; //card token to be used for payment
      const cvv2 = validatedData?.cvv2; // CVV2 code for the card

      //Check card token in user cards record
      const userCard = await UserCard.findOne({
        where: {
          userId: user.id,
          Token: cardToken,
        },
      });

      if (!userCard) {
        return {
          status: 404,
          data: [],
          error: { message: i18n.__("USER_CARD_NOT_FOUND") },
        };
      }
      //make payment using PeleCardService
      const paymentResult = await PeleCardService.makePayment({
        amount,
        fromCurrency,
        userCard,
        cvv2,
      });

      if (paymentResult?.ERROR) {
        return {
          status: 500,
          data: [],
          error: {
            message: i18n.__("PELECARD_PAYMENT_FAILED"),
            reason:
              "Get exception error during make payment.check sentry logs.",
          },
        };
      }
      // If paymentResult has a StatusCode, it means the payment was processed
      if (paymentResult?.StatusCode) {
        const { ResultData } = paymentResult;
        const EnStatusMessage = paymentResult?.ErrorMessage;
        const HeStatusMessage =
          (await PeleCardService.getErrorMeaning(paymentResult?.StatusCode)) ||
          EnStatusMessage;

        const upgradedData = {
          ...ResultData,
          userId: user?.id || null,
          StatusCode: paymentResult?.StatusCode,
          EnStatusMessage: EnStatusMessage,
          HeStatusMessage: HeStatusMessage,
        };
        // console.log("upgradedData", upgradedData);
        // Save payment details to the database
        const savepaymentDetails =
          await PaymentService.savePelePaymentDetails(upgradedData);
        // console.log("savepaymentDetails", savepaymentDetails);
        if (savepaymentDetails?.ERROR) {
          return {
            status: 500,
            data: [],
            error: {
              message: i18n.__(
                "ADD_TO_WALLET_FAILED",
                upgradedData?.PelecardTransactionId
              ),
              reason: savepaymentDetails.ERROR,
            },
          };
        }
        //update user wallet balance
        const updatedWallet =
          await WalletService.updateUserWalletBalanceAfterPayment(
            savepaymentDetails,
            fromCurrency,
            amount
          );
        if (updatedWallet?.ERROR) {
          return {
            status: 500,
            data: [],
            error: {
              message: i18n.__(
                "ADD_TO_WALLET_FAILED",
                upgradedData?.PelecardTransactionId
              ),
              reason: updatedWallet.ERROR,
            },
          };
        }

        //update transaction history on failed or success payment

        return {
          status: 200,
          data: {
            paymentAmount: amount,
            paidCurrency: fromCurrency,
            pelecardTransactionId: savepaymentDetails?.PelecardTransactionId,
            peleStatusCode: paymentResult?.StatusCode,
            paymentStatus:
              paymentResult?.StatusCode === "000" ? "success" : "failed",
            paymentEnStatusMessage: paymentResult?.EnStatusMessage,
            paymentHeStatusMessage: paymentResult?.HeStatusMessage,
            userWallet: updatedWallet?.userWallet || {},
            currencyDetails: updatedWallet?.currencyDetails || {},
          },
          message: i18n.__("PELECARD_PAYMENT_SUCCESS"),
          error: {},
        };
      } else {
        return {
          status: 500,
          data: [],
          error: {
            message: i18n.__("PELECARD_PAYMENT_FAILED"),
            reason: "No statuscode found",
          },
        };
      }
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }

  static async getUserWallet(request) {
    const {
      headers: { i18n },
      user,
    } = request;

    try {
      const userWallet = await WalletService.getUserWallet(user.id);
      if (userWallet?.ERROR) {
        return {
          status: 500,
          data: [],
          error: {
            message: i18n.__("GET_USER_WALLET_FAILED"),
            reason: userWallet.ERROR,
          },
        };
      }
      return {
        status: 200,
        data: userWallet,
        message: i18n.__("USER_WALLET_FETCHED_SUCCESSFULLY"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }
}
