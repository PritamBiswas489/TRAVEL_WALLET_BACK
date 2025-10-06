import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { walletCurrencies } from "../config/walletCurrencies.js";
import { paymentCurrencies } from "../config/paymentCurrencies.js";
import NinePayApiService from "./ninePayApi.service.js";
import UserService from "./user.service.js";
import CurrencyService from "./currency.service.js";


export default class VietnamPaymentService {
 

  // static method
  static async decodeQrCode({ qrCode }, callback) {
    try {
      const decodedData = await NinePayApiService.decodeQrCode(qrCode);
      console.log("Decoded QR Code Data:", decodedData);
      if(decodedData?.ERROR){
        throw new Error("QR_CODE_DECODE_FAILED");
      }
      return callback(null, {data: { qrCode, decoded: true, data: decodedData }});
    } catch (e) {
      console.error("Error in decodeQrCode:", e.message);
      return callback(e, null);
    }
  }
}

    
 
 
