import '../config/environment.js';
import express from 'express';

import AirwallexDirectBankTransferController from '../controllers/airwallexDirectBankTransfer.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/airwallex-direct-bank-transfer/beneficiary-form-schemas:
 *   post:
 *     summary: Generate Airwallex beneficiary form schema
 *     tags: [Auth-airwallex-direct-bank-transfer routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - bank_country_code
 *               - account_currency
 *               - entity_type
 *               - type
 *             properties:
 *               bank_country_code:
 *                 type: string
 *                 description: ISO 3166-1 alpha-2 bank country code
 *                 example: TH
 *               account_currency:
 *                 type: string
 *                 description: ISO 4217 account currency code
 *                 example: THB
 *               entity_type:
 *                 type: string
 *                 description: Beneficiary entity type
 *                 enum: [PERSONAL, COMPANY]
 *                 example: PERSONAL
 *               type:
 *                 type: string
 *                 description: Beneficiary type
 *                 enum: [BANK_ACCOUNT]
 *                 example: BANK_ACCOUNT
 *               transfer_method:
 *                 type: string
 *                 description: Transfer method type
 *                 enum: [LOCAL, SWIFT]
 *                 example: LOCAL
 *     responses:
 *       200:
 *         description: Beneficiary form schema generated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/beneficiary-form-schemas',async (req, res, next) => {
    const response = await AirwallexDirectBankTransferController.beneficiaryFormSchemasGenerate({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});

/**
 * @swagger
 * /api/auth/airwallex-direct-bank-transfer/supported-financial-institutions:
 *   get:
 *     summary: Get supported financial institutions
 *     tags: [Auth-airwallex-direct-bank-transfer routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: query
 *         name: bank_country_code
 *         schema:
 *           type: string
 *         required: true
 *         description: Bank country code (2-letter ISO 3166-2 country code)
 *         example: TH
 *       - in: query
 *         name: account_currency
 *         schema:
 *           type: string
 *         required: true
 *         description: ISO 4217 account currency code
 *         example: THB
 *       - in: query
 *         name: entity_type
 *         schema:
 *           type: string
 *           enum: [PERSONAL, COMPANY]
 *         required: true
 *         description: Entity type of the beneficiary
 *         example: PERSONAL
 *       - in: query
 *         name: transfer_method
 *         schema:
 *           type: string
 *           enum: [LOCAL, SWIFT]
 *         required: true
 *         description: Transfer method (LOCAL for local transfers, SWIFT for international transfers)
 *         example: LOCAL
 *     responses:
 *       200:
 *         description: List of supported financial institutions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       institution_code:
 *                         type: string
 *                         description: Unique identifier for the financial institution
 *                       institution_name:
 *                         type: string
 *                         description: Name of the financial institution
 *                       country_code:
 *                         type: string
 *                         description: Country code where the institution operates
 *                       bic_code:
 *                         type: string
 *                         description: BIC/SWIFT code for the institution
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request - missing or invalid parameters
 */
router.get('/supported-financial-institutions',async (req, res, next) => {
    const response = await AirwallexDirectBankTransferController.supportedFinancialInstitutions({ headers: req.headers, user: req.user, query: req.query });
    res.return(response);
});

/**
 * @swagger
 * /api/auth/airwallex-direct-bank-transfer/create-beneficiary:
 *   post:
 *     summary: Create a new beneficiary
 *     tags: [Auth-airwallex-direct-bank-transfer routes]
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
 *               - beneficiary
 *               - nickname
 *               - transfer_methods
 *             properties:
 *               beneficiary:
 *                 type: object
 *                 required:
 *                   - entity_type
 *                   - type
 *                   - date_of_birth
 *                   - first_name
 *                   - last_name
 *                   - address
 *                   - additional_info
 *                   - bank_details
 *                 properties:
 *                   entity_type:
 *                     type: string
 *                     enum: [PERSONAL, COMPANY]
 *                     description: Type of beneficiary entity
 *                     example: PERSONAL
 *                   type:
 *                     type: string
 *                     description: Beneficiary account type
 *                     example: BANK_ACCOUNT
 *                   date_of_birth:
 *                     type: string
 *                     format: date
 *                     description: Date of birth (YYYY-MM-DD)
 *                     example: "1976-08-26"
 *                   first_name:
 *                     type: string
 *                     description: Beneficiary first name
 *                     example: John
 *                   last_name:
 *                     type: string
 *                     description: Beneficiary last name
 *                     example: Walker
 *                   address:
 *                     type: object
 *                     required:
 *                       - street_address
 *                       - city
 *                       - postcode
 *                       - country_code
 *                     properties:
 *                       street_address:
 *                         type: string
 *                         description: Street address
 *                         example: "38 Chengtu Rd"
 *                       city:
 *                         type: string
 *                         description: City name
 *                         example: "Hong Kong"
 *                       state:
 *                         type: string
 *                         description: State or province
 *                         example: "Hong Kong"
 *                       postcode:
 *                         type: string
 *                         description: Postal code
 *                         example: "3000"
 *                       country_code:
 *                         type: string
 *                         description: ISO 3166-1 alpha-2 country code
 *                         example: "HK"
 *                   additional_info:
 *                     type: object
 *                     properties:
 *                       personal_email:
 *                         type: string
 *                         format: email
 *                         description: Beneficiary email address
 *                         example: "john.walker@gmail.com"
 *                       nickname:
 *                         type: string
 *                         description: Nickname for the beneficiary
 *                   bank_details:
 *                     type: object
 *                     required:
 *                       - account_name
 *                       - account_number
 *                       - account_currency
 *                       - bank_country_code
 *                     properties:
 *                       account_name:
 *                         type: string
 *                         description: Account holder name
 *                         example: "John Walker"
 *                       account_number:
 *                         type: string
 *                         description: Bank account number or IBAN
 *                         example: "786005728434"
 *                       account_currency:
 *                         type: string
 *                         description: ISO 4217 currency code
 *                         example: "USD"
 *                       bank_country_code:
 *                         type: string
 *                         description: ISO 3166-1 alpha-2 bank country code
 *                         example: "HK"
 *                       swift_code:
 *                         type: string
 *                         description: SWIFT/BIC code (required for SWIFT transfers)
 *                         example: "HASEHKHH"
 *               nickname:
 *                 type: string
 *                 description: Beneficiary nickname for easy identification
 *                 example: "John Walker"
 *               transfer_methods:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [LOCAL, SWIFT]
 *                 description: Supported transfer methods for this beneficiary
 *                 example: ["SWIFT"]
 *     responses:
 *       200:
 *         description: Beneficiary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   description: Created beneficiary details
 *                 message:
 *                   type: string
 *                   example: "Beneficiary created successfully"
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/create-beneficiary', async (req, res, next) => {
    const response = await AirwallexDirectBankTransferController.createBeneficiary({ payload: req.body, user: req.user, headers: req.headers, });
    res.return(response);
});

/**
 * @swagger
 * /api/auth/airwallex-direct-bank-transfer/beneficiaries:
 *   get:
 *     summary: List beneficiaries of the authenticated user
 *     tags: [Auth-airwallex-direct-bank-transfer routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-based)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of beneficiaries per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Paginated list of beneficiaries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     beneficiaries:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                 message:
 *                   type: string
 *                   example: "Beneficiaries fetched successfully"
 *       401:
 *         description: Unauthorized
 */
router.get('/beneficiaries', async (req, res, next) => {
    const response = await AirwallexDirectBankTransferController.getBeneficiaries({ query: req.query, user: req.user, headers: req.headers });
    res.return(response);
});


export default router;