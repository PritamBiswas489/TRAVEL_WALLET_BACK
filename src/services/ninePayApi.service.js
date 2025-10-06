import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import axios from "axios";

export default class NinePayApiService {
  // static property
  static pubKey = process.env.NINEPAY_PUBLIC_KEY;
  static privateKey = process.env.NINEPAY_PARTNER_PRIVATE_KEY;
  static endpoint = process.env.NINEPAY_API_URL;
  static partnerId = process.env.NINEPAY_PARTNER_ID;
  static async decodeQrCode(qrCode) {
     console.log("Decoding QR Code with NinePay API:", qrCode);

    
  }
}
