import "../config/environment.js";
import AirwallexDirectBankTransferService, { TRANSFER_REASONS } from "../services/airwallexDirectBankTransfer.service.js";
import { translateValue } from "../libraries/tranlateValue.js";

export default class AirwallexDirectBankTransferController {
  static async beneficiaryFormSchemasGenerate(request) {
    const {
      payload,
      headers: { i18n, deviceLocation },
      user,
    } = request;

    const userId = user?.id || 1;

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.beneficiaryFormSchemasGenerate(
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
                  "FAILED_TO_GENERATE_BENEFICIARY_FORM_SCHEMA",
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
              "BENEFICIARY_FORM_SCHEMA_GENERATED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async supportedFinancialInstitutions(request) {
    const {
      headers: { i18n, deviceLocation },
      user,
      query,
    } = request;

    const userId = user?.id || 1;

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.supportedFinancialInstitutions(
        { headers: query, userId, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_FETCH_SUPPORTED_FINANCIAL_INSTITUTIONS",
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
              "SUPPORTED_FINANCIAL_INSTITUTIONS_FETCHED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async createBeneficiary(request) {
    const {
      payload,
      headers: { i18n, deviceLocation },
      user,
    } = request;

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.createBeneficiary(
        { payload, userId: user?.id || 1, i18n },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_CREATE_BENEFICIARY",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(i18n, "BENEFICIARY_CREATED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async getBeneficiaries(request) {
    const {
      query,
      headers: { i18n },
      user,
    } = request;

    if (!user?.id) {
      return { status: 401, data: null, error: { message: "UNAUTHORIZED" } };
    }

    const page = Math.max(parseInt(query?.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query?.limit, 10) || 10, 1), 100);

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.getBeneficiaries(
        { userId: user.id, page, limit },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(i18n, err.message, "FAILED_TO_FETCH_BENEFICIARIES"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response,
            message: "Beneficiaries fetched successfully",
            error: null,
          });
        },
      );
    });
  }

  static async getBeneficiary(request) {
    const {
      id,
      headers: { i18n },
      user,
    } = request;

    if (!user?.id) {
      return { status: 401, data: null, error: { message: "UNAUTHORIZED" } };
    }

    if (!/^\d+$/.test(String(id))) {
      return {
        status: 400,
        data: null,
        error: { message: "INVALID_BENEFICIARY_ID", reason: "INVALID_BENEFICIARY_ID" },
      };
    }

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.getBeneficiary(
        { userId: user.id, id },
        (err, response) => {
          if (err) {
            const notFound = err.message === "BENEFICIARY_NOT_FOUND";
            return resolve({
              status: notFound ? 404 : 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_FETCH_BENEFICIARY",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response,
            message: "Beneficiary fetched successfully",
            error: null,
          });
        },
      );
    });
  }

  static async deleteBeneficiary(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    if (!user?.id) {
      return { status: 401, data: null, error: { message: "UNAUTHORIZED" } };
    }

    if (!/^\d+$/.test(String(payload?.id))) {
      return {
        status: 400,
        data: null,
        error: { message: "INVALID_BENEFICIARY_ID", reason: "INVALID_BENEFICIARY_ID" },
      };
    }

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.deleteBeneficiary(
        { userId: user.id, payload },
        (err, response) => {
          if (err) {
            const notFound = err.message === "BENEFICIARY_NOT_FOUND";
            return resolve({
              status: notFound ? 404 : 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_DELETE_BENEFICIARY",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response,
            message: "Beneficiary deleted successfully",
            error: null,
          });
        },
      );
    });
  }

  static async updateBeneficiary(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    if (!user?.id) {
      return { status: 401, data: null, error: { message: "UNAUTHORIZED" } };
    }

    if (!/^\d+$/.test(String(payload?.id))) {
      return {
        status: 400,
        data: null,
        error: { message: "INVALID_BENEFICIARY_ID", reason: "INVALID_BENEFICIARY_ID" },
      };
    }

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.updateBeneficiary(
        { userId: user.id, id: payload.id, payload },
        (err, response) => {
          if (err) {
            const notFound = err.message === "BENEFICIARY_NOT_FOUND";
            return resolve({
              status: notFound ? 404 : 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_UPDATE_BENEFICIARY",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response,
            message: "Beneficiary updated successfully",
            error: null,
          });
        },
      );
    });
  }

  static async createTransfer(request) {
    const {
      id,
      payload,
      headers: { i18n },
      user,
    } = request;

    if (!user?.id) {
      return { status: 401, data: null, error: { message: "UNAUTHORIZED" } };
    }

    if (!/^\d+$/.test(String(id))) {
      return {
        status: 400,
        data: null,
        error: { message: "INVALID_BENEFICIARY_ID", reason: "INVALID_BENEFICIARY_ID" },
      };
    }

    if (!(Number(payload?.transfer_amount) > 0)) {
      return {
        status: 400,
        data: null,
        error: { message: "MISSING_REQUIRED_PARAMETERS", reason: "MISSING_REQUIRED_PARAMETERS" },
      };
    }

    if (!TRANSFER_REASONS.includes(payload?.reason)) {
      return {
        status: 400,
        data: null,
        error: { message: "INVALID_TRANSFER_REASON", reason: "INVALID_TRANSFER_REASON" },
      };
    }

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.createTransfer(
        { userId: user.id, id, payload },
        (err, response) => {
          if (err) {
            const notFound = err.message === "BENEFICIARY_NOT_FOUND";
            return resolve({
              status: notFound ? 404 : 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_CREATE_TRANSFER",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response,
            message: "Transfer created successfully",
            error: null,
          });
        },
      );
    });
  }

  static async handleDirectBankTransferWebhook(request) {
    const {
      payload,
      headers: { i18n },
    } = request;

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.handleDirectBankTransferWebhook(
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
                  "FAILED_TO_HANDLE_DIRECT_BANK_TRANSFER_WEBHOOK",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response,
            message: "Webhook received successfully",
            error: null,
          });
        },
      );
    });
  }

  static async getTransfers(request) {
    const {
      query,
      headers: { i18n },
      user,
    } = request;

    if (!user?.id) {
      return { status: 401, data: null, error: { message: "UNAUTHORIZED" } };
    }

    const page = Math.max(parseInt(query?.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query?.limit, 10) || 10, 1), 100);

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.getTransfers(
        { userId: user.id, page, limit },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(i18n, err.message, "FAILED_TO_FETCH_TRANSFERS"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response,
            message: "Transfers fetched successfully",
            error: null,
          });
        },
      );
    });
  }

  static async cancelTransfer(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    if (!user?.id) {
      return { status: 401, data: null, error: { message: "UNAUTHORIZED" } };
    }

    if (!payload?.airWallexTransferId) {
      return {
        status: 400,
        data: null,
        error: { message: "MISSING_REQUIRED_PARAMETERS", reason: "MISSING_REQUIRED_PARAMETERS" },
      };
    }

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.cancelTransfer(
        { userId: user.id, payload },
        (err, response) => {
          if (err) {
            const notFound = err.message === "TRANSFER_NOT_FOUND";
            return resolve({
              status: notFound ? 404 : 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_CANCEL_TRANSFER",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response,
            message: "Transfer cancelled successfully",
            error: null,
          });
        },
      );
    });
  }

  static async updateTransferFromApi(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    if (!user?.id) {
      return { status: 401, data: null, error: { message: "UNAUTHORIZED" } };
    }

    if (!payload?.airWallexTransferId) {
      return {
        status: 400,
        data: null,
        error: { message: "MISSING_REQUIRED_PARAMETERS", reason: "MISSING_REQUIRED_PARAMETERS" },
      };
    }

    return new Promise((resolve) => {
      AirwallexDirectBankTransferService.updateTransferFromApi(
        { userId: user.id, payload },
        (err, response) => {
          if (err) {
            const notFound = err.message === "TRANSFER_NOT_FOUND";
            return resolve({
              status: notFound ? 404 : 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_TO_UPDATE_TRANSFER",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response,
            message: "Transfer updated successfully",
            error: null,
          });
        },
      );
    });
  }
}
