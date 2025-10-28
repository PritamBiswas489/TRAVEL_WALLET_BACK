import "../config/environment.js";
import express from "express";
import BugController from "../controllers/bugReport.controller.js";

const router = express.Router();




/**
 * @swagger
 * /api/auth/bug-reports/get-bug-place:
 *   get:
 *     summary: Get bug places
 *     tags: [Bug Report routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Successfully retrieved bug places
 *       500:
 *         description: Internal server error
 */
router.get("/get-bug-place", async (req, res, next) => {
    const response = await BugController.getBugPlaces({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});

/**
 * @swagger
 * /api/auth/bug-reports/get-bug-severity:
 *   get:
 *     summary: Get bug severity levels
 *     tags: [Bug Report routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Successfully retrieved bug severity levels
 *       500:
 *         description: Internal server error
 */
router.get("/get-bug-severity", async (req, res, next) => {
    const response = await BugController.getBugSeverityLevels({ headers: req.headers, user: req.user, payload: req.body });
    res.return(response);
});

export default router;