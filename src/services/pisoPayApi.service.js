import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { getCalculateP2MOrP2PFromQRCode } from "../libraries/utility.js";

export default class PisoPayApiService {
  static async login() {
    var data = JSON.stringify({
      username: process.env.PISOPAY_USERNAME,
      password: process.env.PISOPAY_PASSWORD,
    });
    var config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.PISOPAY_ENDPOINT}/api/v1/login/clientAPICredentials`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "CACS-KEY": process.env.PISOPAY_CACS_KEY,
      },
      data: data,
    };
    console.log("PisoPay login config:", config);
    try {
        console.log("Attempting to log in to PisoPay API...");  
    const response = await axios(config);
    const responseData = response.data;
    return responseData?.token ? { token: responseData.token } : null;
    } catch (e) {
        console.log("PisoPay login error:", e.message);
      if (process.env.SENTRY_ENABLED === "true") {
        Sentry.captureException(e);
      }
      throw e;
    }
  }
  // Validate a transaction
  static async validateTransaction({ qrCode, i18n, purpose = "VALIDATION" }, callback) {
       try{
        if(!qrCode){
          throw new Error("MISSING_QR_CODE");
        }
        const qrIType =   getCalculateP2MOrP2PFromQRCode(qrCode);
        if(!qrIType){
          throw new Error("UNSUPPORTED_QR_CODE_TYPE");
        }
        //Remittance method code based on QR type
        const remittanceMethodCode = qrIType === "P2M" ? "RMCQRPHREADP2M" : "RMCQRPHREADP2P";

        const tokenResponse = await this.login();
        if(!tokenResponse?.token){
          throw new Error("TOKEN_RETRIEVAL_FAILED");
        }

        // console.log("PisoPay token acquired, validating transaction...",tokenResponse?.token);

        const  data = JSON.stringify({
           "remittance_method_code": remittanceMethodCode,
            "qr_code": qrCode,
            "purpose": purpose,
            "amount": 1.00,
        });
         
        var config = {
          method: "post",
          maxBodyLength: Infinity,
          url: `${process.env.PISOPAY_ENDPOINT}/api/v1/remittance/remittanceValidateTransaction`,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `${tokenResponse?.token}`,
          },
          data: data,
        };
        try {
          const response = await axios(config);
          const responseData = response.data;
          console.log("PisoPay transaction validation response:", responseData);
          if(responseData?.status === 200){
            return callback(null, {
              data: {
                qrIType,
                amount: qrIType === "P2M" ?  (responseData?.data?.amount) : null,
                merchantName: responseData?.data?.merchant_name, 
                merchantCity: responseData?.data?.merchant_city,
              },
            });
          }else{
            throw new Error("PAYMENT_VALIDATION_FAILED");
          }
        } catch (error) {
          console.log("PisoPay transaction error:", error);
          console.log("PisoPay transaction exception:", (error?.response?.data?.message));
          console.log("PisoPay transaction validation error:", (error?.response?.data?.errors));
          if (process.env.SENTRY_ENABLED === "true") {
            Sentry.captureException(error);
          }
          throw new Error(error?.response?.data?.message || "PAYMENT_VALIDATION_FAILED");
        }
       }catch(err){
          callback(err, null);
       }
  }
  // Initiate a transaction
  static async initiateTransaction({ qrCode, amount, i18n, purpose = "INITIATION" }, callback) {
    console.log("Initiating PisoPay transaction with QR code:", qrCode, "and amount:", amount);
    try {
      if (!qrCode) {
        throw new Error("MISSING_QR_CODE");
      }
      const qrIType = getCalculateP2MOrP2PFromQRCode(qrCode);
      const remittanceMethodCode = qrIType === "P2M" ? "RMCQRPHREADP2M" : "RMCQRPHREADP2P";
      const tokenResponse = await this.login();
      if (!tokenResponse?.token) {
        throw new Error("TOKEN_RETRIEVAL_FAILED");
      }

      let paymentData = {
        remittance_method_code: remittanceMethodCode,
        qr_code: qrCode,
        purpose: purpose,
        sender_customer_details: {
          first_name: process.env.PISOPAY_DEFAULT_FIRSTNAME || "Avi",
          middle_name: process.env.PISOPAY_DEFAULT_MIDDLE_NAME || "Dela",
          last_name: process.env.PISOPAY_DEFAULT_LASTNAME || "Cruz",
        },
      };
      if (qrIType === "P2P") {
        paymentData.amount = parseFloat(amount);
      }
      paymentData.callback_url = process.env.PISOPAY_CALLBACK_URL;
      var config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${process.env.PISOPAY_ENDPOINT}/api/v1/remittance/remittanceInitiateTransaction`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `${tokenResponse?.token}`,
        },
        data: JSON.stringify(paymentData),
      };

      try {
        const response = await axios(config);
        const responseData = response.data;
        console.log("PisoPay transaction initiation response:", responseData);
        if (responseData?.status === 200) {
          callback(null, { data: responseData?.data });
        } else {
          throw new Error("PAYMENT_INITIATION_FAILED");
        }
      } catch (error) {
        console.log("PisoPay transaction error:", error);
        console.log("PisoPay transaction exception:", (error?.response?.data?.message));
        console.log("PisoPay transaction initiation error:", (error?.response?.data?.errors));
        if (process.env.SENTRY_ENABLED === "true") {
          Sentry.captureException(error);
        }
        throw new Error(error?.response?.data?.message || "PAYMENT_INITIATION_FAILED");
      }
    } catch (err) {
      callback(err, null);
    }
  }

  
}

 
