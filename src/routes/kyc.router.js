import '../config/environment.js';
import express from 'express';
import KycController from '../controllers/kyc.controller.js';

const router = express.Router();
/**
 * @swagger
 * /api/kyc/get-access-token:
 *   get:
 *     summary: Get access token for KYC
 *     description: Retrieves an access token required for KYC operations.
 *     tags:
 *       - Auth-KYC
 *     responses:
 *       200:
 *         description: Access token retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/get-access-token', async (req, res, next) => {
  const response = await KycController.getAccessToken({ headers: req.headers, user: req.user });
  res.return(response);
});
export default router;