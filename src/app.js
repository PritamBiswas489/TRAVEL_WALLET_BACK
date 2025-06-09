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
import axios from "axios";

const { NODE_ENV, DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_PORT } =
  process.env;
const publicDir =
  NODE_ENV === "development"
    ? pathResolve(pathJoin(dirname("./"), "public"))
    : pathResolve(pathJoin(dirname("./"), "public"));

const app = express();
app.use(compression());
app.use(helmet());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "postgres",
  port: DB_PORT,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
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
  res
    .status(200)
    .send({
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
 *     tags: [OTP]
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
    return res.status(400).json({ error: "Invalid phone number format" });
  }
  if (!otpRegex.test(otp_code)) {
    return res.status(400).json({ error: "Invalid OTP code format" });
  }

  const AUTH_TOKEN =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mjc0OSwic3BhY2VJZCI6Njk5NTEsIm9yZ0lkIjo3NzQwOCwidHlwZSI6ImFwaSIsImlhdCI6MTY4OTAwMjIxMH0.mfnCbPYERIb-r2gZ_oNY_rLLeQNIusdtLki46i8sj8Y";
  const headers = {
    Accept: "application/json",
    Authorization: AUTH_TOKEN,
  };
  try {
    // Step 1: Check if number exists
          const getUrl = `https://api.respond.io/v2/contact/phone:+${number}`;
          let response = await axios.get(getUrl, { headers });
          console.log(`Number exists: ${number}`);
        } catch (err) {
          console.log(`Creating number: ${number}`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
          // Step 2: Create number if not found
          const createUrl = `https://api.respond.io/v2/contact/create_or_update/phone:+${number}`;
          const createPayload = {
            firstName: "Customer",
            phone: number,
          };
          await axios.post(createUrl, createPayload, {
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
          });
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        // Step 3: Send OTP message
        const messagePayload = {
          channelId: 93780,
          message: {
            type: "whatsapp_template",
            template: {
              name: "whatsapp_authenticator",
              languageCode: "he",
              components: [
                {
                  type: "body",
                  text: `${otp_code} is your verification code.`,
                  parameters: [{ type: "text", text: otp_code }],
                },
                {
                  type: "buttons",
                  buttons: [
                    {
                      type: "url",
                      text: "Copy Code",
                      url: `https://www.whatsapp.com/otp/code/?otp_type=COPY_CODE&code=otp${otp_code}`,
                      parameters: [{ type: "text", text: otp_code }],
                    },
                  ],
                },
              ],
            },
          },
        };

        const messageUrl = `https://api.respond.io/v2/contact/phone:+${number}/message`;

        try {
          const messageResponse = await axios.post(messageUrl, messagePayload, {
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
          });

          console.log(messageResponse.data);
          res.json(messageResponse.data);
        } catch (error) {
          const errorData = error.response?.data || {};
          const contactId = errorData.message?.contactId;

          if (contactId) {
            const fallbackUrl = `https://api.respond.io/v2/contact/id:${contactId}/message`;
            const retryResponse = await axios.post(fallbackUrl, messagePayload, {
              headers: {
                ...headers,
                "Content-Type": "application/json",
              },
            });

            console.log(retryResponse.data);
            res.json(retryResponse.data);
          } else {
            console.error(errorData);
            res
              .status(500)
              .json({ error: "Failed to send message", details: errorData });
          }
        }
});

export default app;
