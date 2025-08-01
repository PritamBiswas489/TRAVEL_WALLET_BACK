import "./config/environment.js";

import express, { Router, json, urlencoded } from "express";
import compression from "compression";
import cors from "cors";
import { resolve as pathResolve, dirname, join as pathJoin } from "path";
import helmet from "helmet";
import bodyParser from "body-parser";
import * as Sentry from "@sentry/node";
import { Sequelize } from "sequelize";
import { swaggerSpec } from "./swagger.js";
import swaggerUi from "swagger-ui-express";
import { default as apiRouter } from "./routes/index.router.js";
import basicAuth from "express-basic-auth";
import multer from "multer";
import customReturn from "./middlewares/responseBuilder.js";
import locales from "./middlewares/locales.js";

import { initializeSentry } from "./config/sentry.config.js";

// import "./cron/index.js"

import {
  otpWhatsappService,
  otpSmsService,
} from "./services/messages.service.js";
import { constants } from "http2";

const {
  NODE_ENV,
  DB_HOST,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  DB_PORT,
  SENTRY_DSN,
  SENTRY_ENABLED,
} = process.env;
const publicDir =
  NODE_ENV === "development"
    ? pathResolve(pathJoin(dirname("./"), "public"))
    : pathResolve(pathJoin(dirname("./"), "public"));

const app = express();

if (SENTRY_ENABLED === "true") {
  (async () => {
    await initializeSentry(SENTRY_DSN);
  })();
}
app.use(
  cors({
    exposedHeaders: ["accesstoken", "refreshtoken"],
  })
);
app.use(compression());
app.use(helmet());
app.use(locales);
app.use((req, res, next) => {
   const defaultHeaders = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'accept': '*/*',
    'connection': 'keep-alive',
    'referer': 'https://back.travelmoney.co.il/',
    'cookie': 'cf_clearance=xyz123; session_token=abc456;',
  };

  for (const [key, value] of Object.entries(defaultHeaders)) {
    if (!req.headers[key]) {
      req.headers[key] = value;
    }
  }
  // console.log("Request Headers:", req.headers);
  next();
});
// app.use(trackIpAddressDeviceId);
app.use(customReturn);

app.use(
  ["/api-docs", "/swagger"],
  basicAuth({
    users: { admin: "admin" }, // username:password
    challenge: true, // shows browser auth popup
    unauthorizedResponse: (req) => "Unauthorized",
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const isProduction = process.env.NODE_ENV === "production";
const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "postgres",
  port: DB_PORT,
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
  logging: false,
});

app.use(bodyParser.json({ limit: "500mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(express.static(publicDir));

/**
 * @swagger
 * /test-server:
 *   get:
 *     summary: Test server endpoint
 *     tags: [Testing endpoints]
 *     responses:
 *       200:
 *         description: Server is working
 */
app.get("/test-server", (req, res, next) => {
  res.status(200).send({
    msg: `server working - ${NODE_ENV} mode ON PORT: ${process.env.PORT} BASE URL: ${process.env.BASE_URL}`,
  });
});
/**
 * @swagger
 * /test-database:
 *   get:
 *     summary: Test database endpoint
 *     tags: [Testing endpoints]
 *     responses:
 *       200:
 *         description: Server is working
 */
app.get("/test-database", async (req, res, next) => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    res.status(200).send({ msg: "Database connection successful" });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    res.status(500).send({ msg: "Database connection failed", error });
  }
});
/**
 * @swagger
 * /test-otp/{number}/{otp_code}:
 *   get:
 *     summary: Test OTP verification
 *     tags: [Testing endpoints]
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         placeholder: +919830990065
 *         schema:
 *           type: string
 *           example: +919830990065
 *         description: The phone number
 *       - in: path
 *         name: otp_code
 *         required: true
 *         placeholder: 1234
 *         schema:
 *           type: string
 *           example: 1234
 *         description: The OTP code
 *     responses:
 *       200:
 *         description: OTP received successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Send successful
 */
app.get("/test-otp/:number/:otp_code", async (req, res) => {
  //add  validation for number and otp_code phone number format +<country_code><number>
  const phoneRegex = /^\+\d{1,3}\d{4,14}$/; // Example regex for international phone numbers
  const otpRegex = /^\d{4}$/; // Example regex for 4-digit OTP codes

  const { number, otp_code } = req.params;
  if (!phoneRegex.test(number)) {
    return res.status(400).json({
      error: "Invalid phone number format. Format: +<country_code><number>",
    });
  }
  if (!otpRegex.test(otp_code)) {
    return res
      .status(400)
      .json({ error: "Invalid OTP code format. Format: 1234" });
  }
  try {
    const [whatsappResult, smsResult] = await Promise.all([
      otpWhatsappService(number, otp_code),
      otpSmsService(number, otp_code),
    ]);
    res.status(200).json({
      whatsapp: whatsappResult,
      sms: smsResult,
    });
  } catch (error) {
    console.error("Error in OTP verification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/test-error2", (req, res) => {
  try {
    NeverFoundFunction();
  } catch (e) {
    SENTRY_ENABLED === "true" && Sentry.captureException(e);
    res.status(500).send({ error: "something went wrong" });
  }
});

app.use("/api", apiRouter);
if (SENTRY_ENABLED === "true") {
  (async () => {
    Sentry.setupExpressErrorHandler(app);
  })();
}
app.use("/uploads", express.static("uploads"));

// Multer error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File size should not exceed 2MB." });
    }
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

export default app;
