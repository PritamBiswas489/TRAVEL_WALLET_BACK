import "../instrument.js";
import "./config/environment.js";
import "./utils/processErrorLogger.js";

import express from "express";
import compression from "compression";
import cors from "cors";
import { resolve as pathResolve, dirname, join as pathJoin } from "path";
import helmet from "helmet";
import bodyParser from "body-parser";
import * as Sentry from "@sentry/node";
import swaggerUi from "swagger-ui-express";
import basicAuth from "express-basic-auth";
import multer from "multer";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { performance } from "node:perf_hooks";

import db from "./databases/models/index.js";
import customReturn from "./middlewares/responseBuilder.js";
import locales from "./middlewares/locales.js";

const { NODE_ENV, PORT, SENTRY_ENABLED } = process.env;

const app = express();

const appStartTime = performance.now();

const currentDir = dirname(fileURLToPath(import.meta.url));

const publicDir = pathResolve(currentDir, "../public");

// --------------------------------------------------
// Basic middleware
// --------------------------------------------------

app.use(express.static(publicDir));

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "accesstoken",
      "refreshtoken",
    ],
    exposedHeaders: ["accesstoken", "refreshtoken"],
  }),
);

app.use(compression());

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://*.airwallex.com"],
        scriptSrcElem: ["'self'", "'unsafe-inline'", "https://*.airwallex.com"],
        connectSrc: ["'self'", "https://*.airwallex.com"],
        frameSrc: ["'self'", "https://*.airwallex.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://*.airwallex.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://*.airwallex.com"],
        workerSrc: ["'self'", "blob:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'", "https://*.airwallex.com"],
        frameAncestors: ["'self'"],
      },
    },
  }),
);

app.use(locales);

// --------------------------------------------------
// Custom request headers
// --------------------------------------------------

app.use((req, res, next) => {
  const defaultHeaders = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    accept: "*/*",
    connection: "keep-alive",
    referer: "https://back.travelmoney.co.il/",
    cookie: "cf_clearance=xyz123; session_token=abc456;",
  };

  for (const [key, value] of Object.entries(defaultHeaders)) {
    if (!req.headers[key]) {
      req.headers[key] = value;
    }
  }

  next();
});

app.use(customReturn);

// --------------------------------------------------
// Swagger authentication
// --------------------------------------------------

app.use(
  ["/api-docs", "/swagger"],
  basicAuth({
    users: {
      admin: "admin",
    },
    challenge: true,
    unauthorizedResponse: () => "Unauthorized",
  }),
);

// Swagger is initialized dynamically during startup.
let swaggerSpecPromise;

async function initializeSwagger() {
  if (!swaggerSpecPromise) {
    swaggerSpecPromise = import("./swagger.js");
  }

  const { swaggerSpec } = await swaggerSpecPromise;

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        withCredentials: true,
        persistAuthorization: true,
      },
      customJs: "/swagger-restore-api.js",
    }),
  );
}

// --------------------------------------------------
// Request logging
// --------------------------------------------------

app.use((req, res, next) => {
  console.log("Incoming request path:", req.path, req.method);
  next();
});

// --------------------------------------------------
// Body parsers
// --------------------------------------------------

app.use(bodyParser.json({ limit: "500mb" }));

app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 50000,
  }),
);

// --------------------------------------------------
// Health-check endpoint
// --------------------------------------------------
app.get("/test-server", (req, res) => {
  res.status(200).json({
    msg: `server working - ${NODE_ENV} mode ON PORT: ${PORT || 4000} BASE URL: ${process.env.BASE_URL}`,
  });
});

// --------------------------------------------------
// Database health-check endpoint
// --------------------------------------------------

app.get("/test-database", async (req, res) => {
  try {
    await db.sequelize.authenticate();

    return res.status(200).json({
      msg: "Database connection successful",
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);

    return res.status(500).json({
      msg: "Database connection failed",
      error: error.message,
    });
  }
});

// --------------------------------------------------
// OTP test endpoint
// --------------------------------------------------

app.get("/test-otp/:number/:otp_code", async (req, res) => {
  const phoneRegex = /^\+\d{1,3}\d{4,14}$/;
  const otpRegex = /^\d{4}$/;

  const { number, otp_code } = req.params;

  if (!phoneRegex.test(number)) {
    return res.status(400).json({
      error: "Invalid phone number format. Format: +<country_code><number>",
    });
  }

  if (!otpRegex.test(otp_code)) {
    return res.status(400).json({
      error: "Invalid OTP code format. Format: 1234",
    });
  }

  try {
    const { otpWhatsappService, otpSmsService } = await import(
      "./services/messages.service.js"
    );

    const [whatsappResult, smsResult] = await Promise.all([
      otpWhatsappService(number, otp_code),
      otpSmsService(number, otp_code),
    ]);

    return res.status(200).json({
      whatsapp: whatsappResult,
      sms: smsResult,
    });
  } catch (error) {
    console.error("Error in OTP verification:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// --------------------------------------------------
// Payment form
// --------------------------------------------------

app.get("/payment-intent-form", (req, res) => {
  res.sendFile(
    pathResolve(
      pathJoin(currentDir, "../public/airwallex-topup-text-input.html"),
    ),
  );
});

app.get("/airwallex-payment", (req, res) => {
  const { payment_intent_id } = req.query;

  if (!payment_intent_id) {
    return res.status(400).send("Missing payment_intent_id");
  }

  console.log(
    "Redirecting to payment confirmation page for payment_intent_id:",
    payment_intent_id,
  );

  return res.sendFile(
    pathResolve(
      pathJoin(currentDir, "../public/airwallex-payment-redirect.html"),
    ),
  );
});

// --------------------------------------------------
// Sentry test endpoint
// --------------------------------------------------

app.get("/test-error2", (req, res) => {
  try {
    NeverFoundFunction();
  } catch (error) {
    if (SENTRY_ENABLED === "true") {
      Sentry.captureException(error);
    }

    return res.status(500).json({
      error: "something went wrong",
    });
  }
});

// --------------------------------------------------
// Initialize routes before listening
// --------------------------------------------------

let initializationPromise;

export function initializeApp() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const start = performance.now();

    console.log("Initializing Swagger...");

    await initializeSwagger();

    console.log(
      `Swagger initialized in ${(performance.now() - start).toFixed(2)} ms`,
    );

    console.log("Initializing API routes...");

    const routeStart = performance.now();

    const { default: apiRouter } = await import("./routes/index.router.js");

    app.use("/api", apiRouter);

    console.log(
      `API routes initialized in ${(performance.now() - routeStart).toFixed(2)} ms`,
    );

    app.use("/uploads", express.static("uploads"));

    // Register Sentry's Express error handler after routes.
    if (SENTRY_ENABLED === "true") {
      Sentry.setupExpressErrorHandler(app);
    }

    // Multer and application error handling.
    app.use((err, req, res, next) => {
      if (res.headersSent) {
        return next(err);
      }

      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File size should not exceed 2MB.",
          });
        }
      }

      if (err) {
        console.error("Request error:", err);

        return res.status(400).json({
          error: err.message || "Bad request",
        });
      }

      return next();
    });

    console.log(
      `Application initialized in ${(performance.now() - appStartTime).toFixed(2)} ms`,
    );
  })();

  return initializationPromise;
}

export default app;
