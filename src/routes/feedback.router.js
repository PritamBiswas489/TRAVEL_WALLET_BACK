import "../config/environment.js";
import express from "express";
import FeedbackController from "../controllers/feedback.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/feedback/get-feedback-categories:
 *   get:
 *     summary: Get feedback categories
 *     tags: [Feedback routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Successfully retrieved feedback categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/get-feedback-categories", async (req, res, next) => {
    const response = await FeedbackController.getFeedbackCategory({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});


export default router;