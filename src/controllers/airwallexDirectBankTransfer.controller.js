import "../config/environment.js";
import AirwallexDirectBankTransferService from "../services/airwallexDirectBankTransfer.service.js";
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
}
