import '../config/environment.js';
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { default as depositController } from '../controllers/deposit.controller.js';
import { default as AirwallexPaymentController } from '../controllers/airwallexPayment.controller.js';

const KYC_UPLOAD_PATH = 'uploads/airWallexKyc';
if (!fs.existsSync(KYC_UPLOAD_PATH)) {
  fs.mkdirSync(KYC_UPLOAD_PATH, { recursive: true, mode: 0o777 });
}

const kycUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, KYC_UPLOAD_PATH),
    filename: (req, file, cb) => cb(null, Date.now() + '_' + file.fieldname + path.extname(file.originalname))
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(file.originalname.split('.').pop().toLowerCase());
    const mime = /image\/(jpeg|png)|application\/pdf/.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only JPEG, PNG, or PDF files are allowed'));
  }
}).fields([
  { name: 'identificationFrontImage', maxCount: 1 },
  { name: 'identificationBackImage', maxCount: 1 },
  { name: 'proofOfAddressImage', maxCount: 1 }
]);

const router = express.Router();

/**
 * @swagger
 * /api/auth/deposit/pelecard-payment-add-card-and-card-token:
 *   post:
 *     summary: Add new Card In pelecard payment gateway
 *     tags: [Auth-Deposit routes]
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
 *               - cardholderName
 *               - cardNumber
 *               - creditCardDateMmYy
 *               - cvv
 *             properties:
 *               cardholderName:
 *                 type: string
 *                 default: "John Doe"
 *               cardNumber:
 *                 type: string
 *                 default: "5326105302332708"
 *               creditCardDateMmYy:
 *                 type: string
 *                 default: "02/26"
 *               cvv:
 *                 type: string
 *                 default: "773"
 *     responses:
 *       200:
 *         description: Success - Card added successfully
 */
router.post('/pelecard-payment-add-card-and-card-token', async (req, res, next) => {
  const response = await depositController.peleCardPaymentConvertToToken({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});


/**
 * @swagger
 * /api/auth/deposit/crypto/pelecard-payment-add-card-and-card-token:
 *   post:
 *     summary: Add new Card In pelecard payment gateway (Crypto envelope)
 *     tags: [Auth-Deposit routes]
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
 *               - envelope
 *               - sig
 *             properties:
 *               envelope:
 *                 type: object
 *                 default: {}
 *               sig:
 *                 type: string
 *                 default: "string"
 *     responses:
 *       200:
 *         description: Success - Card added successfully
 */
router.post('/crypto/pelecard-payment-add-card-and-card-token', async (req, res, next) => {
  const response = await depositController.cryptoPeleCardPaymentConvertToToken({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});


/**
 * @swagger
 * /api/auth/deposit/set-default-card:
 *   post:
 *     summary: Set a card as the default card
 *     tags:
 *       - Auth-Deposit routes
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
 *                 default: "1"
 *                 description: ID of the card to set as default
 *     responses:
 *       200:
 *         description: Success - Card set as default
 */
router.post('/set-default-card', async (req, res, next) => {
  const response = await depositController.setDefaultCard({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/deposit/get-default-card:
 *   get:
 *     summary: Get the default card for the user
 *     tags:
 *       - Auth-Deposit routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Success - Default card retrieved
 */
router.get('/get-default-card', async (req, res, next) => {
  const response = await depositController.getDefaultCard({ headers: req.headers, user: req.user });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/deposit/pelecard-user-card-list:
 *   get:
 *     summary: Get list of user cards in Pelecard payment gateway
 *     tags:
 *       - Auth-Deposit routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Success - User card list retrieved
 */
router.get('/pelecard-user-card-list', async (req, res, next) => {
  const response = await depositController.getPeleCardUserCardList({ headers: req.headers, user: req.user });
  res.return(response);
});


/**
 * @swagger
 * /api/auth/deposit/crypto/pelecard-user-card-list:
 *   get:
 *     summary: Get list of user cards in Pelecard payment gateway
 *     tags:
 *       - Auth-Deposit routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Success - User card list retrieved
 */
router.get('/crypto/pelecard-user-card-list', async (req, res, next) => {
  const response = await depositController.getPeleCryptoCardUserCardList({ headers: req.headers, user: req.user });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/deposit/calculate-payment-amount:
 *   post:
 *     summary:  Calculate payment amount 
 *     tags:
 *       - Auth-Deposit routes
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
 *               amount:
 *                 type: number
 *                 example: 100
 *               number_of_payment:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Success -  Payment made and added to wallet
 */

router.post('/calculate-payment-amount', async (req, res, next) => {
  const response = await depositController.calculatePaymentAmount({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
  res.return(response);
});



/**
 * @swagger
 * /api/auth/deposit/calculate-installment-payment-amount:
 *   post:
 *     summary: Calculate installment payment amount
 *     tags:
 *       - Auth-Deposit routes
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
 *               amount:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: Success - Installment payment amount calculated
 */
router.post('/calculate-installment-payment-amount', async (req, res, next) => {
  const response = await depositController.calculateInstallmentPaymentAmount({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/deposit/pelecard-make-payment-add-to-wallet:
 *   post:
 *     summary: Make payment and add to wallet using Pelecard
 *     tags:
 *       - Auth-Deposit routes
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
 *               amount:
 *                 type: number
 *                 example: 100
 *               fromCurrency:
 *                 type: string
 *                 example: ILS
 *               cardToken:
 *                 type: string 
 *                 example: 4206129454
 *               number_of_payment:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Success -  Payment made and added to wallet
 */
router.post('/pelecard-make-payment-add-to-wallet', async (req, res, next) => {
  const response = await depositController.makePaymentAddToWallet({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});



/**
 * @swagger
 * /api/auth/deposit/crypto/pelecard-make-payment-add-to-wallet:
 *   post:
 *     summary: Make crypto payment and add to wallet using Pelecard
 *     tags:
 *       - Auth-Deposit routes
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
 *               - envelope
 *               - sig
 *             properties:
 *               envelope:
 *                 type: object
 *                 default: {}
 *               sig:
 *                 type: string
 *                 default: "string"
 *     responses:
 *       200:
 *         description: Success - Crypto payment made and added to wallet
 */
router.post('/crypto/pelecard-make-payment-add-to-wallet', async (req, res, next) => {
  const response = await depositController.makeCryptoPaymentAddToWallet({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});


 

/**
 * @swagger
 * /api/auth/deposit/pelecard-user-card-delete/{cardId}:
 *   delete:
 *     summary: Remove user card from Pelecard payment gateway
 *     tags:
 *       - Auth-Deposit routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the card to delete
 *     responses:
 *       200:
 *         description: Success - User card deleted
 */
router.delete("/pelecard-user-card-delete/:cardId", async (req, res) => {
  const response = await depositController.removeUserCard({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});


/**
 * @swagger
 * /api/auth/deposit/airwallex-create-customer-account:
 *   post:
 *     summary: Create customer account in Airwallex
 *     tags:
 *       - Auth-airwallex-kyc routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: {}
 *     responses:
 *       200:
 *         description: Success - Customer account created
 */
router.post('/airwallex-create-customer-account', async (req, res) => {
   const response = await AirwallexPaymentController.airWallexCreateCustomerAccount({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});


/**
 * @swagger
 * /api/auth/deposit/get-and-update-airwallex-customer-account:
 *   post:
 *     summary: Update Airwallex KYC account details for the authenticated user
 *     tags:
 *       - Auth-airwallex-kyc routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Success - Airwallex customer account details updated
 */
router.post('/get-and-update-airwallex-customer-account', async (req, res) => {
   const response = await AirwallexPaymentController.getAndUpdateAirWallexCustomerAccount({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});






/**
 * @swagger
 * /api/auth/deposit/airwallex-authorize-account/{accountId}:
 *   get:
 *     summary: Authorize an Airwallex account
 *     tags:
 *       - Auth-Deposit-airwallex routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Airwallex account ID to authorize
 *     responses:
 *       200:
 *         description: Success - Account authorized
 */
router.get('/airwallex-authorize-account/:accountId', async (req, res) => {
   const response = await AirwallexPaymentController.airWallexAuthorizeAccount({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});

/**
 * @swagger
 * /api/auth/deposit/airwallex-get-request-id-merchant-id:
 *   post:
 *     summary: Get request ID and merchant ID from Airwallex
 *     tags:
 *       - Auth-Deposit-airwallex routes
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
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: Success - Request ID and merchant ID retrieved
 */
router.post('/airwallex-get-request-id-merchant-id', async (req, res) => {
  const response = await AirwallexPaymentController.createMerchantOrderIdRequestId({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
})

/**
 * @swagger
 * /api/auth/deposit/airwallex-submit-kyc-documents:
 *   post:
 *     summary: Submit KYC documents for Airwallex account verification
 *     tags:
 *       - Auth-airwallex-kyc routes
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
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               dateOfBirth:
 *                 type: string
 *                 example: "1990-01-01"
 *               nationality:
 *                 type: string
 *                 enum:
 *                   - IL
 *                 description: "Country code (IL = Israel)"
 *                 example: IL
 *               address:
 *                 type: string
 *                 example: "123 Main Street"
 *               country:
 *                 type: string
 *                 enum:
 *                   - IL
 *                 description: "Country code (IL = Israel)"
 *                 example: IL
 *               postCode:
 *                 type: string
 *                 example: "12345"
 *               state:
 *                 type: string
 *                 example: "Tel Aviv District"
 *               suburb:
 *                 type: string
 *                 example: "Tel Aviv"
 *               identificationType:
 *                 type: string
 *                 enum:
 *                   - PERSONAL_ID
 *                   - DRIVERS_LICENSE
 *                   - PASSPORT
 *                 example: PERSONAL_ID
 *               identificationFrontImage:
 *                 type: string
 *                 format: binary
 *                 description: Front image of the identification document
 *               identificationBackImage:
 *                 type: string
 *                 format: binary
 *                 description: Back image of the identification document
 *               proofOfAddressImage:
 *                 type: string
 *                 format: binary
 *                 description: Proof of address document image
 *               cardUsage:
 *                 type: array
 *                 description: "Ways in which the account will use Airwallex borderless cards."
 *                 items:
 *                   type: string
 *                   enum:
 *                     - GENERAL_EXPENSES
 *                     - BUSINESS_EXPENSES
 *                     - EDUCATION
 *                     - TRAVEL_TRANSPORT
 *                     - INSURANCE
 *                     - SERVICES
 *                     - BILLS_UTILITIES
 *                     - INVESTMENT
 *                     - FEES_CHARGES
 *                     - HEALTHCARE
 *                     - HOUSING
 *                     - NO_CARD_USAGE
 *                 example:
 *                   - GENERAL_EXPENSES
 *               collectionCountryCode:
 *                 type: array
 *                 description: "Countries from which the account will be collecting funds. (2-letter ISO 3166-2 country code)"
 *                 items:
 *                   type: string
 *                   enum:
 *                     - IL
 *                 example:
 *                   - IL
 *               collectionFrom:
 *                 type: array
 *                 description: "Sources and counterparties from which the account will be collecting funds."
 *                 items:
 *                   type: string
 *                   enum:
 *                     - ALLOWANCE_FROM_FAMILY
 *                     - BENEFITS_FROM_STATE
 *                     - EMPLOYMENT_INCOME
 *                     - INVESTMENT_INCOME_NONPROPERTY
 *                     - INCOME_FROM_PROPERTY
 *                     - INCOME_FROM_MARKETPLLACES
 *                     - INSURANCE
 *                     - LOANS
 *                     - SAVINGS
 *                     - OTHER_THIRD_PARTIES
 *                     - PAYMENT_REFUNDS
 *                 example:
 *                   - EMPLOYMENT_INCOME
 *               payoutCountryCodes:
 *                 type: array
 *                 description: "Countries to which the account will be paying funds. (2-letter ISO 3166-2 country code)"
 *                 items:
 *                   type: string
 *                   enum:
 *                     - IL
 *                 example:
 *                   - IL
 *               payoutTo:
 *                 type: array
 *                 description: "Beneficiaries and counterparties to which the account will be paying funds."
 *                 items:
 *                   type: string
 *                   enum:
 *                     - CONNECTED_AWX_ACCOUNT
 *                     - EDUCATIONAL_INSTITUTIONS
 *                     - FRIENDS_OR_RELATIVES
 *                     - MARKETPLACE_PLATFORM
 *                     - MARKETPLACE_SELLERS
 *                     - MOBILITY_PLATFORM
 *                     - OTHER_THIRD_PARTY_INDIVIDUALS
 *                     - OWN_BANK_ACCOUNT
 *                     - OTHER_THIRD_PARTY_BUSINESSES
 *                     - SECURITIES_BROKERS
 *                 example:
 *                   - OWN_BANK_ACCOUNT
 *               productReference:
 *                 type: array
 *                 description: "Intended product usage."
 *                 items:
 *                   type: string
 *                   enum:
 *                     - CREATE_CARDS
 *                     - MAKE_TRANSFERS
 *                     - MARKETPLACE_WALLET
 *                     - MOBILITY_WALLET
 *                     - OTHERS
 *                     - PAYROLL_WALLET
 *                     - RECEIVE_TRANSFERS
 *                     - TRADE_SECURITIES
 *                     - TUITION_PAYMENTS
 *                 example:
 *                   - MAKE_TRANSFERS
 *                   - RECEIVE_TRANSFERS
 *               monthlyTransactionVolumeCurrency:
 *                 type: string
 *                 enum:
 *                   - ILS
 *                   - USD
 *                   - EUR
 *                 description: "Currency of the monthly transaction volume. (3-letter ISO 4217 currency code)"
 *                 default: ILS
 *                 example: ILS
 *               monthlyTransactionVolumeAmount:
 *                 type: number
 *                 format: float
 *                 description: "Estimate of the expected amount of money to be collected or paid out each month."
 *                 default: 5000
 *                 example: 5000
 *               hasMemberHoldingPublicOffice:
 *                 type: string
 *                 enum:
 *                   - "YES"
 *                   - "NO"
 *                 description: "Whether the customer, close family member, or business partner holds public office in Israel or abroad."
 *                 example: "NO"
 *               hasPriorFinancialInstitutionRefusal:
 *                 type: string
 *                 enum:
 *                   - "YES"
 *                   - "NO"
 *                 description: "Whether the customer has had previous refusals to receive service from a financial institution due to ML/TF concerns."
 *                 default: "NO"
 *                 example: "NO"
 *               resubmit:
 *                 type: boolean
 *                 description: "Set to true to resubmit KYC documents for an existing account (skips account creation)."
 *                 default: false
 *                 example: false
 *     responses:
 *       200:
 *         description: Success - KYC documents submitted successfully
 */
router.post('/airwallex-submit-kyc-documents', kycUpload, async (req, res) => {
  const files = req.files
    ? Object.fromEntries(Object.entries(req.files).map(([key, arr]) => [key, arr[0]]))
    : {};
  const response = await AirwallexPaymentController.airwallexSubmitKycDocuments({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user, files });
  res.return(response);
});


router.post('/airwallex-create-webhook-endpoint-for-kyc', async (req, res) => {
   const response = await AirwallexPaymentController.airwallexCreateWebhookEndpointForKyc({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});
 

export default router;

