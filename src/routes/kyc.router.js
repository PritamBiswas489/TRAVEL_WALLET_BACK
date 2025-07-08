import "../config/environment.js";
import express from "express";
import KycController from "../controllers/kyc.controller.js";

const router = express.Router();
/**
 * @swagger
 * /api/auth/kyc/create-applicant:
 *   post:
 *     summary: Create a new KYC applicant
 *     description: Creates a new applicant for KYC verification.
 *     tags:
 *       - Auth-KYC
 *     security:
 *      - bearerAuth: []
 *      - refreshToken: []
 *     responses:
 *       200:
 *         description: Applicant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 applicantId:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/create-applicant", async (req, res, next) => {
  const response = await KycController.createApplicant({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/kyc/get-access-token:
 *   get:
 *     summary: Get access token for KYC
 *     description: Retrieves an access token required for KYC operations.
 *     tags:
 *       - Auth-KYC
 *     security:
 *      - bearerAuth: []
 *      - refreshToken: []
 *     responses:
 *       200:
 *         description: Access token retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/get-access-token", async (req, res, next) => {
  const response = await KycController.getAccessToken({
    headers: req.headers,
    user: req.user,
  });
  res.return(response);
});
export default router;
