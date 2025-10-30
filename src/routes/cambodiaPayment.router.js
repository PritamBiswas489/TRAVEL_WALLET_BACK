import '../config/environment.js';
import express from 'express';
import CambodiaPaymentController from '../controllers/cambodiaPayment.controller.js';
const router = express.Router();



/**
 * @swagger
 *  /api/auth/kesspay/token:
 *   get:
 *     summary: Get KessPay API token
 *     tags:
 *       - Cambodia Payment
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Token retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid request
 */
router.get('/token', async (req, res, next) => {
    const response = await CambodiaPaymentController.getToken();
    res.return(response);
});




/**
 * @swagger
 *  /api/auth/kesspay/decode-khqr:
 *   post:
 *     summary: Decode KHQR code
 *     tags:
 *       - Cambodia Payment
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service
 *               - sign_type
 *               - qrcode
 *             properties:
 *               service:
 *                 type: string
 *                 example: "webpay.acquire.decodeKhqr"
 *               sign_type:
 *                 type: string
 *                 example: "MD5"
 *               qrcode:
 *                 type: string
 *                 example: "00020101021229370009khqr@aclb011009781311020206ACLEDA392000118551247962701014520420005802KH530384054045.005912PHOS RAKSMEY6010Phnom Penh621402100978131102630464F8"
 *     responses:
 *       200:
 *         description: KHQR decoded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request
 */
router.post('/decode-khqr', async (req, res) => {
    const response = await CambodiaPaymentController.decodeKHQR({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});


/**
 * @swagger
 *  /api/auth/kesspay/buy-expense:
 *   post:
 *     summary: Buy expense using Cambodia payment
 *     tags:
 *       - Cambodia Payment
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletCurrency
 *               - transactionCurrency
 *               - transactionAmount
 *               - merchantName
 *               - merchantCity
 *               - qrCode
 *             properties:
 *               walletCurrency:
 *                 type: string
 *                 example: "ILS"
 *               transactionCurrency:
 *                 type: string
 *                 example: "USD"
 *               transactionAmount:
 *                 type: number
 *                 example: 5.00
 *               merchantName:
 *                 type: string
 *                 example: "PHOS RAKSMEY"
 *               merchantCity:
 *                 type: string
 *                 example: "Phnom Penh"
 *               qrCode:
 *                 type: string
 *                 example: "00020101021229370009khqr@aclb011009781311020206ACLEDA392000118551247962701014520420005802KH530384054045.005912PHOS RAKSMEY6010Phnom Penh621402100978131102630464F8"
 *               expenseCatId:
 *                 type: number
 *                 default: 1
 *                 example: 1
 *     responses:
 *       200:
 *         description: Expense purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request
 */
router.post('/buy-expense', async (req, res) => {
    const response = await CambodiaPaymentController.buyExpense({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});



export default router;
