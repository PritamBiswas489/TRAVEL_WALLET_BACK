import '../config/environment.js';
import express from 'express';
import VietnamPaymentController from '../controllers/vietnamPayment.controller.js';
const router = express.Router();


/**
 * @swagger
 *  /api/auth/ninePay/decode-qr-code:
 *   post:
 *     summary: Validate NinePay transaction via QR code
 *     tags:
 *       - Vietnam Payment
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
 *               qrCode:
 *                 type: string
 *                 description: QR code string for transaction validation
 *             required:
 *               - qrCode
 *     responses:
 *       200:
 *         description: Transaction validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request
 */
router.post('/decode-qr-code', async (req, res, next) => {
    const response = await VietnamPaymentController.decodeQrCode({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});

export default router;
