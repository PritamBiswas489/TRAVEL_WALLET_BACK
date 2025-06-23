import db from "../databases/models/index.js";
import "../config/environment.js";
import axios from "axios";
import CurrencyService from "../services/currency.service.js";
import * as Sentry from "@sentry/node";
import PeleCardService from "../services/peleCard.service.js";
import DepositService from "../services/deposit.service.js";
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
              response?.StatusCode,
              currentLocale
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
}
