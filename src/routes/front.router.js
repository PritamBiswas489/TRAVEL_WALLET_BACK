import '../config/environment.js';
import express from 'express';
import { default as loginRouter } from './login.router.js';
import { default as notificationRouter } from './notification.router.js';
import trackIpAddressDeviceId from '../middlewares/trackIpAddressDeviceId.js';
const router = express.Router();
import ContactUsController from '../controllers/contactus.controller.js';
import KycController from '../controllers/kyc.controller.js';
import ContentController from '../controllers/content.controller.js';
import ExpensesCategoriesController from '../controllers/expenses.categories.controller.js';
import fs from 'fs';
import path from 'path';
import PhilippinesPaymentController from '../controllers/philippinesPayment.controller.js';
import VietnamPaymentController from '../controllers/vietnamPayment.controller.js';
import multer from 'multer';
import DecodeQrCodeService from '../services/decodeQrCode.service.js';
import BankTransferPaymentController from '../controllers/bankTransferPayment.controller.js';
import AirwallexPaymentController from '../controllers/airwallexPayment.controller.js';
 
import { countryCodes } from '../config/countries.js';

router.use(trackIpAddressDeviceId);


/**
 * @swagger
 * /api/front/contact-us:
 *   post:
 *     summary: Save contact us content
 *     tags: [Non authenticated routes]
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
 *               address:
 *                 type: string
 *                 required: true
 *               phoneOne:
 *                 type: string
 *                 required: true
 *               phoneTwo:
 *                 type: string
 *                 required: false
 *               email:
 *                 type: string
 *                 required: true
 *               website:
 *                 type: string
 *                 required: false
 *     responses:
 *       200:
 *         description: Content saved successfully
 */
router.post('/contact-us', async (req, res, next) => {
	const response = await ContactUsController.saveContent({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});
//create swagger  for below router
 /**
    * @swagger
    * /api/front/contact-us:
    *   get:
    *     summary: Get contact us content
    *     tags: [Non authenticated routes]
    *     security:
    *       - bearerAuth: []
    *       - refreshToken: []
    *     responses:
    *       200:
    *         description: Contact us endpoint is working
    */
router.get('/contact-us', async (req, res, next) => {
   const response = await ContactUsController.listAll({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response)
});

/**
 * @swagger
 * /api/front/faq-list:
 *   get:
 *     summary: Get list of FAQs
 *     tags: [Non authenticated routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: List of FAQs retrieved successfully
 */
router.get('/faq-list', async (req, res, next) => {
   const response = await ContentController.listFaqs({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});

/**
 * @swagger
 * /api/front/terms-and-conditions:
 *   get:
 *     summary: Get terms and conditions content
 *     tags: [Non authenticated routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Terms and conditions retrieved successfully
 */
router.get('/terms-and-conditions', async (req, res, next) => {
   const response = await ContentController.getTermsAndConditions({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});

/**
 * @swagger
 * /api/front/privacy-policy:
 *   get:
 *     summary: Get privacy policy content
 *     tags: [Non authenticated routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Privacy policy retrieved successfully
 */
router.get('/privacy-policy', async (req, res, next) => {
   const response = await ContentController.getPrivacyPolicy({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});
/**
 * @swagger
 * /api/front/expenses-categories:
 *   get:
 *     summary: Get expenses categories content
 *     tags: [Non authenticated routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Expenses categories retrieved successfully
 */
router.get('/expenses-categories', async (req, res, next) => {
   const response = await ExpensesCategoriesController.listExpenses({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});
/**
 * @swagger
 * /api/front/countries:
 *   get:
 *     summary: Get list of supported countries
 *     tags: [Non authenticated routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: List of countries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                       name:
 *                         type: string
 */
router.get('/countries', async (req, res, next) => {
   res.json({ success: true, data: countryCodes });
});


/**
 * @swagger
 * /api/front/sumsub-kyc-webhook:
 *   post:
 *     summary: Handle Sumsub KYC webhook events
 *     tags: [Kyc-webhook]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload sent by Sumsub KYC webhook
 *     responses:
 *       200:
 *         description: Webhook received successfully
 */
router.post('/sumsub-kyc-webhook', async (req, res) => {
   // Handle the webhook event
   // const data = JSON.stringify(req.body, null, 2);
   // const now = new Date();
   // const filename = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.txt`;
   // const filePath = path.join(process.cwd(), 'public', filename);

   // fs.writeFile(filePath, data, (err) => {
   //    if (err) {
   //       console.error('Error writing webhook data:', err);
   //       return res.status(500).send('Failed to save webhook data');
   //    }
   //    console.log('Received Sumsub KYC webhook:', req.body);
   //    res.status(200).send('Webhook received');
   // });

   const response = await KycController.createWebhookStatusResponse({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response)


});
/**
 * @swagger
 * /api/front/pisopay-callback:
 *   post:
 *     summary: Handle PisoPay callback events
 *     tags: [Philippines Payment Callback]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description:  Payload sent by PisoPay callback
 *     responses:
 *       200:
 *         description: Callback received successfully
 */

router.post("/pisopay-callback", async (req, res) => {
   const response = await PhilippinesPaymentController.callbackTransaction({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});

/**
 * @swagger
 * /api/front/ninePay-ipn:
 *   post:
 *     summary: Handle NinePay IPN events
 *     tags: [Vietnam Payment Callback]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description:  Payload sent by NinePay IPN
 *     responses:
 *       200:
 *         description: Callback received successfully
 */
router.post("/ninePay-ipn", async (req, res) => {
   const response = await VietnamPaymentController.ninePayIpn({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});

const uploaddecodeQrCodeImageDir = './uploads/decodeQrCodeImage/';
if (!fs.existsSync(uploaddecodeQrCodeImageDir)) {
  fs.mkdirSync(uploaddecodeQrCodeImageDir, { recursive: true });
}

const storageDecodeQrCodeImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploaddecodeQrCodeImageDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilterSalesReport = (req, file, cb) => {
   const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/heic'
   ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const uploadDecodeQrCodeImage = multer({ storage: storageDecodeQrCodeImage, fileFilter: fileFilterSalesReport });
/**
 * @swagger
 * /api/front/decodeQrCodeImage:
 *   post:
 *     summary: Upload and decode a QR code image
 *     tags: [Non authenticated routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The QR code image file to upload
 *     responses:
 *       200:
 *         description: QR code image uploaded and decoded successfully
 *       400:
 *         description: Invalid file type or upload error
 */
router.post("/decodeQrCodeImage", uploadDecodeQrCodeImage.single('file'), async (req, res) => {
    if (!req.file) {
         return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }
    const path = req.file.path;
      try {
         const decodedText = await DecodeQrCodeService.decodeQR(path);
         // Optionally, delete the file after decoding
         fs.unlink(path, (err) => {
           if (err) {
             console.error('Error deleting file:', err);
           }
         });
         if(decodedText === null) {
            return  res.status(400).json({ error: 'No QR code found in the image' });
         }
         res.json({ decodedText });
      } catch (error) {
         fs.unlink(path, (err) => {
           if (err) {
             console.error('Error deleting file:', err);
           }
         });
         console.error('Error decoding QR code:', error);
         res.status(500).json({ error: 'Failed to decode QR code' });
      }
});



/**
 * @swagger
 * /api/front/bank-transfer-payment:
 *   post:
 *     summary: Initiate a bank transfer payment
 *     tags: [Auth-Deposit Bank Transfer routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload for initiating bank transfer payment
 *     responses:
 *       200:
 *         description: Bank transfer payment initiated successfully
 */
router.post('/bank-transfer-payment', async (req, res, next) => {
   const response = await BankTransferPaymentController.initiateBankTransferPayment({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});


/**
 * @swagger
 * /api/front/bank-transfer-payment-webhook:
 *   post:
 *     summary: Handle bank transfer payment webhook events
 *     tags: [Auth-Deposit Bank Transfer routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload sent by bank transfer payment webhook
 *     responses:
 *       200:
 *         description: Webhook received successfully
 */
router.post('/bank-transfer-payment-webhook', async (req, res, next) => {
   const response = await BankTransferPaymentController.handleBankTransferPaymentWebhook({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});








/**
 * @swagger
 * /api/front/airwallex-payment-webhook:
 *   post:
 *     summary: Handle airwallex payment webhook events
 *     tags: [Auth-Deposit-airwallex routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload sent by airwallex payment webhook
 *     responses:
 *       200:
 *         description: Webhook received successfully
 */
router.post('/airwallex-payment-webhook', async (req, res, next) => {
   const response = await AirwallexPaymentController.handlePaymentWebhook({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});



/**
 * @swagger
 * /api/front/airwallex-main-global-webhook:
 *   post:
 *     summary: Handle Airwallex main global webhook events
 *     tags: [AirWallex-global-webhook]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload sent by Airwallex deposit webhook
 *     responses:
 *       200:
 *         description: Webhook received successfully
 */
router.post('/airwallex-main-global-webhook', async (req, res, next) => {
   try{
   const payload = { ...req.params, ...req.query, ...req.body };
   console.log('Received Airwallex main global webhook:', payload);
   const kycEventNames = ['account.connected', 'account.submitted', 'account.action_required', 'account.active', 'account.suspended'];
   const depositEventNames = ['deposit.rejected', 'deposit.settled', 'deposit.reversed', 'deposit.pending'];
   const transferEventNames = ['transfer.new', 'transfer.settled', 'transfer.pending', 'transfer.suspended', 'transfer.failed'];
   const chargesWebhookEventNames = ['charge.new', 'charge.pending', 'charge.settled', 'charge.suspended', 'charge.failed'];
   const cardholderWebhookEventNames = ['issuing.cardholder.pending', 'issuing.cardholder.incomplete', 'issuing.cardholder.ready', 'issuing.cardholder.disabled', 'issuing.cardholder.deleted'];
   const debitCardWebhookEventNames = ['issuing.card.modified', 'issuing.card.pending', 'issuing.card.failed', 'issuing.card.inactive', 'issuing.card.active', 'issuing.card.lost', 'issuing.card.stolen', 'issuing.card.closed', 'issuing.card.blocked', 'issuing.card.expired', 'issuing.card.low_remaining_transaction_limit'];
   const cardTransactionsWebhookEventNames = ['issuing.transaction.succeeded','issuing.transaction.failed'];
   const transactionDisputeWebhookEventNames = [
      'issuing.transaction_dispute.created',
      'issuing.transaction_dispute.submitted',
      'issuing.transaction_dispute.accepted',
      'issuing.transaction_dispute.rejected',
      'issuing.transaction_dispute.modified',
      'issuing.transaction_dispute.expired',
      'issuing.transaction_dispute.canceled',
      'issuing.transaction_dispute.won',
      'issuing.transaction_dispute.lost'

   ];
   const paymentIntentWebhookEventNames = [
      'payment_intent.created', 
      'payment_intent.requires_payment_method', 
      'payment_intent.updated', 
      'payment_intent.requires_customer_action', 
      'payment_intent.requires_capture', 
      'payment_intent.pending',
      'payment_intent.pending_review',
      'payment_intent.succeeded'
   ];

   //fund split events
   const fundSplitWebhookEventNames = [
      'funds_split.created',
      'funds_split.failed',
      'funds_split.released',
      'funds_split.settled'
   ];
   if(kycEventNames.includes(payload?.name)) {
      const response = await AirwallexPaymentController.airwallexKycWebhook({ payload, headers: req.headers });
      return res.return(response);
   }
   else if(depositEventNames.includes(payload?.name)) {
      const response = await AirwallexPaymentController.handleDepositWebhook({ payload, headers: req.headers });
      return res.return(response);
   }
   else if(transferEventNames.includes(payload?.name)) {
      const response = await AirwallexPaymentController.airwallexConnectedTransferWebhook({ payload, headers: req.headers });
      return res.return(response);
   }
   else if(chargesWebhookEventNames.includes(payload?.name)) {
      const response = await AirwallexPaymentController.handleAirwallexChargesWebhook({ payload, headers: req.headers });
      return res.return(response);
   }
   else if(cardholderWebhookEventNames.includes(payload?.name)) {
      const response = await AirwallexPaymentController.handleCardHolderWebhook({ payload, headers: req.headers });
      return res.return(response);
   }
   else if(debitCardWebhookEventNames.includes(payload?.name)) { //debit card events
      const response = await AirwallexPaymentController.handleDebitCardWebhook({ payload, headers: req.headers });
      return res.return(response);
   }
   else if(cardTransactionsWebhookEventNames.includes(payload?.name)) { //card transactions events
      const response = await AirwallexPaymentController.handleCardTransactionsWebhook({ payload, headers: req.headers });
      return res.return(response);
   }else if(transactionDisputeWebhookEventNames.includes(payload?.name)) { //transaction dispute events
      const response = await AirwallexPaymentController.handleTransactionDisputeWebhook({ payload, headers: req.headers });
      return res.return(response);
   }else if(paymentIntentWebhookEventNames.includes(payload?.name)) { //payment intent events
      const response = await AirwallexPaymentController.handlePaymentIntentWebhook({ payload, headers: req.headers });
      return res.return(response);
   }else if (fundSplitWebhookEventNames.includes(payload?.name)) { //fund split events
      const response = await AirwallexPaymentController.handleFundSplitWebhook({ payload, headers: req.headers });
      return res.return(response);
   }

   console.log('XXXXXX Received Airwallex main global webhook but event not matched:', payload);
   return res.status(200).json({ message: 'Webhook received successfully but event not matched' });
  }catch(error) {
   console.error('Error handling Airwallex main global webhook:', error);
   if (res.headersSent) {
      return next(error);
   }
   return res.status(500).json({ message: 'Internal server error' });
  }
});

/**
    * @swagger
    * /api/front/airwallet-liveness-check-redirect-url:
    *   get:
    *     summary: Get Airwallex liveness check redirect URL
    *     tags: [Airwallex-liveness-check-return]
    *     security:
    *       - bearerAuth: []
    *       - refreshToken: []
    *     responses:
    *       200:
    *         description: Redirect URL fetched successfully
    */
router.get('/airwallet-liveness-check-return-url', async (req, res, next) => {
   const response = await AirwallexPaymentController.getAirwalletLivenessCheckReturnUrl({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
});

/**
   * @swagger
   * /api/front/airwallet-liveness-check-error-url:
   *   get:
   *     summary: Get Airwallex liveness check error URL
   *     tags: [Airwallex-liveness-check-return]
   *     security:
   *       - bearerAuth: []
   *       - refreshToken: []
   *     responses:
   *       200:
   *         description: Error URL fetched successfully
   */
router.get('/airwallet-liveness-check-error-url', async (req, res, next) => {
    const response = await AirwallexPaymentController.getAirwalletLivenessCheckErrorUrl({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
    res.return(response);
});


/**
 * @swagger
 * /api/front/retrieve-payment-intent/{paymentIntentId}:
 *   get:
 *     summary: Retrieve Airwallex payment intent
 *     tags:
 *       - Front-airwallex-kyc-wallet routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: path
 *         name: paymentIntentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Airwallex payment intent ID
 *     responses:
 *       200:
 *         description: Success - Payment intent retrieved
 */
router.get('/retrieve-payment-intent/:paymentIntentId', async (req, res) => {
  const response = await AirwallexPaymentController.retrievePaymentIntent({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
  res.return(response);
});

 

router.use('/login',loginRouter)
router.use('/notification', notificationRouter);




export default router;