import "../config/environment.js";
import express from "express";
import QrGenerateCodeController from "../controllers/QrGenerateCodeController.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/qr-generate-code/personal-qr:
 *   get:
 *     summary: Get personal QR details
 *     description: Retrieves personal QR information for the authenticated user.
 *     tags:
 *       - Auth-QR Generate Code
 *     security:
 *      - bearerAuth: []
 *      - refreshToken: []
 *     responses:
 *       200:
 *         description: Personal QR details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/personal-qr", async (req, res, next) => {
	const response = await QrGenerateCodeController.getPersonalQr({
		payload: { ...req.params, ...req.query, ...req.body },
		headers: req.headers,
		user: req.user,
	});
	res.return(response);
});

/**
 * @swagger
 * /api/auth/qr-generate-code/payment-requests:
 *   post:
 *     summary: Create payment request
 *     description: Creates a payment request using amount and currency.
 *     tags:
 *       - Auth-QR Generate Code
 *     security:
 *      - bearerAuth: []
 *      - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *                 example: 100
 *               currency:
 *                 type: string
 *                 description: Payment currency code
 *                 example: ILS
 *     responses:
 *       200:
 *         description: Payment request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/payment-requests", async (req, res, next) => {
	const response = await QrGenerateCodeController.createPaymentRequest({
		payload: { ...req.params, ...req.query, ...req.body },
		headers: req.headers,
		user: req.user,
	});
	res.return(response);
});

/**
 * @swagger
 * /api/auth/qr-generate-code/payment-links/{token}:
 *   get:
 *     summary: Get payment link by token
 *     description: Retrieves payment link details using token.
 *     tags:
 *       - Auth-QR Generate Code
 *     security:
 *      - bearerAuth: []
 *      - refreshToken: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment link token
 *     responses:
 *       200:
 *         description: Payment link details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/payment-links/:token", async (req, res, next) => {
	const response = await QrGenerateCodeController.getPaymentLinkByToken({
		payload: { ...req.params, ...req.query, ...req.body },
		headers: req.headers,
		user: req.user,
	});
	res.return(response);
});

export default router;
