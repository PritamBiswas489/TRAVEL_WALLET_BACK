import '../config/environment.js';
import express from 'express';
import AdminSettingsController from '../controllers/admin.settings.controller.js';
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

export default router;