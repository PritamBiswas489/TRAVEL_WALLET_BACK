import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import WalletService from "./wallet.service.js";
import UserService from "./user.service.js";
import { codeChallenge } from "../libraries/utility.js";
import { airwallexKycValidator } from "../validators/airwallexKyc.validator.js";
import { getUserKycStatus } from "../libraries/utility.js"; 

const { Op, User, WalletAirwallexPayments, AirwallexCustomers, AirwallexKycAccount, UserKyc } = db;

export default class AirwallexPaymentService {
  static async getAirWalletxToken() {
    const apiKey = process.env.AIRWALLEX_API_KEY;
    const clientId = process.env.AIRWALLEX_CLIENT_ID;
    const apiUrl = process.env.AIRWALLEX_API_URL;
    const accountId = process.env.AIRWALLEX_ACCOUNT_ID;

    const res = await axios.post(
      `${apiUrl}/api/v1/authentication/login`,
      {},
      {
        headers: {
          "x-client-id": clientId,
          "x-api-key": apiKey,
          "x-login-as": accountId,
        },
      },
    );

    return res?.data?.token || null;
  }
  //create airwallex customer account
  static async airWallexCreateCustomerAccount(
    { payload, userId, i18n },
    callback,
  ) {
    const platformIdentifier = `AWCUST-${userId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const userDetails = await UserService.getUserById(userId);
    const email = userDetails?.email;
    if (!email) {
      return callback(new Error("USER_EMAIL_NOT_FOUND"));
    }

    try {
      const accressToken = await this.getAirWalletxToken();
      if (!accressToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }
      console.log(
        "Creating Airwallex customer account with payload:",
        `${process.env.AIRWALLEX_API_URL}/api/v1/accounts/create`,
      );

      const response = await axios.post(
        `${process.env.AIRWALLEX_API_URL}/api/v1/accounts/create`,
        {
          account_details: {
            legal_entity_type: "INDIVIDUAL",
          },
          customer_agreements: {
            agreed_to_data_usage: true,
            agreed_to_terms_and_conditions: true,
          },
          primary_contact: {
            email: email,
          },
          identifier: platformIdentifier,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accressToken}`,
          },
        },
      );
      console.log("Airwallex account creation response:", response?.data);

      if (response?.data?.id) {
        await this.saveAirwallexKycAccountDetails({
          accountData: response.data,
          userId,
        });
        return callback(null, {
          data: response.data,
        });
      } else {
        return callback(new Error("AIRWALLEX_ACCOUNT_CREATION_FAILED"));
      }
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error creating Airwallex customer account:", error);
      return callback(new Error("INTERNAL_SERVER_ERROR"));
    }
  }
  static async getAndUpdateAirWallexCustomerAccount(
    { userId, i18n },
    callback,
  ) {
    try {
      const accressToken = await this.getAirWalletxToken();
      if (!accressToken) {
        return {
          status: 400,
          data: null,
          error: {
            message: i18n.__("AIRWALLEX_TOKEN_NOT_GENERATED"),
          },
        };
      }
      const getData = await AirwallexKycAccount.findOne({
        where: { userId },
      });
      if (!getData || !getData.airwallexAccountId) {
        return {
          status: 404,
          data: null,
          error: {
            message: i18n.__("AIRWALLEX_ACCOUNT_NOT_FOUND"),
          },
        };
      }
      const response = await axios.get(
        `${process.env.AIRWALLEX_API_URL}/api/v1/accounts/${getData.airwallexAccountId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accressToken}`,
          },
        },
      );
      if (response?.data?.id) {
        await this.saveAirwallexKycAccountDetails({
          accountData: response.data,
          userId,
        });
        return callback(null, {
          data: response.data,
        });
      } else {
        return callback(new Error("AIRWALLEX_ACCOUNT_FETCH_FAILED"));
      }
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error updating Airwallex customer account:", error);
      return {
        status: 500,
        data: null,
        error: {
          message: i18n.__("INTERNAL_SERVER_ERROR"),
          reason: error.message,
        },
      };
    }
  }
  static async saveAirwallexKycAccountDetails({ accountData, userId }) {
    const ad = accountData?.account_details || {};
    const individual = ad?.individual_details || {};
    const customerAgreements = accountData?.customer_agreements || {};
    const termsAndConditions = customerAgreements?.terms_and_conditions || {};
    const primaryContact = accountData?.primary_contact || {};

    const mappedData = {
      userId,
      // top-level
      airwallexAccountId: accountData?.id || null,
      identifier: accountData?.identifier || null,
      nickname: accountData?.nickname || null,
      status: accountData?.status || null,
      viewType: accountData?.view_type || null,

      // account_details — legal entity
      legalEntityId: ad?.legal_entity_id || null,
      legalEntityIdentifier: ad?.legal_entity_identifier || null,
      legalEntityType: ad?.legal_entity_type || null,

      // account_details.attachments
      additionalFiles: ad?.attachments?.additional_files ?? [],

      // account_details.individual_details
      firstName: individual?.first_name || null,
      firstNameEnglish: individual?.first_name_english || null,
      lastName: individual?.last_name || null,
      lastNameEnglish: individual?.last_name_english || null,
      middleName: individual?.middle_name || null,
      middleNameEnglish: individual?.middle_name_english || null,
      dateOfBirth: individual?.date_of_birth || null,
      employer: individual?.employer || null,
      estimatedMonthlyIncome: individual?.estimated_monthly_income || null,
      hasMemberHoldingPublicOffice:
        individual?.has_member_holding_public_office ?? null,
      hasPriorFinancialInstitutionRefusal:
        individual?.has_prior_financial_institution_refusal ?? null,
      liveSelfieFileId: individual?.live_selfie_file_id || null,
      nationality: individual?.nationality || null,
      occupation: individual?.occupation || null,
      otherNames: individual?.other_names || null,
      personId: individual?.person_id || null,
      phoneNumber: individual?.phone_number || null,
      photoHoldingIdentificationFileId:
        individual?.photo_holding_identification_file_id || null,
      residentialAddress: individual?.residential_address || null,
      residentialAddressEnglish:
        individual?.residential_address_english || null,
      identifications: individual?.identifications ?? {},
      accountUsage: individual?.account_usage ?? {},
      individualDocuments: individual?.attachments?.individual_documents ?? [],

      // business / trustee
      businessDetails: ad?.business_details || null,
      businessPersonDetails: ad?.business_person_details ?? [],
      trusteeDetails: ad?.trustee_details || null,

      // customer_agreements
      agreedToDataUsage: customerAgreements?.agreed_to_data_usage ?? null,
      agreedToTermsAndConditions:
        customerAgreements?.agreed_to_terms_and_conditions ?? null,
      serviceAgreementType: termsAndConditions?.service_agreement_type || null,
      deviceData: termsAndConditions?.device_data ?? {},

      // primary_contact
      primaryContactEmail: primaryContact?.email || null,
      primaryContactIdentityFiles:
        primaryContact?.attachments?.identity_files ?? [],

      // Airwallex-side timestamp
      airwallexCreatedAt: accountData?.created_at || null,
      userInputData: accountData?.userInputData || null, // store raw user input data for reference
    };

    const existing = await AirwallexKycAccount.findOne({
      where: { airwallexAccountId: mappedData.airwallexAccountId },
    });

    if (existing) {
      await existing.update(mappedData);
      return existing;
    } else {
      return await AirwallexKycAccount.create(mappedData);
    }
  }
  static async airwallexSubmitKycDocuments(
    { payload, userId, i18n, files },
    callback,
  ) {
    try {
      const [validError, validationResult] =
        await airwallexKycValidator(payload);
      console.log("KYC validation result:", validationResult);
      if (validError) {
        return callback(new Error(validError?.error?.message));
      }
      console.log("Validated KYC data:", validationResult);
      console.log("Received files for KYC submission:", files);

      if (!files?.identificationFrontImage?.path) {
        return callback(new Error("IDENTIFICATION_FRONT_IMAGE_REQUIRED"));
      }
      if (
        !files?.identificationBackImage?.path &&
        validationResult?.identificationType !== "PASSPORT"
      ) {
        return callback(new Error("IDENTIFICATION_BACK_IMAGE_REQUIRED"));
      }
      if (!files?.proofOfAddressImage?.path) {
        return callback(new Error("PROOF_OF_ADDRESS_IMAGE_REQUIRED"));
      }
      if (!files?.selfieImage?.path) {
        return callback(new Error("SELFIE_IMAGE_REQUIRED"));
      }

      const frontImagePath = files.identificationFrontImage.path;
      const backImagePath = files.identificationBackImage?.path;
      const poaImagePath = files.proofOfAddressImage.path;
      const selfieImagePath = files.selfieImage.path;

      const accessToken = await this.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      // Helper to extract Airwallex error message
      const extractAirwallexError = (error) => {
        if (error.response?.data) {
          const { code, message, source, trace_id, details } =
            error.response.data;
          const errMsg = [
            code ? `[${code}]` : null,
            message || "Unknown error",
            source ? `(source: ${source})` : null,
            trace_id ? `| trace_id: ${trace_id}` : null,
          ]
            .filter(Boolean)
            .join(" ");
          console.error("Airwallex API Error:", error.response.data);
          return {
            errMsg,
            airwallexError: { code, message, source, trace_id, details },
          };
        }
        return { errMsg: error.message, airwallexError: null };
      };

      let airwallexId = null;
      // Check if user already has an Airwallex account and delete if exists and create new account if validation requires resubmission
      if (validationResult.resubmit) {
        await AirwallexKycAccount.destroy({ where: { userId } });
        await UserKyc.destroy({ where: { userId } });
      }
      const getData = await AirwallexKycAccount.findOne({ where: { userId } });
      if (!getData) {
        const platformIdentifier = `AWCUST-${userId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const email = validationResult.email;
        const mobile = validationResult.mobile;

        let createResponse;
        try {
          createResponse = await axios.post(
            `${process.env.AIRWALLEX_API_URL}/api/v1/accounts/create`,
            {
              account_details: { legal_entity_type: "INDIVIDUAL" },
              customer_agreements: {
                agreed_to_data_usage: true,
                agreed_to_terms_and_conditions: true,
                agreed_to_biometrics_consent: true,
              },
              primary_contact: { email, mobile },
              identifier: platformIdentifier,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );
        } catch (error) {
          const { errMsg, airwallexError } = extractAirwallexError(error);
          return callback(new Error(errMsg), { airwallexError });
        }

        if (createResponse?.data?.id) {
          airwallexId = createResponse.data.id;
          await this.saveAirwallexKycAccountDetails({
            accountData: createResponse.data,
            userId,
          });
        } else {
          return callback(new Error("AIRWALLEX_ACCOUNT_CREATION_FAILED"));
        }
      } else {
        airwallexId = getData?.airwallexAccountId;
        if (!airwallexId) {
          return callback(new Error("AIRWALLEX_ACCOUNT_NOT_FOUND"));
        }
      }

      // Upload images to Airwallex and get file IDs
      const uploadFile = async (filePath) => {
        const form = new FormData();
        form.append("file", fs.createReadStream(filePath));
        try {
          const res = await axios.post(
            `${process.env.AIRWALLEX_FILES_API_URL}/api/v1/files/upload`,
            form,
            {
              headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );
          return res.data.file_id;
        } catch (error) {
          const { errMsg, airwallexError } = extractAirwallexError(error);
          throw { errMsg, airwallexError };
        }
      };

      let frontFileId, backFileId, poaFileId, selfieFileId;
      try {
        frontFileId = await uploadFile(frontImagePath);
        backFileId = backImagePath ? await uploadFile(backImagePath) : null;
        poaFileId = await uploadFile(poaImagePath);
        selfieFileId = await uploadFile(selfieImagePath);
      } catch (uploadErr) {
        return callback(new Error(uploadErr.errMsg), {
          airwallexError: uploadErr.airwallexError,
        });
      }

      if (!frontFileId) {
        return callback(new Error("IDENTIFICATION_FRONT_IMAGE_UPLOAD_FAILED"));
      }
      if (!backFileId && backImagePath) {
        return callback(new Error("IDENTIFICATION_BACK_IMAGE_UPLOAD_FAILED"));
      }
      if (!selfieFileId) {
        return callback(new Error("SELFIE_IMAGE_UPLOAD_FAILED"));
      }
      if (!poaFileId) {
        return callback(new Error("PROOF_OF_ADDRESS_IMAGE_UPLOAD_FAILED"));
      }

      console.log("Uploaded file IDs:", { frontFileId, backFileId, poaFileId });

      const identificationPayload = (() => {
        const type = validationResult.identificationType;
        const base = {
          identification_type: type,
          issuing_country_code: validationResult.nationality,
        };
        if (type === "PASSPORT") {
          return { ...base, passport: { front_file_id: frontFileId } };
        } else if (type === "DRIVERS_LICENSE") {
          return {
            ...base,
            drivers_license: {
              front_file_id: frontFileId,
              ...(backFileId && { back_file_id: backFileId }),
            },
          };
        } else {
          return {
            ...base,
            personal_id: {
              front_file_id: frontFileId,
              ...(backFileId && { back_file_id: backFileId }),
            },
          };
        }
      })();
      //Upload Payload to Airwallex to update account with KYC details and submit for verification
      const updatePayload = {
        account_details: {
          legal_entity_type: "INDIVIDUAL",
          individual_details: {
            first_name: validationResult.firstName,
            last_name: validationResult.lastName,
            date_of_birth: new Date(validationResult.dateOfBirth)
              .toISOString()
              .split("T")[0],
            nationality: validationResult.nationality,
            live_selfie_file_id: selfieFileId,
            residential_address: {
              address_line1: validationResult.address,
              country_code: validationResult.country,
              postcode: validationResult.postCode,
              state: validationResult.state,
              suburb: validationResult.suburb,
            },
            identifications: { primary: {...identificationPayload, issuing_country_code: validationResult.identificationDocumentIssueCountry } },
            attachments: {
              individual_documents: [
                { file_id: poaFileId, tag: "PROOF_OF_ADDRESS" },
              ],
            },
            account_usage: {
              card_usage: validationResult.cardUsage,
              collection_country_codes: validationResult.collectionCountryCode,
              collection_from: validationResult.collectionFrom,
              payout_country_codes: validationResult.payoutCountryCodes,
              payout_to: validationResult.payoutTo,
              product_reference: validationResult.productReference,
              ...(validationResult.monthlyTransactionVolumeAmount && {
                expected_monthly_transaction_volume: {
                  currency: validationResult.monthlyTransactionVolumeCurrency,
                  amount: String(
                    validationResult.monthlyTransactionVolumeAmount,
                  ),
                },
              }),
            },
            has_member_holding_public_office:
              validationResult.hasMemberHoldingPublicOffice === "YES",
            has_prior_financial_institution_refusal:
              validationResult.hasPriorFinancialInstitutionRefusal === "YES",
          },
        },
      };

      console.log(
        "Accounts update payload:",
        JSON.stringify(updatePayload, null, 2),
      );

      let updateResponse;
      try {
        updateResponse = await axios.post(
          `${process.env.AIRWALLEX_API_URL}/api/v1/accounts/${airwallexId}/update`,
          updatePayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
      } catch (error) {
        const { errMsg, airwallexError } = extractAirwallexError(error);
        return callback(new Error(errMsg), { airwallexError });
      }

      if (updateResponse?.data?.id) {
        //Save Data in User KYC table
        await UserKyc.upsert({
          userId,
          status: getUserKycStatus(updateResponse?.data?.status),
          applicantId: updateResponse.data.id,
        });

        await this.saveAirwallexKycAccountDetails({
          accountData: { ...updateResponse.data, userInputData: { ...validationResult, frontImagePath, backImagePath, poaImagePath, selfieImagePath } },
          userId,
        });

        try {
          await axios.post(
            `${process.env.AIRWALLEX_API_URL}/api/v1/accounts/${airwallexId}/submit`,
            {},
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
        } catch (error) {
          const { errMsg, airwallexError } = extractAirwallexError(error);
          return callback(new Error(errMsg), { airwallexError });
        }
        
         
        return callback(null, { data: updateResponse.data });
      } else {
        return callback(new Error("FAILED_TO_UPDATE_CUSTOMER_ACCOUNT"));
      }
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error submitting KYC documents:", error);
      return callback(new Error("INTERNAL_SERVER_ERROR"));
    }
  }
  static async testModeUpdateAccountStatus(
    { accountId, status, i18n },
    callback,
  ) {
    try {
      if (!accountId) {
        return callback(new Error("AIRWALLEX_ACCOUNT_NOT_FOUND"));
      }
      if (!status) {
        return callback(new Error("ACCOUNT_STATUS_REQUIRED"));
      }

      const accessToken = await this.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      const response = await axios.post(
        `${process.env.AIRWALLEX_API_URL}/api/v1/simulation/accounts/${accountId}/update_status`,
        { next_status: status, force: true },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return callback(null, { data: response.data });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error(
        "Error updating Airwallex account status:",
        error?.response?.data || error.message,
      );
      const errMsg = error?.response?.data?.message || "INTERNAL_SERVER_ERROR";
      return callback(new Error(errMsg));
    }
  }

  static async airwallexKycWebhook({ payload }, callback) {
    console.log("Received Airwallex KYC webhook with payload:", payload);

    try {
      const accountId = payload?.account_id;
      const eventName = payload?.name;
      let newStatus = null;
      if (eventName === "account.submitted") {
        newStatus = "SUBMITTED";
      } else if (eventName === "account.action_required") {
        newStatus = "ACTION_REQUIRED";
      } else if (eventName === "account.active") {
        newStatus = "ACTIVE";
      } else if (eventName === "account.suspended") {
        newStatus = "SUSPENDED";
      }
      if (!newStatus) {
        console.warn("airwallexKycWebhook: unhandled event name:", eventName);
        return callback(null, { data: payload });
      }

      if (!accountId) {
        return callback(null, { data: payload });
      }

      const kycAccount = await AirwallexKycAccount.findOne({
        where: { airwallexAccountId: accountId },
      });

      if (!kycAccount) {
        console.warn(
          "airwallexKycWebhook: no AirwallexKycAccount found for accountId:",
          accountId,
        );
        return callback(null, { data: payload });
      }

      const userId = kycAccount.userId;

      // Update AirwallexKycAccount status only
      await AirwallexKycAccount.update(
        { status: newStatus },
        { where: { airwallexAccountId: accountId } },
      );

      // Update UserKyc status
      await UserKyc.update(
        { status: getUserKycStatus(newStatus) },
        { where: { userId, applicantId: accountId } },
      );

      console.log(
        `airwallexKycWebhook: updated userId=${userId} to status=${newStatus}`,
      );
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error processing Airwallex KYC webhook:", error);
    }

    return callback(null, { data: payload });
  }

  static async savedVerifiedKycDocuments({ userId, i18n }, callback) {
  try {
    const kycAccount = await AirwallexKycAccount.findOne({ where: { userId } });
    if (!kycAccount) {
      return callback(new Error("AIRWALLEX_KYC_ACCOUNT_NOT_FOUND"));
    }

    const selfieFileId = kycAccount.liveSelfieFileId;
    const idFrontFileId =
      kycAccount.identifications?.primary?.drivers_license?.front_file_id ||
      kycAccount.identifications?.primary?.passport?.front_file_id ||
      kycAccount.identifications?.primary?.personal_id?.front_file_id;
    const idBackFileId =
      kycAccount.identifications?.primary?.drivers_license?.back_file_id ||
      kycAccount.identifications?.primary?.personal_id?.back_file_id;
    

    const fileIdMap = { selfieFileId, idFrontFileId, idBackFileId  };
    const fileIds = Object.values(fileIdMap).filter(Boolean);

    console.log("Fetching download links for file IDs:", fileIds);

    if (fileIds.length === 0) {
      return callback(new Error("NO_KYC_FILES_FOUND"));
    }

    const accessToken = await this.getAirWalletxToken();
    if (!accessToken) {
      return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
    }

    const downloadLinksResponse = await axios.post(
      `${process.env.AIRWALLEX_API_URL}/api/v1/files/download_links`,
      { file_ids: fileIds },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
           
        },
      },
    );

    // ✅ Correct response parsing
    const files = downloadLinksResponse.data?.files || [];
    const linkByFileId = Object.fromEntries(
      files.map((file) => [file.file_id, { url: file.url, expiredTime: file.download_link_valid_until }]),
    );

    const downloadLinks = {
      selfie:         selfieFileId  ? linkByFileId[selfieFileId]  || null : null,
      idFront:        idFrontFileId ? linkByFileId[idFrontFileId] || null : null,
      idBack:         idBackFileId  ? linkByFileId[idBackFileId]  || null : null,
      proofOfAddress: poaFileId     ? linkByFileId[poaFileId]     || null : null,
    };

    return callback(null, { data: { downloadLinks, fileIdMap } });

  } catch (error) {
    process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
    console.error("Error saving verified KYC documents:", error?.response?.data || error.message);
    return callback(new Error("FAILED_TO_SAVE_VERIFIED_KYC_DOCUMENTS"));
  }
}

  static async airWallexAuthorizeAccount({ payload, userId, i18n }, callback) {
    try {
      console.log(
        "Authorizing Airwallex customer account with payload:",
        payload,
      );
      const { accountId } = payload;
      const { codeChallenge: codechallengeStr, codeVerifier } =
        await codeChallenge();
      console.log("Generated code challenge:", codechallengeStr);
      const accressToken = await this.getAirWalletxToken();
      if (!accressToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      const response = await axios.post(
        `${process.env.AIRWALLEX_API_URL}/api/v1/authentication/authorize`,
        {
          scope: ["w:awx_action:onboarding"],
          code_challenge: codechallengeStr,
          identity: userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accressToken}`,
            "x-on-behalf-of": accountId,
          },
        },
      );
      if (response?.data?.authorization_code) {
        //store code challenge and authorization code in db for future use
        return callback(null, {
          data: {
            authCode: response.data.authorization_code,
            codeVerifier: codeVerifier,
            accountId: accountId,
          },
        });
      } else {
        return callback(new Error("AIRWALLEX_ACCOUNT_AUTHORIZATION_FAILED"));
      }
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error authorizing Airwallex customer account:", error);
      return callback(new Error("INTERNAL_SERVER_ERROR"));
    }
  }

  static async getAirwallexCustomerId(userId) {
    console.log("Fetching Airwallex Customer ID for userId:", userId);

    const checkExistingCustomer = await AirwallexCustomers.findOne({
      where: {
        userId,
      },
    });
    if (checkExistingCustomer) {
      return {
        airwallexCustomerId: checkExistingCustomer.airwallexCustomerId,
        existing: true,
      };
    }

    const getUserDetails = await UserService.getUserById(userId);
    if (!getUserDetails) {
      throw new Error("USER_NOT_FOUND");
    }
    const name = getUserDetails.name || "";
    const email = getUserDetails.email || "";
    const phoneNumber = getUserDetails.phoneNumber || "";
    const REQUEST_ID = uuidv4();
    const MECHANT_CUSTOMER_ID = `AWCUST-${userId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const accressToken = await this.getAirWalletxToken();
    if (!accressToken) {
      throw new Error("AIRWALLEX_TOKEN_NOT_GENERATED");
    }

    if (!name && !email && !phoneNumber) {
      throw new Error("INSUFFICIENT_USER_DATA");
    }
    const firstName = name.split(" ")[0] || "";
    const lastName = name.split(" ").slice(1).join(" ") || "";

    const apiUrl = process.env.AIRWALLEX_API_URL;

    const requestBody = {
      request_id: REQUEST_ID,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: phoneNumber,
      merchant_customer_id: MECHANT_CUSTOMER_ID,
    };
    try {
      const response = await axios.request({
        url: `${apiUrl}/api/v1/pa/customers/create`,
        method: "post",
        headers: {
          Authorization: `Bearer ${accressToken}`,
          "Content-Type": "application/json",
        },
        data: requestBody,
      });

      if (response?.data?.id) {
        //store in db
        await AirwallexCustomers.create({
          requestId: REQUEST_ID,
          userId,
          firstName,
          lastName,
          email,
          phoneNumber,
          airwallexCustomerId: response.data.id,
        });

        return { airwallexCustomerId: response.data.id };
      } else {
        console.error("Airwallex customer creation failed:", response?.data);
        throw new Error("AIRWALLEX_CUSTOMER_CREATION_FAILED");
      }
    } catch (error) {
      console.error(
        "Error creating Airwallex customer:",
        error?.response?.data || error.message,
      );
      throw new Error("AIRWALLEX_CUSTOMER_CREATION_FAILED");
    }
  }
  static async createMerchantOrderIdRequestId(args, callback) {
    try {
      const { payload, userId, i18n } = args;
      const getAirwallexCustomerId = await this.getAirwallexCustomerId(userId);
      const airwallexCustomerId = getAirwallexCustomerId?.airwallexCustomerId;
      if (!airwallexCustomerId) {
        return callback(new Error("AIRWALLEX_CUSTOMER_ID_NOT_FOUND"));
      }

      const amount = parseFloat(payload?.amount);
      const latitude = payload?.latitude || null;
      const longitude = payload?.longitude || null;
      const uuid = uuidv4();
      if (!amount || isNaN(amount) || amount <= 0) {
        return callback(new Error("INVALID_AMOUNT"));
      }
      const merchantOrderId = `MOID-${userId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const createTransaction = await WalletAirwallexPayments.create({
        uuid,
        merchantOrderId,
        userId,
        currency: "ILS",
        latitude,
        longitude,
        amount,
      });
      const accessToken = await this.getAirWalletxToken();
      if (!accessToken) {
        return callback(new Error("AIRWALLEX_TOKEN_NOT_GENERATED"));
      }

      return callback(null, {
        data: {
          merchantOrderId,
          uuid,
          airwallexCustomerId,
          accessToken,
          amount: amount.toFixed(2),
          transaction: createTransaction,
        },
      });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return callback(new Error("INTERNAL_SERVER_ERROR"));
    }
  }
  //handle payment webhook
  static async handlePaymentWebhook(args) {
    try {
      const payload = args?.payload || {};
      console.log("Processing webhook payload:", payload);
      // Add your webhook handling logic here
      // For example, update payment status in the database based on the payload
      if (payload?.data?.object?.merchant_order_id) {
        const getOrderData = await WalletAirwallexPayments.findOne({
          where: {
            merchantOrderId: payload.data.object.merchant_order_id,
          },
        });
        console.log("Order Data Found:", getOrderData);

        if (getOrderData && getOrderData.status !== "SUCCEEDED") {
          getOrderData.amount =
            payload?.data?.object?.amount || getOrderData.amount;
          getOrderData.currency =
            payload?.data?.object?.currency || getOrderData.currency;
          getOrderData.capturedAmount =
            payload?.data?.object?.captured_amount ||
            getOrderData.capturedAmount;
          getOrderData.descriptor =
            payload?.data?.object?.descriptor || getOrderData.descriptor;
          getOrderData.paymentId =
            payload?.data?.object?.id || getOrderData.paymentId;
          getOrderData.originalAmount =
            payload?.data?.object?.original_amount ||
            getOrderData.originalAmount;
          getOrderData.originalCurrency =
            payload?.data?.object?.original_currency ||
            getOrderData.originalCurrency;
          getOrderData.webhookData = payload || getOrderData.webhookData;
          getOrderData.status =
            payload.data.object.status || getOrderData.status;
          await getOrderData.save();
          console.log("Order status updated to:", getOrderData.status);
          if (getOrderData.status === "SUCCEEDED") {
            //update user wallet balance
            const result =
              await WalletService.updateWalletAfterSuccessAirwallexPayment(
                getOrderData,
              );
            console.log("Wallet updated after successful payment:", result);
          }
        } else {
          console.log(
            "No matching order found for merchant_order_id:",
            payload.data.object.merchant_order_id,
          );
        }
      }
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error handling payment webhook:", error);
    }
  }
}
