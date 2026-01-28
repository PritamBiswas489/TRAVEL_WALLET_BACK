import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import WalletService from "./wallet.service.js";

const { Op, User, WalletAirwallexPayments } = db;

export default class AirwallexPaymentService {
  static async createMerchantOrderIdRequestId(args, callback) {
    try {
      const { payload, userId, i18n } = args;
       
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
        return callback(null, {
        data: {
          merchantOrderId,
          uuid,
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
