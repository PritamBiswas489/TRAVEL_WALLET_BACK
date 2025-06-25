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


 
 


export default router;

