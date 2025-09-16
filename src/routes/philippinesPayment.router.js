import '../config/environment.js';
import express from 'express';
import PhilippinesPaymentController from '../controllers/philippinesPayment.controller.js';
const router = express.Router();


/**
 * @swagger
 *  /api/auth/pisopay/token:
 *   get:
 *     summary: Get PisoPay API token
 *     tags:
 *       - Philippines Payment
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
    const response = await PhilippinesPaymentController.getToken();
    res.return(response);
});
/**
 * @swagger
 *  /api/auth/pisopay/remittance-validate-transaction:
 *   post:
 *     summary: Validate PisoPay transaction via QR code
 *     tags:
 *       - Philippines Payment
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
router.post('/remittance-validate-transaction', async (req, res, next) => {
    const response = await PhilippinesPaymentController.validatePisoPayTransaction({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});
/**
 * @swagger
 *  /api/auth/pisopay/remittance-initiate-transaction:
 *   post:
 *     summary: Initiate PisoPay transaction
 *     tags:
 *       - Philippines Payment
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
 *               amount:
 *                 type: number
 *                 description: Amount to be transacted
 *             required:
 *               - qrCode
 *               - amount
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
router.post('/remittance-initiate-transaction', async (req, res, next) => {
    const response = await PhilippinesPaymentController.initiatePisoPayTransaction({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});

/**
 * @swagger
 *  /api/auth/pisopay/buy-expense:
 *   post:
 *     summary: Buy expense using PisoPay
 *     tags:
 *       - Philippines Payment
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
 *                 example: 50
 *                 description: Amount to spend
 *               qrCode:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *                 description: QR code string (optional)
 *               expenseCatId:
 *                 type: integer
 *                 example: 1
 *                 description: Expense category ID
 *               memo:
 *                 type: string
 *                 example: "Making Payment in General"
 *                 description: Memo for the expense
 *             required:
 *               - walletCurrency
 *               - amount
 *               - expenseCatId
 *               - memo
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
    const response = await PhilippinesPaymentController.buyExpense({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});
/**
 * @swagger
 *  /api/auth/pisopay/expense-transaction-details:
 *   post:
 *     summary: Get details of an expense transaction
 *     tags:
 *       - Philippines Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transaction_info_code:
 *                 type: string
 *                 description: Transaction info code to retrieve details
 *             required:
 *               - transaction_info_code
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
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
router.post('/expense-transaction-details', async (req, res, next) => {
    const response = await PhilippinesPaymentController.getExpenseTransactionDetails({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});

export default router;