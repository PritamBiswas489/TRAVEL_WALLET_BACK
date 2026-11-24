import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import AirwallexPaymentService from "./airwallexPayment.service.js";
import  { createBeneficiary, getBeneficiariesByUser } from "./beneficiaryService.js";
const { sequelize, Op, AirwallexKycAccount, AirwallexBeneficiaryList } = db;

export default class AirwallexDirectBankTransferService {
  // Generate beneficiary form schemas for direct bank transfer
  static async beneficiaryFormSchemasGenerate(
    { payload, userId, i18n },
    callback,
  ) {
    try {
      const accessToken = await AirwallexPaymentService.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      const apiUrl = process.env.AIRWALLEX_API_URL;
      const response = await axios.post(
        `${apiUrl}/api/v1/beneficiary_form_schemas/generate`,
        {
          bank_country_code: payload.bank_country_code,
          account_currency: payload.account_currency,
          entity_type: payload.entity_type,
          type: payload.type,
          transfer_method: payload.transfer_method,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 && response.data) {
        return callback(null, {
          data: response.data,
        });
      } else {
        return callback(new Error("BENEFICIARY_FORM_SCHEMA_GENERATION_FAILED"));
      }
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error(
        "Error generating beneficiary form schemas:",
        error.message,
      );
      return callback(
        new Error(error?.response?.data?.message || "INTERNAL_SERVER_ERROR"),
      );
    }
  }
  // Fetch supported financial institutions for direct bank transfer
  static async supportedFinancialInstitutions(
    { headers, userId, i18n },
    callback,
  ) {
    try {
      const accessToken = await AirwallexPaymentService.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      const apiUrl = process.env.AIRWALLEX_API_URL;

      // Extract query parameters from headers (passed from router)
      const bankCountryCode = headers.bank_country_code;
      const accountCurrency = headers.account_currency;
      const entityType = headers.entity_type;
      const transferMethod = headers.transfer_method;

      // Validate required parameters
      if (
        !bankCountryCode ||
        !accountCurrency ||
        !entityType ||
        !transferMethod
      ) {
        return callback(new Error("MISSING_REQUIRED_PARAMETERS"));
      }
      console.log(
        "Fetching supported financial institutions with parameters:",
        {
          bankCountryCode,
          accountCurrency,
          entityType,
          transferMethod,
        },
      );

      const response = await axios.get(
        `${apiUrl}/api/v1/beneficiary_form_schemas/supported_financial_institutions`,
        {
          params: {
            bank_country_code: bankCountryCode,
            account_currency: accountCurrency,
            entity_type: entityType,
            transfer_method: transferMethod,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 && response.data) {
        return callback(null, {
          data: response.data,
        });
      } else {
        return callback(new Error("SUPPORTED_INSTITUTIONS_FETCH_FAILED"));
      }
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error(
        "Error fetching supported financial institutions:",
        error.message,
      );
      return callback(
        new Error(error?.response?.data?.message || "INTERNAL_SERVER_ERROR"),
      );
    }
  }

  //create beneficiary
  static async createBeneficiary({ payload, userId, i18n }, callback) {
    console.log("Creating beneficiary with payload:", payload);
    console.log("User ID:", userId);
    try {
      const getData = await AirwallexKycAccount.findOne({
        where: { userId },
      });
      if (!getData || !getData.airwallexAccountId) {
        return callback(new Error("AIRWALLEX_ACCOUNT_NOT_FOUND"));
      }

      console.log("Airwallex Account ID:", getData.airwallexAccountId);

      const accessToken = await AirwallexPaymentService.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      const apiUrl = process.env.AIRWALLEX_API_URL;

      // Build beneficiary payload
      const beneficiaryPayload = {
        beneficiary: {
          entity_type: payload.beneficiary.entity_type,
          type: payload.beneficiary.type,
          date_of_birth: payload.beneficiary.date_of_birth,
          first_name: payload.beneficiary.first_name,
          last_name: payload.beneficiary.last_name,
          address: {
            street_address: payload.beneficiary.address.street_address,
            city: payload.beneficiary.address.city,
            postcode: payload.beneficiary.address.postcode,
            country_code: payload.beneficiary.address.country_code,
            ...(payload.beneficiary.address.state && {
              state: payload.beneficiary.address.state,
            }),
          },
          additional_info: {
            personal_email: payload.beneficiary.additional_info.personal_email,
            ...(payload.beneficiary.additional_info.nickname && {
              nickname: payload.beneficiary.additional_info.nickname,
            }),
          },
          bank_details: {
            account_name: payload.beneficiary.bank_details.account_name,
            account_number: payload.beneficiary.bank_details.account_number,
            account_currency: payload.beneficiary.bank_details.account_currency,
            bank_country_code:
              payload.beneficiary.bank_details.bank_country_code,
            ...(payload.beneficiary.bank_details.swift_code && {
              swift_code: payload.beneficiary.bank_details.swift_code,
            }),
          },
        },
        nickname: payload.nickname,
        transfer_methods: payload.transfer_methods,
      };

      console.log(
        "Sending beneficiary creation request to Airwallex:",
        JSON.stringify(beneficiaryPayload, null, 2),
      );

      const response = await axios.post(
        `${apiUrl}/api/v1/beneficiaries/create`,
        beneficiaryPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "x-on-behalf-of": getData.airwallexAccountId,
          },
        },
      );

      console.log("Beneficiary creation response:", response.data);

      if (response?.data?.id) {
        const beneficiary = await createBeneficiary(response.data, userId);    
        return callback(null, {
          data: response.data,
        });
      } else {
        return callback(new Error("BENEFICIARY_CREATION_FAILED"));
      }
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error creating beneficiary:", error.message);
      return callback(
        new Error(error?.response?.data?.message || "INTERNAL_SERVER_ERROR"),
      );
    }
  }

  // list beneficiaries of user with pagination and total count
  static async getBeneficiaries({ userId, page, limit }, callback) {
    try {
      const result = await getBeneficiariesByUser(userId, { page, limit });
      return callback(null, result);
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error fetching beneficiaries:", error.message);
      return callback(new Error("INTERNAL_SERVER_ERROR"));
    }
  }
}
