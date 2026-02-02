import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import WalletService from "./wallet.service.js";
import UserService from "./user.service.js";
 

const { Op, User, WalletAirwallexPayments, AirwallexCustomers } = db;

export default class AirwallexPaymentService {
  static async  getAirWalletxToken(){

    const apiKey = process.env.AIRWALLEX_API_KEY;
    const clientId = process.env.AIRWALLEX_CLIENT_ID;
    const apiUrl = process.env.AIRWALLEX_API_URL;

     const res = await axios.post(
      `${apiUrl}/api/v1/authentication/login`,
      {},
      {
        headers: {
          "x-client-id": clientId,
          "x-api-key": apiKey,
        },
      }
    );

    return res?.data?.token || null;

  }
  static async getAirwallexCustomerId(userId) {
            console.log("Fetching Airwallex Customer ID for userId:", userId);

            const checkExistingCustomer = await AirwallexCustomers.findOne({
              where: {
                userId,
              },
            });
            if (checkExistingCustomer) {
              return {airwallexCustomerId: checkExistingCustomer.airwallexCustomerId,existing:true};
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

            if(!name && !email && !phoneNumber){
              throw new Error("INSUFFICIENT_USER_DATA");
            }
            const firstName = name.split(" ")[0] || "";
            const lastName = name.split(" ").slice(1).join(" ") || "";

            const apiUrl = process.env.AIRWALLEX_API_URL;

            const requestBody = {
                "request_id": REQUEST_ID,
                "first_name": firstName,
                "last_name": lastName,
                "email": email,
                "phone_number": phoneNumber,
                "merchant_customer_id": MECHANT_CUSTOMER_ID
          };
          try{
              const response = await axios
              .request({
                url: 'https://api-demo.airwallex.com/api/v1/pa/customers/create',
                method: 'post',
                headers: {
                  'Authorization': `Bearer ${accressToken}`,
                  'Content-Type': 'application/json',
                },
                data: requestBody,
              });

              if(response?.data?.id){
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

                  return {airwallexCustomerId: response.data.id};
              }else{
                  console.error("Airwallex customer creation failed:", response?.data);
                  throw new Error("AIRWALLEX_CUSTOMER_CREATION_FAILED");
              }

          }catch(error){
              console.error("Error creating Airwallex customer:", error?.response?.data || error.message);
              throw new Error("AIRWALLEX_CUSTOMER_CREATION_FAILED");
          }
        
  }
  static async createMerchantOrderIdRequestId(args, callback) {
    
    try {
      const { payload, userId, i18n } = args;
      const getAirwallexCustomerId = await this.getAirwallexCustomerId(userId);
      const airwallexCustomerId = getAirwallexCustomerId?.airwallexCustomerId;
      if(!airwallexCustomerId){
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
        if(!accessToken){
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
    try{
        const payload = args?.payload || {};
        console.log("Processing webhook payload:", payload);
        // Add your webhook handling logic here
        // For example, update payment status in the database based on the payload
        if(payload?.data?.object?.merchant_order_id){
            const getOrderData = await WalletAirwallexPayments.findOne({
                where: {
                    merchantOrderId: payload.data.object.merchant_order_id,
                    
                },
            });
            console.log("Order Data Found:", getOrderData);
             
            if(getOrderData && getOrderData.status !== "SUCCEEDED"){
                getOrderData.amount = payload?.data?.object?.amount || getOrderData.amount;
                getOrderData.currency = payload?.data?.object?.currency || getOrderData.currency;
                getOrderData.capturedAmount = payload?.data?.object?.captured_amount || getOrderData.capturedAmount;
                getOrderData.descriptor = payload?.data?.object?.descriptor || getOrderData.descriptor;
                getOrderData.paymentId = payload?.data?.object?.id || getOrderData.paymentId;
                getOrderData.originalAmount = payload?.data?.object?.original_amount || getOrderData.originalAmount;
                getOrderData.originalCurrency = payload?.data?.object?.original_currency || getOrderData.originalCurrency;
                getOrderData.webhookData = payload || getOrderData.webhookData;
                getOrderData.status = payload.data.object.status || getOrderData.status;
                await getOrderData.save();
                console.log("Order status updated to:", getOrderData.status);
                if(getOrderData.status === "SUCCEEDED"){
                    //update user wallet balance
                  const result = await WalletService.updateWalletAfterSuccessAirwallexPayment(getOrderData);
                  console.log("Wallet updated after successful payment:", result);
                }
            }else{
                console.log("No matching order found for merchant_order_id:", payload.data.object.merchant_order_id);
            }

        }

    }catch(error){
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      console.error("Error handling payment webhook:", error);
    }

  }
}
