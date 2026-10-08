import "../config/environment.js";
import AirwallexPaymentService from "../services/airwallexPayment.service.js";
import AirWallexVirtualCardSerivice from "../services/airWallexVirtualCard.service.js";
import { translateValue } from "../libraries/tranlateValue.js";

export default class AirwallexPaymentController {
  static async createMerchantOrderIdRequestId(request) {
    const {
      payload,
      headers: { i18n, deviceLocation },
      user,
    } = request;

    const userId = user?.id || 1;

    const deviceLocationLatLng = deviceLocation || "";
    if (deviceLocationLatLng) {
      const [latitude, longitude] = deviceLocationLatLng.split(",");
      payload.latitude = latitude;
      payload.longitude = longitude;
    }

    return new Promise((resolve) => {
      AirwallexPaymentService.createMerchantOrderIdRequestId(
        { payload, userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_CREATE_MERCHANT_ORDER_ID_REQUEST_ID",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "MERCHANT_ORDER_ID_REQUEST_ID_CREATED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async airWallexCreateCustomerAccount(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    const userId = user?.id || 1;

    return new Promise((resolve) => {
      AirwallexPaymentService.airWallexCreateCustomerAccount(
        { payload, userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_CREATE_CUSTOMER_ACCOUNT",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "CUSTOMER_ACCOUNT_CREATED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async airwallexCreateKycDocuments(request) {
    const {
      payload,
      headers: { i18n },
      user,
      files,
    } = request;

    const userId = user?.id || 1;

    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexCreateKycDocuments(
        { payload, userId, i18n, files },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_CREATE_KYC_DOCUMENTS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "KYC_DOCUMENTS_CREATED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async airwallexSubmitKycDocuments(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexSubmitKycDocuments(
        { payload, userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_SUBMIT_KYC_DOCUMENTS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "KYC_DOCUMENTS_SUBMITTED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async getAndUpdateAirWallexCustomerAccount(request) {
    const {
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;

    return new Promise((resolve) => {
      AirwallexPaymentService.getAndUpdateAirWallexCustomerAccount(
        { userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_UPDATE_CUSTOMER_ACCOUNT",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "CUSTOMER_ACCOUNT_UPDATED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async getAirWallexKycDetails(request) {
    const {
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.getAirWallexKycDetails(
        { userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_GET_KYC_DETAILS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "KYC_DETAILS_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async airWallexAuthorizeAccount(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    const userId = user?.id || 1;

    return new Promise((resolve) => {
      AirwallexPaymentService.airWallexAuthorizeAccount(
        { payload, userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_AUTHORIZE_CUSTOMER_ACCOUNT",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "CUSTOMER_ACCOUNT_AUTHORIZED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async airwallexKycWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n;
    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexKycWebhook(
        { payload, headers },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(i18n, err.message || "FAILED_TO_PROCESS_KYC_WEBHOOK"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            message: translateValue(i18n, "KYC_WEBHOOK_PROCESSED_SUCCESSFULLY"),
            
            error: null,
          });
        },
      );
    });
  }

  static async handlePaymentWebhook(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    console.log("Received webhook payload:", payload);

    await AirwallexPaymentService.handlePaymentWebhook({ payload });
    return {
      status: 200,
      message: "Webhook received",
      data: {},
      error: {},
    };
  }
  static async testModeUpdateAccountStatus(request) {
    const {
      payload,
      headers: { i18n },
    } = request;
    const { accountId, status } = payload;
    return new Promise((resolve) => {
      AirwallexPaymentService.testModeUpdateAccountStatus(
        { accountId, status, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(i18n, err.message || "FAILED_TO_UPDATE_ACCOUNT_STATUS"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "ACCOUNT_STATUS_UPDATED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async savedVerifiedKycDocuments(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.savedVerifiedKycDocuments(
        { userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(i18n, err.message || "FAILED_TO_SAVE_VERIFIED_KYC_DOCUMENTS"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "VERIFIED_KYC_DOCUMENTS_SAVED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async sandboxAddDeposit(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    const {
      useId,
      globalAccountId,
      amount,
      payerBankname,
      payerCountry,
      payerName,
      reference,
      statementRef,
      status,
    } = payload;
    return new Promise((resolve) => {
      AirwallexPaymentService.sandboxAddDeposit(
        {
          userId,
          globalAccountId,
          amount,
          payerBankname,
          payerCountry,
          payerName,
          reference,
          statementRef,
          status,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(i18n, err.message || "FAILED_TO_ADD_DEPOSIT"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "DEPOSIT_ADDED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async getGlobalAccounts(request) {
    const {
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.getGlobalAccounts(
        { userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_GET_GLOBAL_ACCOUNTS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "GLOBAL_ACCOUNTS_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async getAccountBalance(request) {
    const {
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.getAccountBalance(
        { userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_GET_ACCOUNT_BALANCE",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "ACCOUNT_BALANCE_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async getTransactionHistory(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id;
    const { currency, from_post_at, to_post_at, page, page_size } =
      payload || {};
    return new Promise((resolve) => {
      AirwallexPaymentService.getTransactionHistory(
        {
          userId,
          i18n,
          currency,
          fromPostAt: from_post_at,
          toPostAt: to_post_at,
          page,
          pageSize: page_size ? parseInt(page_size, 10) : undefined,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_GET_TRANSACTION_HISTORY",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "TRANSACTION_HISTORY_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async getAirwallexTransferById(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id;
    const { transferId } = payload || {};
    return new Promise((resolve) => {
      AirwallexPaymentService.getAirwallexTransferById(
        {
          userId,
          transferId,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_GET_TRANSFER_DETAILS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "TRANSFER_DETAILS_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async airwallexConnectedTransferWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n;
    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexConnectedTransferWebhook(
        payload,
        headers,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message || "FAILED_TO_PROCESS_CONNECTED_TRANSFER_WEBHOOK"
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "CONNECTED_TRANSFER_WEBHOOK_PROCESSED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async testModeTransferBetweenConnectedAccounts(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.testModeTransferBetweenConnectedAccounts(
        {
          userId,
          payload,
          i18n,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_TRANSFER_BETWEEN_CONNECTED_ACCOUNTS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "TRANSFER_BETWEEN_CONNECTED_ACCOUNTS_SUCCESSFUL",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async updateUserTransactionHistoryTable(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.updateUserTransactionHistoryTable(
        { userId },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_UPDATE_TRANSACTION_HISTORY",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "TRANSACTION_HISTORY_UPDATED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async getWalletTransactionHistory(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id;
    const { page, limit, filter } = payload || {};
    return new Promise((resolve) => {
      AirwallexPaymentService.getWalletTransactionHistory(
        {
          userId,
          page,
          limit,
          filter,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_GET_WALLET_TRANSACTION_HISTORY",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "WALLET_TRANSACTION_HISTORY_FETCHED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async handleDepositWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n;
    return new Promise((resolve) => {
      AirwallexPaymentService.handleDepositWebhook(
        payload,
        headers,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(i18n, err.message || "FAILED_TO_PROCESS_DEPOSIT_WEBHOOK"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "DEPOSIT_WEBHOOK_PROCESSED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async airwallexQrPaymentTransferToPlatformWallet(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexQrPaymentTransferToPlatformWallet(
        {
          userId,
          payload,
          i18n,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_TRANSFER_TO_PLATFORM_WALLET",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "TRANSFER_TO_PLATFORM_WALLET_SUCCESSFUL"),
            error: null,
          });
        },
      );
    });
  }

  static async airwallexQrPaymentRefundFromPlatformWalletToConnectedAccount(
    request,
  ) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id;
    return new Promise((resolve) => {
      AirwallexPaymentService.airwallexQrPaymentRefundFromPlatformWalletToConnectedAccount(
        {
          userId,
          payload,
          i18n,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_REFUND_FROM_PLATFORM_WALLET_TO_CONNECTED_ACCOUNT",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "REFUND_FROM_PLATFORM_WALLET_TO_CONNECTED_ACCOUNT_SUCCESSFUL",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async getAirwallexQrPaymentDetails(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;
    const userId = user?.id;
    const { id } = payload || {};
    return new Promise((resolve) => {
      AirwallexPaymentService.getAirwallexQrPaymentDetails(
        {
          userId,
          chargeId: id,
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_GET_QR_PAYMENT_DETAILS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "QR_PAYMENT_DETAILS_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async handleAirwallexChargesWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n;
    return new Promise((resolve) => {
      AirwallexPaymentService.handleAirwallexChargesWebhook(
        payload,
        headers,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_PROCESS_AIRWALLEX_CHARGES_WEBHOOK",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
             "AIRWALLEX_CHARGES_WEBHOOK_PROCESSED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async handleCardHolderWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n;
    return new Promise((resolve) => {
      AirwallexPaymentService.handleCardHolderWebhook(
        payload,
        headers,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_PROCESS_CARDHOLDER_WEBHOOK",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "CARDHOLDER_WEBHOOK_PROCESSED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async handleDebitCardWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n;
    return new Promise((resolve) => {
      AirwallexPaymentService.handleDebitCardWebhook(
        payload,
        headers,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_PROCESS_DEBIT_CARD_WEBHOOK",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "DEBIT_CARD_WEBHOOK_PROCESSED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async handleCardTransactionsWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n;
    return new Promise((resolve) => {
      AirwallexPaymentService.handleCardTransactionsWebhook(
        payload,
        headers,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_PROCESS_CARD_TRANSACTIONS_WEBHOOK",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "CARD_TRANSACTIONS_WEBHOOK_PROCESSED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async handleTransactionDisputeWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n;
    return new Promise((resolve) => {
      AirWallexVirtualCardSerivice.handleTransactionDisputeWebhook(
        payload,
        headers,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_PROCESS_TRANSACTION_DISPUTE_WEBHOOK",

                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "TRANSACTION_DISPUTE_WEBHOOK_PROCESSED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async handlePaymentIntentWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n;
    return new Promise((resolve) => {
      AirwallexPaymentService.handlePaymentIntentWebhook(
        payload,
        headers,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_PROCESS_PAYMENT_INTENT_WEBHOOK",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "PAYMENT_INTENT_WEBHOOK_PROCESSED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async handleFundSplitWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n;
    return new Promise((resolve) => {
      AirwallexPaymentService.handleFundSplitWebhook(
        payload,
        headers,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_PROCESS_FUND_SPLIT_WEBHOOK",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "FUND_SPLIT_WEBHOOK_PROCESSED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async handlePaymentIntentReturnWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n;
    return new Promise((resolve) => {
      AirwallexPaymentService.handlePaymentIntentReturnWebhook(
        payload,
        headers,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_HANDLE_PAYMENT_INTENT_RETURN_WEBHOOK",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "PAYMENT_INTENT_RETURN_WEBHOOK_HANDLED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async handleBalanceUpdateWebhook(request) {
    const { payload, headers } = request;
    const i18n = headers?.i18n ;
    return new Promise((resolve) => {
      AirwallexPaymentService.handleBalanceUpdateWebhook(
        payload,
        headers,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:
                  translateValue(
                    i18n,
                    err.message,
                    "FAILED_TO_HANDLE_BALANCE_UPDATE_WEBHOOK",
                  ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "BALANCE_UPDATE_WEBHOOK_HANDLED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async livenessProactiveStart(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.livenessProactiveStart(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:
                  translateValue(
                    i18n,
                    err.message,
                    "FAILED_TO_START_LIVENESS_PROACTIVE_FLOW",
                  ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "LIVENESS_PROACTIVE_FLOW_STARTED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async livenessProactiveHostedFlowStatus(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.livenessProactiveHostedFlowStatus(
        { userId, i18n },
        (err, response) => {
          // console.log("Response from livenessProactiveHostedFlowStatus:", response);
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:
                  translateValue(
                    i18n,
                    err.message,
                    "FAILED_TO_GET_LIVENESS_PROACTIVE_HOSTED_FLOW_STATUS",
                  ),
                reason: err.message,
              },
            });
          }
          // console.log("Successfully fetched liveness proactive hosted flow status:", response.data);
          return resolve({
            status: 200,
            data: response.data,
            message:
              translateValue(
                i18n,
                "LIVENESS_PROACTIVE_HOSTED_FLOW_STATUS_FETCHED_SUCCESSFULLY",
              ),
            error: null,
          });
        },
      );
    });
  }
  static async getAirwalletLivenessCheckReturnUrl(request) {
    const {
      payload,
      headers: { i18n },
    } = request;
    return new Promise((resolve) => {
      AirwallexPaymentService.getAirwalletLivenessCheckReturnUrl(
        { i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:
                  translateValue(
                    i18n,
                    err.message,
                    "FAILED_TO_GET_LIVENESS_CHECK_REDIRECT_URL",
                  ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "LIVENESS_CHECK_REDIRECT_URL_FETCHED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async getAirwalletLivenessCheckErrorUrl(request) {
    const {
      payload,
      headers: { i18n },
    } = request;
    return new Promise((resolve) => {
      AirwallexPaymentService.getAirwalletLivenessCheckErrorUrl(
        { i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:
                  translateValue(
                    i18n,
                    err.message,
                    "FAILED_TO_GET_LIVENESS_CHECK_ERROR_URL",
                  ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "LIVENESS_CHECK_ERROR_URL_FETCHED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async livenessProactiveSaveAhfiId(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.livenessProactiveSaveAhfiId(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_SAVE_AHFI_ID",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "AHFI_ID_SAVED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async createAftWalletTopup(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.createAftWalletTopup(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_CREATE_AFT_WALLET_TOPUP",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "AFT_WALLET_TOPUP_CREATED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async getPaymentIntentDetails(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.getPaymentIntentDetails(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_GET_PAYMENT_INTENT_DETAILS",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "PAYMENT_INTENT_DETAILS_RETRIEVED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async fundSplitWithConnectedAccount(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.fundSplitWithConnectedAccount(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:
                  translateValue(
                    i18n,
                    err.message,
                    "FAILED_TO_SPLIT_FUNDS_WITH_CONNECTED_ACCOUNT",
                  ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "FUNDS_SPLIT_WITH_CONNECTED_ACCOUNT_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async refundPaymentIntent(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.refundPaymentIntent(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_REFUND_PAYMENT_INTENT",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "PAYMENT_INTENT_REFUNDED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async reverseSplitAmountBySplitId(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.reverseSplitAmountBySplitId(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:
                  translateValue(
                    i18n,
                    err.message,
                    "FAILED_TO_REVERSE_SPLIT_AMOUNT_BY_SPLIT_ID",
                  ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "SPLIT_AMOUNT_REVERSED_BY_SPLIT_ID_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async mainPaymentRefundProcessHandle(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.mainPaymentRefundProcessHandle(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:
                  translateValue(
                    i18n,
                    err.message,
                    "FAILED_TO_HANDLE_MAIN_PAYMENT_REFUND_PROCESS",
                  ),
                reason: err.message,
              },
            });
          }

          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "MAIN_PAYMENT_REFUND_PROCESS_HANDLED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async getMainPaymentReverseSplitStatusBySplitId(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.getMainPaymentReverseSplitStatusBySplitId(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:
                  translateValue(
                    i18n,
                    err.message,
                    "FAILED_TO_GET_MAIN_PAYMENT_REVERSE_SPLIT_STATUS_BY_SPLIT_ID",
                  ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message:
              translateValue(
                i18n,
                "MAIN_PAYMENT_REVERSE_SPLIT_STATUS_RETRIEVED_BY_SPLIT_ID_SUCCESSFULLY",
              ),
            error: null,
          });
        },
      );
    });
  }
  static async getReverseSplitAmountBySplitId(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
     
      AirwallexPaymentService.getReverseSplitAmountBySplitId(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message:
                  translateValue(
                    i18n,
                    err.message,
                    "FAILED_TO_GET_REVERSE_SPLIT_AMOUNT_BY_SPLIT_ID",
                  ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message:
              translateValue(
                i18n,
                "REVERSAL_OF_SPLIT_AMOUNT_RETRIEVED_BY_SPLIT_ID_SUCCESSFULLY",
              ),
            error: null,
          });
        },
      );
    });
  }

  static async getAftPaymentList(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.getAftPaymentList(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_GET_AFT_PAYMENT_LIST",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "AFT_PAYMENT_LIST_FETCHED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async getAftRefundList(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user?.id || 1;
    return new Promise((resolve) => {
      AirwallexPaymentService.getAftRefundList(
        { userId, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_GET_AFT_REFUND_LIST",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "AFT_REFUND_LIST_FETCHED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async retrievePaymentIntent(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    return new Promise((resolve) => {
      AirwallexPaymentService.retrievePaymentIntent(
        { payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_RETRIEVE_PAYMENT_INTENT",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "PAYMENT_INTENT_RETRIEVED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
}
