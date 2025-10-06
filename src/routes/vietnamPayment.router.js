import '../config/environment.js';
import express from 'express';
import VietnamPaymentController from '../controllers/vietnamPayment.controller.js';
const router = express.Router();


/**
 * @swagger
 *  /api/auth/ninePay/decode-qr-code:
 *   post:
 *     summary: Validate NinePay transaction via QR code
 *     tags:
 *       - Vietnam Payment
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrCode:
 *                 type: string
 *                 description: QR code string for transaction validation
 *             required:
 *               - qrCode
 *     responses:
 *       200:
 *         description: Transaction validated successfully
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
router.post('/decode-qr-code', async (req, res, next) => {
    const response = await VietnamPaymentController.decodeQrCode({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});


/**
 * @swagger
 *  /api/auth/ninePay/buy-expense:
 *   post:
 *     summary: Buy expense using NinePay
 *     tags:
 *       - Vietnam Payment
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletCurrency:
 *                 type: string
 *                 example: ILS
 *                 description: Currency of the wallet
 *               amount:
 *                 type: number
 *                 example: 20000
 *                 description: Amount to spend
 *               expenseCatId:
 *                 type: integer
 *                 example: 1
 *                 description: Expense category ID
 *               memo:
 *                 type: string
 *                 example: "Making Payment in General"
 *                 description: Memo for the expense
 *               bank_no:
 *                 type: string
 *                 example: "BIDV"
 *                 description: Bank name
 *               account_number:
 *                 type: string
 *                 example: "2034030440000"
 *                 description: Bank account number
 *               account_name:
 *                 type: string
 *                 example: "NGUYEN VAN A"
 *                 description: Bank account holder name
 *             required:
 *               - walletCurrency
 *               - amount
 *               - expenseCatId
 *               - memo
 *               - bank_no
 *               - account_number
 *               - account_name
 *     responses:
 *       200:
 *         description: Expense bought successfully
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
router.post('/buy-expense', async (req, res, next) => {
    const response = await VietnamPaymentController.buyExpense({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});


export default router;
