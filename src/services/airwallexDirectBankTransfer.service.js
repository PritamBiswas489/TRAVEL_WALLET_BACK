import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { randomUUID } from "crypto";
import AirwallexPaymentService from "./airwallexPayment.service.js";
import redisClient from "../config/redis.config.js";
import { getBeneficiaryByMainId } from "./beneficiaryService.js";
import UserService from "./user.service.js";
import {
  createBeneficiary,
  getBeneficiariesByUser,
  getBeneficiaryById,
  updateBeneficiaryRecord,
} from "./beneficiaryService.js";
import {
  createTransferRecord,
  updateTransferRecord,
  getTransfersByUser,
  getTransferByAirwallexId,
} from "./transferRecordService.js";

import SettingsService from "./settings.service.js";

export const TRANSFER_REASONS = [
  "overseas transfer to same name account",
  "transfer between israeli residents accounts",
  "payment for private car purchase",
  "payment for tourism services entirely abroad",
  "insurance services covering risks abroad",
  "purchase of flight tickets abroad",
  "tuition fees to educational institutions abroad",
  "participation fees for seminar or exhibition abroad",
  "advertising expenses abroad",
  "participation fees in tenders abroad",
  "correspondent fees for banks abroad",
  "payment for land, sea, air transport entirely abroad",
  "payment for port, freight, storage services abroad",
  "agent fees (maximum 5% or $10,000 commission)",
  "payment for off-the-shelf software import (≤ $1,000 per item)",
  "fees for international organization membership",
  "advance refund to a customer abroad, without interest, not exceeding down payment",
  "allowances paid to foreign resident according to israeli law",
  "acquisition of social rights from a foreign state or institution owned by a foreign state",
  "resident investing in foreign stock exchange securities",
  "proceeds from selling tel aviv stock exchange securities",
  "gift or support payment from an individual to a relative",
  "payment of private property rent abroad, not claimed as business expense",
  "allowance for medical travel and treatment expenses",
];
const {
  sequelize,
  Op,
  AirwallexKycAccount,
  AirwallexBeneficiaryList,
  AirwallexBeneficiaryDirectBankTransfers,
} = db;

function formatDateDDMMYYYY(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${date.getFullYear()}`;
}

function buildBeneficiaryPayload(payload) {
  return {
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
        bank_country_code: payload.beneficiary.bank_details.bank_country_code,
        ...(payload.beneficiary.bank_details.swift_code && {
          swift_code: payload.beneficiary.bank_details.swift_code,
        }),
      },
    },
    nickname: payload.nickname,
    transfer_methods: payload.transfer_methods,
  };
}

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
      let airwallexAccountId = payload?.airwallexAccountId;
      if (!airwallexAccountId) {
                     airwallexAccountId = await UserService.getUserAirwallexKycAccountId(userId);
                 }
                 if (!airwallexAccountId) {
                     return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"), null);
                 }

      console.log("Airwallex Account ID:", airwallexAccountId);

      const accessToken = await AirwallexPaymentService.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      const apiUrl = process.env.AIRWALLEX_API_URL;

      // Build beneficiary payload
      const beneficiaryPayload = buildBeneficiaryPayload(payload);

      //validate beneficiary details
      const responseValidation = await axios.post(
        `${apiUrl}/api/v1/beneficiaries/validate`,
        beneficiaryPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "x-on-behalf-of": airwallexAccountId,
          },
        },
      );
      // Check if beneficiary validation passed
      if (responseValidation.data !== "OK") {
        return callback(new Error("BENEFICIARY_VALIDATION_FAILED"));
      }

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
            "x-on-behalf-of": airwallexAccountId,
          },
        },
      );

      console.log("Beneficiary creation response:", response.data);

      if (response?.data?.id) {
        const beneficiary = await createBeneficiary(response.data, userId);
        return callback(null, {
          data: beneficiary,
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

  // get a single beneficiary owned by the user
  static async getBeneficiary({ userId, id }, callback) {
    try {
      const beneficiary = await getBeneficiaryById(id, userId);
      if (!beneficiary) {
        return callback(new Error("BENEFICIARY_NOT_FOUND"));
      }
      return callback(null, { beneficiary });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error fetching beneficiary:", error.message);
      return callback(new Error("INTERNAL_SERVER_ERROR"));
    }
  }

  // delete beneficiary on Airwallex, then remove it from local DB
  static async deleteBeneficiary({ userId, payload }, callback) {
    try {
    
      const beneficiary = await getBeneficiaryById(payload?.id, userId);
      if (!beneficiary) {
        return callback(new Error("BENEFICIARY_NOT_FOUND"));
      }

      let airwallexAccountId = payload?.airwallexAccountId;
      if (!airwallexAccountId) {
        airwallexAccountId = await UserService.getUserAirwallexKycAccountId(userId);
      }
      if (!airwallexAccountId) {
        return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"));
      }
      const accessToken = await AirwallexPaymentService.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      const apiUrl = process.env.AIRWALLEX_API_URL;

      const response = await axios.post(
        `${apiUrl}/api/v1/beneficiaries/${beneficiary.mainId}/delete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "x-on-behalf-of": airwallexAccountId,
          },
        },
      );
      if (response?.data !== true) {
        return callback(new Error("FAILED_TO_DELETE_BENEFICIARY"));
      }

      await beneficiary.destroy();

      return callback(null, {
        id: beneficiary.id,
        apiResponse: response?.data,
      });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error deleting beneficiary:", error.message);
      return callback(
        new Error(error?.response?.data?.message || "INTERNAL_SERVER_ERROR"),
      );
    }
  }

  // update beneficiary on Airwallex, then sync local DB
  static async updateBeneficiary({ userId, id, payload }, callback) {
    try {
      const beneficiary = await getBeneficiaryById(id, userId);
      if (!beneficiary) {
        return callback(new Error("BENEFICIARY_NOT_FOUND"));
      }

      let airwallexAccountId = payload?.airwallexAccountId;
      if (!airwallexAccountId) {
        airwallexAccountId = await UserService.getUserAirwallexKycAccountId(userId);
      }
      if (!airwallexAccountId) {
        return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"));
      }

      const accessToken = await AirwallexPaymentService.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      const apiUrl = process.env.AIRWALLEX_API_URL;
      const beneficiaryPayload = buildBeneficiaryPayload(payload);

      const response = await axios.post(
        `${apiUrl}/api/v1/beneficiaries/${beneficiary.mainId}/update`,
        beneficiaryPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "x-on-behalf-of": airwallexAccountId,
          },
        },
      );
      console.log("Airwallex update response:", response?.data);

      await updateBeneficiaryRecord(beneficiary, response?.data);

      //refresh beneficiary data from the database
      await beneficiary.reload();

      return callback(null, { beneficiary, apiResponse: response?.data });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error updating beneficiary:", error.message);
      return callback(
        new Error(error?.response?.data?.message || "INTERNAL_SERVER_ERROR"),
      );
    }
  }

  // create a transfer to a beneficiary on Airwallex
  static async createTransfer({ userId, id, payload }, callback) {
    try {
      const beneficiary = await getBeneficiaryById(id, userId);
      if (!beneficiary) {
        return callback(new Error("BENEFICIARY_NOT_FOUND"));
      }

      const transferMethod = Array.isArray(beneficiary.transferMethods)
        ? beneficiary.transferMethods[0]
        : null;
      if (!transferMethod) {
        return callback(new Error("MISSING_REQUIRED_PARAMETERS"));
      }

      let airwallexAccountId = payload?.airwallexAccountId;
    
      if (!airwallexAccountId) {
        airwallexAccountId = await UserService.getUserAirwallexKycAccountId(userId);
      }
      if (!airwallexAccountId) {
        return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"));
      }

      const accessToken = await AirwallexPaymentService.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }
      const directBankTransferFees = JSON.parse(await SettingsService.getSetting("direct_bank_transfer_fees").then(res => res.data?.value || "{}"));
    
      const payloadTransfer = {
        beneficiary_id: beneficiary.mainId,
        transfer_amount: String(payload.transfer_amount),
        transfer_currency: beneficiary.accountCurrency,
        transfer_method: transferMethod,
        reason: payload.reason,
        reference:
          `TC-${String(userId).padStart(4, "0")}-${String(id).padStart(4, "0")}-${transferMethod}-${formatDateDDMMYYYY(new Date())}`.slice(
            0,
            140,
          ),
        request_id: randomUUID(),
        source_currency: "ILS",
        fee_paid_by: "PAYER",
        application_fee_options: [
          {
            source_type: "TRANSFER",
            type: directBankTransferFees.type,
            ...(directBankTransferFees.type === "PERCENTAGE"
              ? { percentage: directBankTransferFees.percentage }
              : { amount: directBankTransferFees.fixed, currency: "ILS" }),
             
          },
        ],
      };
      console.log("Payload for transfer:", payloadTransfer);

      const apiUrl = process.env.AIRWALLEX_API_URL;

      const response = await axios.post(
        `${apiUrl}/api/v1/transfers/create`,
        payloadTransfer,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "x-on-behalf-of": airwallexAccountId,
          },
        },
      );
      console.log("Transfer response:", JSON.stringify(response?.data));
      const transferRecord = await createTransferRecord(
        response.data,
        userId,
        id,
      );
      return callback(null, { transferRecord });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error(
        "Error creating transfer:",
        JSON.stringify(error.response?.data),
      );
      return callback(
        new Error(error?.response?.data?.message || "INTERNAL_SERVER_ERROR"),
      );
    }
  }
  // handle direct bank transfer webhook events from Airwallex (logic to be added)
  static async handleDirectBankTransferWebhook({ payload }, callback) {
    console.log("Direct bank transfer webhook payload:", payload);
    const payloadEventId = payload?.id;
    let webhookDedupeKey = null;

    // release the dedupe key on failure so Airwallex retries are processed
    const done = async (err, response) => {
      if (err && webhookDedupeKey) {
        await redisClient.del(webhookDedupeKey);
      }
      return callback(err, response);
    };

    try {
      if (payloadEventId) {
        webhookDedupeKey = `airwallex:webhook:seen:direct_bank_transfer:${payloadEventId}`;
        const isNewDelivery = await redisClient.set(
          webhookDedupeKey,
          "1",
          "EX",
          60 * 60 * 24,
          "NX",
        );
        if (!isNewDelivery) {
          console.log(`Duplicate direct bank transfer webhook ignored for event ${payloadEventId}`);
          return callback(null, null);
        }
      }
      console.log("Processing direct bank transfer webhook for account:", payload?.account_id);

      if (!payload?.account_id) {
        return done(null, null);
      }

      const KycAccount = await UserService.getUserAirwallexKycDetails({ whereFields: { airwallexAccountId: payload?.account_id } }); 
      
      if (!KycAccount) {
        return done(new Error("AIRWALLEX_ACCOUNT_NOT_FOUND"));
      }
      const userId = KycAccount.userId;
      const airWallexTransferId = payload?.data?.id;

      const existance = await getTransferByAirwallexId(airWallexTransferId);
      if (!existance) {
        return this.createTransferFromApi(
          { userId, payload: { airwallexAccountId: payload?.account_id, airWallexTransferId } },
          done,
        );
      }
      if (existance.userId !== userId) {
        return done(new Error("TRANSFER_USER_MISMATCH"));
      }
      return this.updateTransferFromApi(
        { userId, payload:{airwallexAccountId: payload?.account_id, airWallexTransferId} },
        done,
      );
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error handling direct bank transfer webhook:", error.message);
      return done(new Error("INTERNAL_SERVER_ERROR"));
    }
  }

  // list transfers of user with pagination and total count
  static async getTransfers({ userId, page, limit }, callback) {
    try {
      const result = await getTransfersByUser(userId, { page, limit });
      return callback(null, result);
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error fetching transfers:", error.message);
      return callback(new Error("INTERNAL_SERVER_ERROR"));
    }
  }

  // fetch a transfer from Airwallex and sync the local record
  static async updateTransferFromApi(
    { userId,  payload },
    callback,
  ) {
    console.log(
      "Updating transfer from API with airWallexTransferId:",
      payload?.airWallexTransferId,
    );
    try {
      let airwallexAccountId = payload?.airwallexAccountId;
      console.log("Airwallex Account ID from payload:", airwallexAccountId);
      if (!airwallexAccountId) {
        airwallexAccountId = await UserService.getUserAirwallexKycAccountId(userId);
      }
      if (!airwallexAccountId) {
        return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"));
      }

      const accessToken = await AirwallexPaymentService.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      const apiUrl = process.env.AIRWALLEX_API_URL;
      const response = await axios.get(
        `${apiUrl}/api/v1/transfers/${payload?.airWallexTransferId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-on-behalf-of": airwallexAccountId,
          },
        },
      );
      //checking transfer existnace
      if (!response.data || !response.data.id) {
        return callback(new Error("TRANSFER_NOT_FOUND"));
      }

      const transferRecord = await updateTransferRecord(response.data, userId);
      if (!transferRecord) {
        return callback(new Error("TRANSFER_NOT_FOUND"));
      }
      await transferRecord.reload();
      return callback(null, { transferRecord, apiResponse: response.data });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error(
        "Error updating transfer:",
        JSON.stringify(error.response?.data),
      );
      return callback(
        new Error(error?.response?.data?.message || "INTERNAL_SERVER_ERROR"),
      );
    }
  }
  // cancel a transfer on Airwallex and sync the local record status
  static async cancelTransfer({ userId, payload }, callback) {
    try {
      const transferRecord = await getTransferByAirwallexId(payload?.airWallexTransferId);
      if (!transferRecord || transferRecord.userId !== userId) {
        return callback(new Error("TRANSFER_NOT_FOUND"));
      }

      let airwallexAccountId = payload?.airwallexAccountId;
      console.log("Airwallex Account ID from payload:", airwallexAccountId);
      if (!airwallexAccountId) {
        airwallexAccountId = await UserService.getUserAirwallexKycAccountId(userId);
      }
      const accessToken = await AirwallexPaymentService.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      const apiUrl = process.env.AIRWALLEX_API_URL;
      const response = await axios.post(
        `${apiUrl}/api/v1/transfers/${payload?.airWallexTransferId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-on-behalf-of": airwallexAccountId,
          },
        },
      );
      console.log("Cancel transfer response:", response.data);
      if(response?.data !=='OK'){
        return callback(new Error("FAILED_TO_CANCEL_TRANSFER"));
      }
      return callback(null, { status: 'OK', apiResponse: response.data });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error(
        "Error cancelling transfer:",
        JSON.stringify(error.response?.data),
      );
      return callback(
        new Error(error?.response?.data?.message || "INTERNAL_SERVER_ERROR"),
      );
    }
  }

  static async createTransferFromApi(
    { userId, payload },
    callback,
  ) {
    console.log(
      "Creating transfer from API with airWallexTransferId:",
      payload?.airWallexTransferId,
    );
    try {
      let airwallexAccountId = payload?.airwallexAccountId;
      console.log("Airwallex Account ID from payload:", airwallexAccountId);
      if (!airwallexAccountId) {
        airwallexAccountId = await UserService.getUserAirwallexKycAccountId(userId);
      }
      const accessToken = await AirwallexPaymentService.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      const apiUrl = process.env.AIRWALLEX_API_URL;
      const response = await axios.get(
        `${apiUrl}/api/v1/transfers/${payload?.airWallexTransferId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-on-behalf-of": airwallexAccountId,
          },
        },
      );

      if (!response.data || !response.data.id) {
        return callback(new Error("TRANSFER_NOT_FOUND"));
      }
      const beneficiary = await getBeneficiaryByMainId(
        response.data.beneficiary_id,
        userId,
      );

      const transferRecord = await createTransferRecord(
        response.data,
        userId,
        beneficiary?.id || null,
      );
      return callback(null, { transferRecord, apiResponse: response.data });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error(
        "Error creating transfer:",
        JSON.stringify(error.response?.data),
      );
      return callback(
        new Error(error?.response?.data?.message || "INTERNAL_SERVER_ERROR"),
      );
    }
  }
}
