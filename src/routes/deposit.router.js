import '../config/environment.js';
import express from 'express';
import { default as depositController } from '../controllers/deposit.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/deposit/pelecard-payment-add-card-and-card-token:
 *   post:
 *     summary: Add new Card In pelecard payment gateway
 *     tags: [Auth-Deposit routes]
 *     security:
 *       - bearerAuth: []
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
 * /api/auth/deposit/pelecard-user-card-list:
 *   get:
 *     summary: Get list of user cards in Pelecard payment gateway
 *     tags:
 *       - Auth-Deposit routes
 *     security:
 *       - bearerAuth: []
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
 * /api/auth/deposit/pelecard-make-payment-add-to-wallet:
 *   post:
 *     summary: Make payment and add to wallet using Pelecard
 *     tags:
 *       - Auth-Deposit routes
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
 *                type:  string 
 *                example: 4206129454
 *               cvv2:
 *                type: string
 *                example: "773" 
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
 * /api/auth/deposit/pelecard-user-card-delete/{cardId}:
 *   delete:
 *     summary: Remove user card from Pelecard payment gateway
 *     tags:
 *       - Auth-Deposit routes
 *     security:
 *       - bearerAuth: []
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

 


export default router;

