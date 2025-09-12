import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import PisoPayApiService from "../services/pisoPayApi.service.js";

export default class PhilippinesPaymentController {


    static async validatePisoPayTransaction(request) {
        await PisoPayApiService.login();
        console.log("Request received in controller:", request);
    }

    static initiatePisoPayTransaction(request) {
        console.log("Initiate PisoPay transaction:", request);

    }

    static async callbackTransaction(request) {
        console.log("Callback received in controller:", request);

    }

}