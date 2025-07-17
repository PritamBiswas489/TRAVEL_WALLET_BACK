import swaggerJsdoc from "swagger-jsdoc";
import "./config/environment.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Travel Wallet API",
      version: "1.0.0",
      description: "API docs with Swagger for travel wallet",
    },
    tags: [
      {
        name: "Testing endpoints",
        description: "Endpoints for testing purposes",
      },
      {
        name: "Redis testing routes",
        description: "Endpoints for Redis cache management",
      },
      {
        name: "Non authenticated routes",
        description: "Endpoints that do not require authentication",
      },
      { name: "Login routes", description: "User login endpoints" },
      {
        name: "Auth-Profile routes",
        description: "User profile management endpoints",
      },
      {
        name: "Auth-KYC",
        description: "KYC management endpoints",
      },
      {
        name: "Kyc-webhook",
        description: "KYC webhook endpoints",
      },
      { name: "Currency routes", description: "Currency management endpoints" },
      {
        name: "Auth-Deposit routes",
        description: "Pelecard deposit endpoints",
      },
      {
        name: "Auth-Wallet routes",
        description: "Wallet management endpoints",
      },
      {
        name: "Auth-Transfer routes",
        description: "Transfer management endpoints",
      },
      { name: "Admin routes", description: "Admin management endpoints" },
      {
        name: "Notification routes - Testing purposes",
        description: "Endpoints for testing notification service",
      },
    ],
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:4000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Access token for authentication (in Authorization header)",
        },
        refreshToken: {
          type: "apiKey",
          in: "header",
          name: "refreshtoken",
          description:
            "Refresh token for renewing access (in `refreshtoken` header)",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  //   apis: ['./routes/*.js'],
  apis: ["./src/*.js", "./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
