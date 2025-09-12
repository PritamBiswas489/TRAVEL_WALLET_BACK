import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import axios from "axios";

export default class PisoPayApiService {
  static async login() {
    var data = JSON.stringify({
      username: process.env.PISOPAY_USERNAME,
      password: process.env.PISOPAY_PASSWORD,
    });
    var config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.PISOPAY_ENDPOINT}/api/v1/login/clientAPICredentials`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "CACS-KEY": process.env.PISOPAY_CACS_KEY,
      },
      data: data,
    };
    console.log("PisoPay login config:", config);
    try {
        console.log("Attempting to log in to PisoPay API...");  
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.data,
    });
    const responseData = await response.json();
      console.log("PisoPay login response:", responseData);
    } catch (e) {
        console.log("PisoPay login error:", e.message);
      if (process.env.SENTRY_ENABLED === "true") {
        Sentry.captureException(e);
      }
      throw e;
    }
  }
}
