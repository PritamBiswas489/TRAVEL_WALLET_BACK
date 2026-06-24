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
  const escapeHtml = (value = '') => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const htmlBody = typeof response === 'string'
    ? response
    : `<pre>${escapeHtml(JSON.stringify(response, null, 2))}</pre>`;
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Card Details</title>
  </head>
  <body>
    ${htmlBody}
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
});

export default router;