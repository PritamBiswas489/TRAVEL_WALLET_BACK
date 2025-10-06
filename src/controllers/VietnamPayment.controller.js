import fs from "fs";
import VietnamPaymentService from "../services/vietnamPaymentService.js";
export default class VietnamPaymentController {
  static async ninePayIpn(request) {
    const {
      headers: { i18n, deviceLocation },
      user,
      payload,
    } = request;
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(payload)}\n`;
    fs.appendFile("callback-data.txt", logEntry, (err) => {
      if (err) {
        console.error("Error saving data:", err);
        return { status: 500, message: "Failed to save data" };
      }
      console.log("Data saved:", logEntry);
      return { status: 200, message: "Data received and saved" };
    });

    return {
      status: 200,
      data: { received: true },
      message: "Successfully processed NinePay IPN",
      error: null,
    };
  }
 //decode Qr code
  static async decodeQrCode(request) {
    const {
         headers: { i18n },
         user,
         payload,
       } = request;
   
       const qrCode = payload?.qrCode || null;
      
       return new Promise((resolve) => {
         VietnamPaymentService.decodeQrCode(
           {  qrCode },
           (err, response) => {
             if (err) {
               return resolve({
                 status: 400,
                 data: null,
                 error: {
                   message: i18n.__(err.message || "PAYMENT_VALIDATION_FAILED"),
                   reason: err.message,
                 },
               });
             }
             return resolve({
               status: 200,
               data: response.data,
               message: i18n.__("PAYMENT_VALIDATION_SUCCESSFUL"),
               error: null,
             });
           }
         );
       });
  }
}
