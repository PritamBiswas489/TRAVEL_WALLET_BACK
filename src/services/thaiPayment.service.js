import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import { parseThaiQR,mapQRToQueryParams } from "../libraries/ipps/qrParser.js";
const { Op, User } = db;

export default class ThaiPaymentService {
    static async validateQrCode({ qrCode, userId, headers }, callback) {
        console.log("Starting QR code validation in service layer for user ID:", userId);
        console.log("QR code received for validation:", qrCode);
        try{
            const parsed = parseThaiQR(qrCode);
            const walletId = "400110891234567";
            const overrideAmount = 100; // Optional: only needed if parsed.amount is null
            const queryParams = mapQRToQueryParams(parsed, walletId, overrideAmount ?? null);
            console.log("===================================================");
            console.log("Parsed QR in service layer:", parsed);
            console.log("=================================================");
            console.log("Mapped Query Params in service layer:", queryParams);
             
            if(!queryParams?.receiverType || !queryParams?.receiverValue){
                return callback(new Error("MISSING_RECEIVER_INFO"));
            }
            if (queryParams.receiverType === "BILLERID") {
                if (!queryParams.billReference1) return callback(new Error("MISSING_BILLING_RECEIVER_INFO"));
            }
            return callback(null, { data: queryParams });
        }catch(e){
            console.error("Error during QR code validation:", e);
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
            return callback(new Error("QR_CODE_VALIDATION_FAILED"));
        }
    }


}