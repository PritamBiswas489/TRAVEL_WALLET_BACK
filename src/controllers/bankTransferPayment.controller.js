import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import "../config/environment.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import axios from "axios";

export default class BankTransferPaymentController {
  static async initiateBankTransferPayment(request) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const privateKeyPath = path.join(
      __dirname,
      "../../public/freezBackKeys/privateprod.key",
    );
    //check file exists
    if (!fs.existsSync(privateKeyPath)) {
      return {
        status: 500,
        message: "Private key file does not exist",
        error: { message: "Private key file does not exist" },
      };
    }

    const privateKey = fs.readFileSync(privateKeyPath, "utf8");
    console.log("Private key loaded successfully.");
    console.log("Private Key Content:", privateKey);

    const payload = {
      sub: "6666",
      iss: "tpp/HEoRGloC4D",
      srv: "fast/user",
      flow: {
        id: "default",
        payment: {
          remittanceInformationUnstructured: "R89001",
          creditor: {
            name: "העברה בגין הזמנה R12345",
            account: "IL820126560000000688807",
            accountType: "iban",
          },
          transfer: {
            amount: {
              value: "1.00",
              editable: true,
            },
            currency: {
              value: "ILS",
              editable: true,
            },
          },
        },
        userWasAuthenticated: false,
        context: "R89001",
        redirects: {
          ttlExpired: "https://btc-thai.com/offer/tests/feezback_webhook.php",
          pisSuccess: "https://btc-thai.com/offer/tests/feezback_webhook.php",
          pisFailure: "https://btc-thai.com/offer/tests/feezback_webhook.php",
          pisNotComplete:
            "https://btc-thai.com/offer/tests/feezback_webhook.php",
        },
      },
      // Uncomment to enable mock: enableMock: true
    };
    const token = jwt.sign(payload, privateKey, { algorithm: "RS512" });

    console.log("JWT Token generated successfully.", token);

    const postData = {
      token: token,
    };

    console.log('postData', postData);

    try {
      const response = await axios.post(
        "https://lgs-prod.feezback.cloud/link",
        postData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          maxRedirects: 10,
          timeout: 0,
        },
      );

      const result = response.data;
      const paymentLink = result.link;

      console.log("Payment link:", paymentLink);
      // Redirect user to paymentLink for payment
      return {
        status: 200,
        message: "Bank transfer payment initiated successfully",
        data: { paymentLink, result },
        error: {},
      };
    } catch (error) {
      return{
        status: 500,
        message: "Error initiating bank transfer payment",
        error: { message: error.message }

      }
    }
  }
}
