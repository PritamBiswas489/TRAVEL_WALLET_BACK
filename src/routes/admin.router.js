import '../config/environment.js';
import express from 'express';
import AdminSettingsController from '../controllers/admin.settings.controller.js';
import AdminController from '../controllers/admin.controller.js';
const router = express.Router();
/**
 * @swagger
 * /api/admin/update-settings:
 *   post:
 *     summary: Bulk update admin settings
 *     tags:
 *       - Admin routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                   example: site_name
 *                 value:
 *                   type: string
 *                   example: My Website
 *     responses:
 *       200:
 *         description: Success - Admin settings updated
 */

router.post('/update-settings', async (req, res, next) => {
    res.return(await AdminSettingsController.updateSettings({
        payload: { ...req.params, ...req.query, ...req.body },
        headers: req.headers,
        user: req.user,
    }));
});

/**
 * @swagger
 * /api/admin/all-settings:
 *   get:
 *     summary: Get all admin settings
 *     tags:
 *       - Admin routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Success - Retrieved all admin settings
 */
router.get('/all-settings', async (req, res, next) => {
    res.return(await AdminSettingsController.getAllSettings({
        payload: { ...req.params, ...req.query, ...req.body },
        headers: req.headers,
        user: req.user,
    }));

});
/**
 * @swagger
 * /api/admin/get-setting-by-key:
 *   get:
 *     summary: Get admin setting by key
 *     tags:
 *       - Admin routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *           example: some_key
 *     responses:
 *       200:
 *         description: Success - Admin setting retrieved
 *       400:
 *         description: Bad Request - Missing or invalid key
 *       500:
 *         description: Internal Server Error
 */
router.get("/get-setting-by-key", async (req, res, next) => {
     res.return(await AdminSettingsController.getSettingByKey({
        payload: { ...req.params, ...req.query, ...req.body },
        headers: req.headers,
        user: req.user,
    }));
});
/**
 * @swagger
 * /api/admin/get-installment-payment-interest-rates:
 *   get:
 *     summary: Get installment payment interest rates
 *     tags:
 *       - Admin routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Success - Retrieved installment payment interest rates
 *       500:
 *         description: Internal Server Error
 */
router.get("/get-installment-payment-interest-rates", async (req, res, next) => {
    res.return(await AdminController.getInstallmentPaymentInterestRates({
        payload: { ...req.params, ...req.query, ...req.body },
        headers: req.headers,
        user: req.user,
    }));
});
/**
 * @swagger
 * /api/admin/add-installment-payment-interest-rates:
 *   post:
 *     summary: Add installment payment interest rates
 *     tags:
 *       - Admin routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 payment_number:
 *                   type: integer
 *                   default: 2
 *                   example: 2
 *                 interest_rate:
 *                   type: number
 *                   format: float
 *                   default: 2.5
 *                   example: 2.5
 *     responses:
 *       200:
 *         description: Success - Installment payment interest rates added
 *       400:
 *         description: Bad Request - Invalid input
 *       500:
 *         description: Internal Server Error
 */
router.post("/add-installment-payment-interest-rates", async (req, res, next) => {
    res.return(await AdminController.addInstallmentPaymentInterestRates({
        payload: { ...req.params, ...req.query, ...req.body },
        headers: req.headers,
        user: req.user,
    }));
});

export default router;