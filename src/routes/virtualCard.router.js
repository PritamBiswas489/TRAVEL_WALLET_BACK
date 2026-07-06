import '../config/environment.js';
import express from 'express';
import VirtualCardController from '../controllers/virtualCard.controller.js';
const router = express.Router();




/**
 * @swagger
 * /api/auth/virtual-card/airwallex-create-individual-cardholder:
 *   post:
 *     summary: Create Airwallex individual cardholder
 *     tags:
 *       - Auth-airwallex-virtual-card routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Airwallex individual cardholder created successfully
 */
router.post('/airwallex-create-individual-cardholder', async (req, res, next) => {
  const response = await VirtualCardController.airwallexCreateIndividualCardholder({ headers: req.headers, user: req.user, payload: req.body });
  res.return(response);
});



/**
 * @swagger
 * /api/auth/virtual-card/airwallex-get-all-cardholders:
 *   get:
 *     summary:  Get all Airwallex cardholders for the authenticated user
 *     tags:
 *       - Auth-airwallex-virtual-card routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description:  Successfully retrieved all Airwallex cardholders for the user
 */
router.get('/airwallex-get-all-cardholders', async (req, res, next) => {
  const response = await VirtualCardController.airwallexGetAllCardholders({ headers: req.headers, user: req.user, payload: req.body });
  res.return(response);
});


/**
 * @swagger
 * /api/auth/virtual-card/delete-cardholder:
 *   post:
 *     summary: Delete Airwallex cardholder
 *     tags:
 *       - Auth-airwallex-virtual-card routes
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
 *               - cardHolderId
 *             properties:
 *               cardHolderId:
 *                 type: string
 *                 description: Airwallex cardholder ID to delete
 *     responses:
 *       200:
 *         description: Airwallex cardholder deleted successfully
 */

router.post('/delete-cardholder', async (req, res, next) => {
  const response = await VirtualCardController.airwallexDeleteCardholder({ headers: req.headers, user: req.user, payload: req.body });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/virtual-card/create-virtual-card:
 *   post:
 *     summary:  create virtual card for the authenticated user
 *     tags:
 *       - Auth-airwallex-virtual-card routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: create virtual card for the authenticated user successfully
 */
router.post('/create-virtual-card', async (req, res, next) => {
  const response = await VirtualCardController.airwallexCreateVirtualCard({ headers: req.headers, user: req.user, payload: req.body });
  res.return(response);
});


/**
 * @swagger
 * /api/auth/virtual-card/save-all-card-in-record:
 *   post:
 *     summary:  save all card in record for the authenticated user
 *     tags:
 *       - Auth-airwallex-virtual-card routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: save all card in record for the authenticated user successfully
 */


router.post('/save-all-card-in-record', async (req, res, next) => {
  const response = await VirtualCardController.saveAllCardInRecord({ headers: req.headers, user: req.user, payload: req.body });
  res.return(response);
});


/**
 * @swagger
 * /api/auth/virtual-card/get-all-card-in-record:
 *   get:
 *     summary:  get all card in record for the authenticated user
 *     tags:
 *       - Auth-airwallex-virtual-card routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: get all card in record for the authenticated user successfully
 */
router.get('/get-all-card-in-record', async (req, res, next) => {
  const response = await VirtualCardController.getAllCardInRecord({ headers: req.headers, user: req.user, payload: req.body });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/virtual-card/get-sensitive-details/{cardId}:
 *   get:
 *     summary: Get sensitive details for a specific virtual card
 *     tags:
 *       - Auth-airwallex-virtual-card routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Virtual card ID
 *     responses:
 *       200:
 *         description: Sensitive card details rendered as HTML successfully
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/get-sensitive-details/:cardId', async (req, res, next) => {
  const response = await VirtualCardController.getSensitiveDetails({ headers: req.headers, user: req.user, payload: { ...req.body, ...req.params, ...req.query }, cardId: req.params.cardId });
  res.return(response);
});


/**
 * @swagger
 * /api/auth/virtual-card/update-card-status:
 *   post:
 *     summary: Update status for a specific virtual card [ACTIVE, INACTIVE, CLOSED]
 *     tags:
 *       - Auth-airwallex-virtual-card routes
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
 *               - cardId
 *               - status
 *             properties:
 *               cardId:
 *                 type: string
 *                 description: Virtual card ID
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, CLOSED]
 *                 description: New status for the virtual card
 *     responses:
 *       200:
 *         description: Virtual card status updated successfully
 */
router.post('/update-card-status', async (req, res, next) => {
  const response = await VirtualCardController.updateCardStatus({ headers: req.headers, user: req.user, payload: req.body });
  res.return(response);
});


/**
 * @swagger
 * /api/auth/virtual-card/get-card-limit:
 *   get:
 *     summary: Get card limit for a virtual card
 *     tags:
 *       - Auth-airwallex-virtual-card routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: query
 *         name: card_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Airwallex virtual card ID
 *     responses:
 *       200:
 *         description: Card limit retrieved successfully
 */
router.get('/get-card-limit', async (req, res, next) => {
  const response = await VirtualCardController.getCardLimit({ headers: req.headers, user: req.user, payload: { ...req.body, ...req.query } });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/virtual-card/update-card-limit:
 *   post:
 *     summary: Update limit for a specific virtual card
 *     tags:
 *       - Auth-airwallex-virtual-card routes
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
 *               - cardId
 *             properties:
 *               cardId:
 *                 type: string
 *                 description: Virtual card ID
 *               PER_TRANSACTION:
 *                 type: number
 *                 description: Per transaction limit amount
 *               DAILY:
 *                 type: number
 *                 description: Daily limit amount
 *               WEEKLY:
 *                 type: number
 *                 description: Weekly limit amount
 *               MONTHLY:
 *                 type: number
 *                 description: Monthly limit amount
 *               ALL_TIME:
 *                 type: number
 *                 description: All time limit amount
 *     responses:
 *       200:
 *         description: Virtual card limit updated successfully
 */
router.post('/update-card-limit', async (req, res, next) => {
  const response = await VirtualCardController.updateCardLimit({ headers: req.headers, user: req.user, payload: req.body });
  res.return(response);
});


/**
 * @swagger
 * /api/auth/virtual-card/testing/create-transaction-for-the-provided-card:
 *   post:
 *     summary: Create a test transaction for the provided virtual card
 *     tags:
 *       - Auth-airwallex-virtual-card routes
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
 *               - card_number
 *               - transaction_amount
 *               - transaction_currency
 *               - merchant_category_code
 *               - merchant_info
 *             properties:
 *               card_number:
 *                 type: string
 *                 description: Card number used to simulate a transaction
 *                 example: 4466209407639646
 *               transaction_amount:
 *                 type: number
 *                 description: Transaction amount
 *                 example: 10
 *               transaction_currency:
 *                 type: string
 *                 description: ISO currency code for the transaction
 *                 example: USD
 *               merchant_category_code:
 *                 type: string
 *                 description: Merchant category code (MCC), for example Restaurants
 *                 example: '5812'
 *               merchant_info:
 *                 type: string
 *                 description: Merchant name or short description
 *                 example: Example
 *     responses:
 *       200:
 *         description: Test transaction created successfully
 */
router.post('/testing/create-transaction-for-the-provided-card', async (req, res, next) => {
  const response = await VirtualCardController.testingCreateTransactionForTheProvidedCard({ headers: req.headers, user: req.user, payload: req.body });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/virtual-card/card-transaction-list:
 *   get:
 *     summary: Get card transaction list for the authenticated user
 *     tags:
 *       - Auth-airwallex-virtual-card routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: query
 *         name: page_size
 *         required: false
 *         schema:
 *           type: integer
 *         description: Number of transactions per page
 *         example: 10
 *       - in: query
 *         name: page_number
 *         required: false
 *         schema:
 *           type: integer
 *         description: Page number for paginated transactions
 *         example: 1
 *     responses:
 *       200:
 *         description: Card transaction list fetched successfully
 */
router.get('/card-transaction-list', async (req, res, next) => {
  const response = await VirtualCardController.getCardTransactionList({ headers: req.headers, user: req.user, payload: {...req.body, ...req.params, ...req.query} });
  res.return(response);
});


/**
 * @swagger
 * /api/auth/virtual-card/user-get-card-transaction-list:
 *   get:
 *     summary: Get card transaction list for a specific user card
 *     tags:
 *       - Auth-airwallex-virtual-card routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Number of transactions to return per page
 *         example: 10
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: Page number for paginated transactions
 *         example: 1
 *       - in: query
 *         name: card_ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Array of Airwallex virtual card IDs
 *     responses:
 *       200:
 *         description: User card transaction list fetched successfully
 */
router.get('/user-get-card-transaction-list', async (req, res, next) => {
  const response = await VirtualCardController.getUserCardTransactionList({ headers: req.headers, user: req.user, payload: {...req.body, ...req.params, ...req.query} });
  res.return(response);
});
export default router;
