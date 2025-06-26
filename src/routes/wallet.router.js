import '../config/environment.js';
import express from 'express';
import { default as WalletController } from '../controllers/wallet.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/wallet/user-wallet:
 *   get:
 *     summary: Get user wallet information
 *     tags:
 *       - Auth-Wallet routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Success - User wallet information retrieved
 */
router.get('/user-wallet', async (req, res, next) => {
  const response = await WalletController.getUserWallet({ headers: req.headers, user: req.user });
  res.return(response);
});


/**
 * @swagger
 * /api/auth/wallet/user-wallet-transaction-history:
 *   get:
 *     summary: Get user wallet transaction history
 *     tags:
 *       - Auth-Wallet routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Success - User wallet transaction history retrieved
 */
router.get('/user-wallet-transaction-history', async (req, res, next) => {
  const response = await WalletController.getUserWalletTransactionHistory({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
  res.return(response);
});



 
 


export default router;

