import '../config/environment.js';
import express from 'express';
import ThaiPaymentController from '../controllers/thaiPaymentController.controller.js';
 
const router = express.Router();

/**
 * @swagger
 *  /api/auth/ipps/get-payment-query-data:
 *   post:
 *     summary: Get payment query data from Thai Payment QR code
 *     tags:
 *       - Thai Payment
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
 *                 description: QR code string for validation
 *                 example: "00020101021230820016A0000006770101120115010753600037405021500000220066077703204611316260181X00000053037645406178.225802TH5918LIMTRENDEMPORIUM6212070846113162630427E5"
 *               amount:
 *                 type: number
 *                 description: Amount to process
 *                 default: null
 *                 example: null
 *             required:
 *               - qrCode
 *     responses:
 *       200:
 *         description: QR code validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 */
router.post('/get-payment-query-data', async (req, res) => {
     const response = await ThaiPaymentController.getpaymentQueryData({ headers: req.headers, user: req.user, payload: req.body });
     res.return(response);
});



/**
 * @swagger
 *  /api/auth/ipps/crypto/get-payment-query-data:
 *   post:
 *     summary: Get payment query data for Crypto envelope
 *     tags:
 *       - Thai Payment
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
 *               envelope:
 *                 type: object
 *                 description: Envelope object
 *                 example: {}
 *               sig:
 *                 type: string
 *                 description: Signature string
 *                 example: "string"
 *             required:
 *               - envelope
 *               - sig
 *     responses:
 *       200:
 *         description: Crypto payment query data validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 */
router.post('/crypto/get-payment-query-data', async (req, res) => {
     const response = await ThaiPaymentController.cryptoGetpaymentQueryData({ headers: req.headers, user: req.user, payload: req.body });
     res.return(response);
});


/**
 * @swagger
 *  /api/auth/ipps/process-transfer:
 *   post:
 *     summary: Process transfer for Thai Payment
 *     tags:
 *       - Thai Payment
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
 *                 description: Wallet currency
 *                 default: ILS
 *                 example: ILS
 *               expenseCatId:
 *                 type: integer
 *                 description: Expense category ID
 *                 default: 1
 *                 example: 1
 *               qrCode:
 *                type: string
 *                description: QR code string for validation
 *                example: "00020101021230820016A0000006770101120115010753600037405021500000220066077703204611316260181X00000053037645406178.225802TH5918LIMTRENDEMPORIUM6212070846113162630427E5"
 *               memo:
 *                 type: string
 *                 description: Memo for the payment
 *                 example: "Demo payment"
 *               paymentParams:
 *                 type: object
 *                 description: Payment parameters
 *                 example:
 *                   walletId: "400130009610393"
 *                   amount: 178.22
 *                   receiverType: "BILLERID"
 *                   receiverValue: "010753600037405"
 *                   billReference1: "000002200660777"
 *                   billReference2: "4611316260181X000000"
 *                   billReference3: ""
 *             required:
 *               - walletCurrency
 *               - expenseCatId
 *               - memo
 *               - paymentParams
 *     responses:
 *       200:
 *         description: Transfer processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 */
router.post('/process-transfer', async (req, res) => {
     const response = await ThaiPaymentController.processTransfer({ headers: req.headers, user: req.user, payload: req.body });
     res.return(response);
});


/**
 * @swagger
 *  /api/auth/ipps/crypto/process-transfer:
 *   post:
 *     summary: Process transfer for Crypto envelope
 *     tags:
 *       - Thai Payment
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
 *               envelope:
 *                 type: object
 *                 description: Envelope object
 *                 example: {}
 *               sig:
 *                 type: string
 *                 description: Signature string
 *                 example: "string"
 *             required:
 *               - envelope
 *               - sig
 *     responses:
 *       200:
 *         description: Crypto transfer processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 */
router.post('/crypto/process-transfer', async (req, res) => {
     const response = await ThaiPaymentController.cryptoProcessTransfer({ headers: req.headers, user: req.user, payload: req.body });
     res.return(response);
});



/**
 * @swagger
 *  /api/auth/ipps/confirm-transfer:
 *   post:
 *     summary: Confirm transfer for Thai Payment
 *     tags:
 *       - Thai Payment
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
 *               id:
 *                 type: integer
 *                 description: Thai payment record ID
 *                 example: 123
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: Transfer confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 */
router.post("/confirm-transfer", async (req, res) => {
     const response = await ThaiPaymentController.confirmTransfer({ headers: req.headers, user: req.user, payload: req.body });
     res.return(response);
});



 
/**
 * @swagger
 *  /api/auth/ipps/get-transfer-details:
 *   get:
 *     summary: Get transfer details for Thai Payment
 *     tags:
 *       - Thai Payment
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Thai payment record ID
 *         example: 123
 *     responses:
 *       200:
 *         description: Transfer details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request
 */
router.get("/get-transfer-details",async (req,res)=>{
  const response = await ThaiPaymentController.getTransferDetails({ headers: req.headers, user: req.user, payload: { ...req.body, ...req.query } });
  res.return(response);
});



/**
 * @swagger
 *  /api/auth/ipps/deactivate-wallet:
 *   post:
 *     summary: Deactivate Thai Payment wallet
 *     tags:
 *       - Thai Payment
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
 *               id:
 *                 type: integer
 *                 description: External wallet user ID
 *                 example: "123"
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: Wallet deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 */
router.post("/deactivate-wallet", async (req, res) => {
    const response = await ThaiPaymentController.deactivateWallet({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
})

/**
 * @swagger
 *  /api/auth/ipps/expenses-transactions:
 *   post:
 *     summary: Get expenses transactions for a specific month, year and category
 *     tags:
 *       - Thai Payment
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
 *               month:
 *                 type: integer
 *                 nullable: true
 *                 default: null
 *                 description: Month for the transactions (1-12), null for all months
 *               year:
 *                 type: integer
 *                 nullable: true
 *                 default: null
 *                 description: Year for the transactions, null for all years
 *               categoryId:
 *                 type: integer
 *                 nullable: true
 *                 default: null
 *                 description: Category ID for filtering transactions, null for all categories
 *               page:
 *                 type: integer
 *                 default: 1
 *                 description: Page number for pagination
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 description: Number of transactions per page
 *             required: []
 *     responses:
 *       200:
 *         description: Expenses transactions retrieved successfully
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
router.post('/expenses-transactions', async (req, res, next) => {
    const response = await ThaiPaymentController.getExpensesTransactions({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});



/**
 * @swagger
 *  /api/auth/ipps/expenses-report:
 *   post:
 *     summary: Get expenses report for a specific month and year
 *     tags:
 *       - Thai Payment
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
 *               month:
 *                 type: integer
 *                 nullable: true
 *                 default: null
 *                 description: Month for the report (1-12), null for all months
 *               year:
 *                 type: integer
 *                 nullable: true
 *                 default: null
 *                 description: Year for the report, null for all years
 *             required: []
 *     responses:
 *       200:
 *         description: Expenses report retrieved successfully
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
router.post('/expenses-report', async (req, res, next) => {
    const response = await ThaiPaymentController.getExpensesReport({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});



/**
 * @swagger
 *  /api/auth/ipps/transaction-mark-as-favorite:
 *   post:
 *     summary: Mark a transaction as favorite
 *     tags:
 *       - Thai Payment
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
 *               label:
 *                 type: string
 *                 description: Name of the merchant
 *               transaction_id:
 *                 type: string
 *                 description: ID of the transaction to mark as favorite
 *             required:
 *               - label
 *               - transaction_id
 *     responses:
 *       200:
 *         description: Transaction marked as favorite successfully
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
router.post('/transaction-mark-as-favorite', async (req, res, next) => {
    const response = await ThaiPaymentController.markTransactionAsFavorite({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});


export default router;
 