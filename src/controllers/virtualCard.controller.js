import "../config/environment.js";
import * as Sentry from "@sentry/node";
import AirWallexVirtualCardSerivice from "../services/airWallexVirtualCard.service.js";
export default class VirtualCardController {

  static async airwallexCreateIndividualCardholder({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user.id;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.airwallexCreateIndividualCardholder({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("CREATE_CARDHOLDER_FAILED"), reason: error.message },
          });
        } else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("CARDHOLDER_CREATED_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    })
  }
  static async airwallexGetAllCardholders({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user.id;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.airwallexGetAllCardholders({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("GET_CARDHOLDERS_FAILED"), reason: error.message },
          });
        } else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("CARDHOLDERS_FETCHED_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }
  static async airwallexDeleteCardholder({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user.id;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.airwallexDeleteCardholder({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("DELETE_CARDHOLDER_FAILED"), reason: error.message },
          });
        } else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("CARDHOLDER_DELETED_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }

  static async airwallexCreateVirtualCard({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user.id;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.airwallexCreateVirtualCard({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("CREATE_VIRTUAL_CARD_FAILED"), reason: error.message },
          });
        } else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("VIRTUAL_CARD_CREATED_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }

  static async saveAllCardInRecord({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user.id;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.saveAllCardInRecord({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("SAVE_ALL_CARD_IN_RECORD_FAILED"), reason: error.message },
          });
        }
        else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("SAVE_ALL_CARD_IN_RECORD_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }
  static async getAllCardInRecord({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user.id;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.getAllCardInRecord({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("GET_ALL_CARD_IN_RECORD_FAILED"), reason: error.message },
          });
        }
        else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("GET_ALL_CARD_IN_RECORD_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }
  static async getSensitiveDetails({ headers, user, payload }) {

    const { i18n } = headers;
    const userId = user?.id ?? 1;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.getSensitiveDetails({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("GET_SENSATIVE_DETAILS_FAILED"), reason: error.message },
          });
        }
        else {
          resolve(response);
        }
      })
    });
  }
  static async updateCardStatus({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user?.id ?? 1;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.updateCardStatus({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("UPDATE_CARD_STATUS_FAILED"), reason: error.message },
          });
        }
        else {
          resolve(response);
        }
      })
    });
  }
  static async getCardLimit({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user?.id ?? 1;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.getCardLimit({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("GET_CARD_LIMIT_FAILED"), reason: error.message },
          });
        }
        else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("GET_CARD_LIMIT_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }
  static async updateCardLimit({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user?.id ?? 1;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.updateCardLimit({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("UPDATE_CARD_LIMIT_FAILED"), reason: error.message },
          });
        }
        else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("UPDATE_CARD_LIMIT_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }
  static async testingCreateTransactionForTheProvidedCard({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user?.id ?? 1;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.testingCreateTransactionForTheProvidedCard({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("CREATE_TRANSACTION_FAILED"), reason: error.message },
          });
        }
        else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("CREATE_TRANSACTION_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }
  static async getCardTransactionList({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user?.id ?? 1;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.getCardTransactionList({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("GET_CARD_TRANSACTION_LIST_FAILED"), reason: error.message },
          });
        }
        else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("GET_CARD_TRANSACTION_LIST_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }
  static async getUserCardTransactionList({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user?.id ?? 1;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.getUserCardTransactionList({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("GET_USER_CARD_TRANSACTION_LIST_FAILED"), reason: error.message },
          });
        }
        else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("GET_USER_CARD_TRANSACTION_LIST_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }
  static async transactionDispute({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user?.id ?? 1;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.transactionDispute({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("TRANSACTION_DISPUTE_FAILED"), reason: error.message },
          });
        }
        else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("TRANSACTION_DISPUTE_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }

  static async transactionDisputeUpdate({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user?.id ?? 1;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.transactionDisputeUpdate({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("TRANSACTION_DISPUTE_UPDATE_FAILED"), reason: error.message },
          });
        }
        else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("TRANSACTION_DISPUTE_UPDATE_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }

  static async getTransactionDisputeList({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user?.id ?? 1;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.getTransactionDisputeList({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("GET_TRANSACTION_DISPUTE_LIST_FAILED"), reason: error.message },
          });
        }
        else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("GET_TRANSACTION_DISPUTE_LIST_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }

  static async setVirtualCardBackgroundImage({ headers, user, payload }) {
    const { i18n } = headers;
    const userId = user?.id ?? 1;
    return new Promise(async (resolve) => {
      AirWallexVirtualCardSerivice.setVirtualCardBackgroundImage({ userId, payload }, (error, response) => {
        if (error) {
          process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
          resolve({
            status: 500,
            data: [],
            error: { message: i18n.__("SET_VIRTUAL_CARD_BACKGROUND_IMAGE_FAILED"), reason: error.message },
          });
        }
        else {
          resolve({
            status: 200,
            data: response,
            message: i18n.__("SET_VIRTUAL_CARD_BACKGROUND_IMAGE_SUCCESSFULLY"),
            error: {},
          });
        }
      })
    });
  }

}