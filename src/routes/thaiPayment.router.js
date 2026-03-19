import '../config/environment.js';
import express from 'express';
import ThaiPaymentController from '../controllers/thaiPaymentController.controller.js';
 
const router = express.Router();

/**
 * @swagger
 *  /api/auth/ipps/validate-qr-code:
 *   post:
 *     summary: Validate Thai Payment QR code
 *     tags:
 *       - Thai Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qrCode:
 *                 type: string
 *                 description: QR code string for validation
 *                 example: "00020101021230820016A0000006770101120115010753600037405021500000220066077703204611316260181X00000053037645406178.225802TH5918LIMTRENDEMPORIUM6212070846113162630427E5"
 *             required:
 *               - qrCode
 *     responses:
 *       200:
 *         description: QR code validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 */
router.post('/validate-qr-code', async (req, res) => {
    console.log("Received QR code validation request:", req.body);
     const response = await ThaiPaymentController.validateQrCode({ headers: req.headers, user: req.user, payload: req.body });
     res.json(response);
});

export default router;