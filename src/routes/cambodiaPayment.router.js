import '../config/environment.js';
import express from 'express';
import CambodiaPaymentController from '../controllers/cambodiaPayment.controller.js';
const router = express.Router();



/**
 * @swagger
 *  /api/auth/kesspay/token:
 *   get:
 *     summary: Get KessPay API token
 *     tags:
 *       - Cambodia Payment
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Token retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid request
 */
router.get('/token', async (req, res, next) => {
    const response = await CambodiaPaymentController.getToken();
    res.return(response);
});



export default router;
