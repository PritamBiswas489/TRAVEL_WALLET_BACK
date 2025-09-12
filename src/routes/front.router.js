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

router.use('/login',loginRouter)
router.use('/notification', notificationRouter);




export default router;