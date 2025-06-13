import "../config/environment.js";
import express from "express";
import { getProfileDetails } from "../controllers/profile.controller.js";
const router = express.Router();
/**
 * @swagger
 * /api/auth/profile/detail:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth/Profile routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Success - User profile retrieved
 */
router.get("/detail", async (req, res, next) => {
     res.send(await getProfileDetails({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user }));
});

export default router;
