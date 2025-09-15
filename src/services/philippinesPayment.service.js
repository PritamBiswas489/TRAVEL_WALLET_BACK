import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
const { PisoPayTransactionInfos } = db;

export default class PhilippinesPaymentService {
  //track transaction info  
  static async trackTransaction(paymentData) {
    try {
      const createdRecord = await PisoPayTransactionInfos.create({
        transaction_info_code: paymentData.transaction_info_code,
        transaction_type: paymentData.transaction_type,
        transaction_channel: paymentData.transaction_channel,
        remittance_method_code: paymentData.remittance_method_code,
        sender_customer_code: paymentData.sender_customer_code,
        sender_customer_details: paymentData.sender_customer_details,
        beneficiary_customer_code: paymentData.beneficiary_customer_code,
        beneficiary_customer_details: paymentData.beneficiary_customer_details,
        relationship: paymentData.relationship,
        purpose: paymentData.purpose,
        client_fee_rebate_json: paymentData.client_fee_rebate_json,
        amount: paymentData.amount,
        client_fee: paymentData.client_fee,
        client_rebate: paymentData.client_rebate,
        amount_deduct: paymentData.amount_deduct,
        callback_url: paymentData.callback_url,
        qr_code: paymentData.qr_code,
        date_time: paymentData.date_time,
      });
      return createdRecord;
    } catch (e) {
      if (process.env.SENTRY_ENABLED === "true") {
        Sentry.captureException(e);
      }
    }
  }
  //update transaction status
static async updateTransactionStatus(payload) {
    try {
        const { transaction_info_code, status } = payload;
        let statusValue = 'Pending';
        if(parseInt(status) === 0){
            statusValue = 'Success';

        }else if(parseInt(status) === 2){
            statusValue = 'Cancelled';
        }else if(parseInt(status) === 3){
            statusValue = 'Failed';
        }
         
        const record = await PisoPayTransactionInfos.findOne({
            where: { transaction_info_code: transaction_info_code },
        });
        if (record) {
            record.transaction_status = statusValue;
            record.callBack_data = payload;
            await record.save();
            console.log("Transaction status updated for:", transaction_info_code);
        } else {
            throw new Error("RECORD_NOT_FOUND");
        }
    } catch (e) {
        if (process.env.SENTRY_ENABLED === "true") {
            Sentry.captureException(e);
        }
    }
}
}
