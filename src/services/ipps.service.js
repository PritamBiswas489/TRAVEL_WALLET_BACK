import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
const { Op, User } = db;

// This service is for IPPS related operations, such as handling payments through the IPPS platform.
export default class IPPSService {
  static parseTLV(data) {
    let i = 0;
    const result = {};

    while (i < data.length) {
      const tag = data.substring(i, i + 2);
      const length = parseInt(data.substring(i + 2, i + 4));
      const value = data.substring(i + 4, i + 4 + length);

      result[tag] = value;
      i += 4 + length;
    }

    return result;
  }

  static detectQRType(parsed) {
    if (parsed["30"]) {
      const inner = this.parseTLV(parsed["30"]);
      if (inner["02"] || inner["03"]) {
        return "TAG30";
      }
    }

    if (parsed["29"]) {
      return "TAG29";
    }

    throw new Error("Invalid QR");
  }
  static extractTag29(parsed) {
    const inner = this.parseTLV(parsed["29"]);
    console.log("Inner TLV for Tag 29:", inner);

    return {
      walletId: "400110891234567", // from DB
      receiverType: "MSISDN",
      receiverValue: inner["01"],
      amount: parsed["54"] ? parseFloat(parsed["54"]) : 100,
    };
  }
}
