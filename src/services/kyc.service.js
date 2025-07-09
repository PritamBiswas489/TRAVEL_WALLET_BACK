import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import crypto from "crypto";
import UserService from "./user.service.js";
import { v4 as uuidv4 } from 'uuid';

export default class KycService {
  static async createApplicant(args) {
    try {
     

      const APP_TOKEN = process.env.SUMSUB_API_KEY; // Your token
      const SECRET_KEY = process.env.SUMSUB_API_SECRET; // ⚠️ Replace with your secret from Sumsub dashboard
      const URL_PATH = "/resources/applicants?levelName=id-and-liveness"; // Exact path, no domain
      const FULL_URL = process.env.SUMSUB_API_URL + URL_PATH;

      const user = await UserService.getUserById(args.userId);
     
      let firstName = "user " + user?.id;
      let lastName = user?.phoneNumber || "";

      if (user && user.name) {
        const nameParts = user.name.split(" ");
        if (nameParts[0]) firstName = nameParts[0];
        if (nameParts[1]) lastName = nameParts[1];
      }

      const existingKycData = await UserService.getUserKycData(args.userId);
      if (
        existingKycData &&
        typeof existingKycData.applicantId === "string" &&
        existingKycData.applicantId.trim() !== ""
      ) {
        return existingKycData;
      }
      // If KYC data exists, delete it before creating a new applicant
      await UserService.deleteUserKycData(args.userId);

      const newSiteApplicantId = uuidv4();

      const createSiteApplicant = await UserService.createSiteApplicant({ id: newSiteApplicantId, userId: args.userId });
      if(!createSiteApplicant?.id){  
          throw new Error("Failed to create site applicant");
      }
       
      const body = {
        externalUserId: createSiteApplicant.uuid,
        fixedInfo: {
          firstName: firstName,
          lastName: lastName,
          nationality: 'ISR',
          country: 'ISR',
          countryOfBirth: 'ISR',
          addresses:[
            {
              country: 'ISR',
            }
          ],
          taxResidenceCountry: 'ISR',
          residenceCountry: 'ISR',
        },
        type: "individual",
      };

      const bodyJson = JSON.stringify(body);
      const ts = Math.floor(Date.now() / 1000);

      const stringToSign = `${ts}POST${URL_PATH}${bodyJson}`;

      const signature = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(stringToSign)
        .digest("hex");

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": APP_TOKEN,
        "X-App-Access-Sig": signature,
        "X-App-Access-Ts": ts,
      };
      try {
        const response = await axios.post(FULL_URL, bodyJson, { headers });
        if(response.data?.id) {
          await UserService.updateKycData({applicantid : response.data?.id, id: createSiteApplicant.id});
          return await UserService.getUserKycData(args.userId);
        }
        // If the response does not contain an ID, delete the KYC data
        await UserService.deleteUserKycData(args.userId);
        return response.data;
      } catch (err) {
        if (err.response && err.response.status === 409) {
          // Applicant already exists, return a specific message or handle accordingly
          return { error: "Applicant already exists", status: 409 };
        } else {
          throw err;
        }
      }

    } catch (error) {
      console.error("Error occurred while creating applicant:", error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { error: error.message };
    }
  }
  static async getSumSubAccessToken(userId) {
    try {
      const APP_TOKEN = process.env.SUMSUB_API_KEY; // Your token
      const SECRET_KEY = process.env.SUMSUB_API_SECRET; // ⚠️ Replace with your secret from Sumsub dashboard
      const userkyc = await UserService.getUserKycData(userId);
      if(!userkyc || !userkyc.applicantId) {
        throw new Error("User KYC data not found");
      }
      // console.log(userkyc.uuid);

      const URL_PATH = "/resources/accessTokens/sdk"; // Exact path, no domain
      const FULL_URL = process.env.SUMSUB_API_URL + URL_PATH;
      const body = {
        userId: userkyc.uuid,
        levelName: "id-and-liveness",
        ttlInSecs: 600,
      };
      const bodyJson = JSON.stringify(body);
      const ts = Math.floor(Date.now() / 1000);

      const stringToSign = `${ts}POST${URL_PATH}${bodyJson}`;

      const signature = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(stringToSign)
        .digest("hex");

      const headers = {
        "Content-Type": "application/json",
        "X-App-Token": APP_TOKEN,
        "X-App-Access-Sig": signature,
        "X-App-Access-Ts": ts,
      };
      const response = await axios.post(FULL_URL, bodyJson, { headers });
      if (response.data?.token) {
        return { token: response.data.token };
      } else {
        throw new Error("Failed to retrieve access token from SumSub");
      }
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { error: error.message };
    }
  }

}
