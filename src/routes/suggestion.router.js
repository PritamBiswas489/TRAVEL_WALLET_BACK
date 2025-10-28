import "../config/environment.js";
import express from "express";
import SuggestionController from "../controllers/suggestion.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/suggestion/get-suggestion-types:
 *   get:
 *     summary: Get suggestion types
 *     tags: [Suggestion routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Successfully retrieved suggestion types
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
router.get("/get-suggestion-types", async (req, res, next) => {
    const response = await SuggestionController.getSuggestionTypes({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});


/**
 * @swagger
 * /api/auth/suggestion/get-suggestion-priority-level:
 *   get:
 *     summary: Get suggestion priority levels
 *     tags: [Suggestion routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Successfully retrieved suggestion priority levels
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
router.get("/get-suggestion-priority-level", async (req, res, next) => {
    const response = await SuggestionController.getSuggestionPriorityLevels({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});


export default router;