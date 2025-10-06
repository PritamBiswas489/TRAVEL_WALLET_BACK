import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { yyyymmddhhmmss } from "../libraries/utility.js";
import crypto from "crypto";
import FormData from "form-data";

export default class NinePayApiService {
  // static property
  static pubKey = process.env.NINEPAY_PUBLIC_KEY;
  static privateKey = process.env.NINEPAY_PARTNER_PRIVATE_KEY;
  static endpoint = process.env.NINEPAY_API_URL;
  static partnerId = process.env.NINEPAY_PARTNER_ID;
  static async decodeQrCode(qrCode) {
    try {
      const id = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 chars
      const requestId = `${this.partnerId}9P${yyyymmddhhmmss()}${id}`;
      console.log("Generated Request ID:", requestId);

      const dataToSign = `${requestId}|${this.partnerId}`;
      const signature = crypto
        .sign("RSA-SHA256", Buffer.from(dataToSign), this.privateKey)
        .toString("base64");
      var data = new FormData();
      data.append("request_id", requestId);
      data.append("partner_id", this.partnerId);
      data.append("str_qr", qrCode);
      data.append("signature", signature);
      var config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${this.endpoint}/service/decode-viet-qr`,
        headers: {
          hl: "en",
          ...data.getHeaders(),
        },
        data: data,
      };
      const response = await axios(config);
      const responseData = response.data;
      
      if (responseData?.data?.service) {
      
        return responseData.data;
      }else{
        return {ERROR: 1};
      }
    } catch (error) {
      console.error("Error decoding QR Code:", error);
      return { ERROR: 1 };
    }
  }
}
