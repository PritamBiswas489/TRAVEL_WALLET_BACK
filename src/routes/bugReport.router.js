import "../config/environment.js";
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import BugController from "../controllers/bugReport.controller.js";

const router = express.Router();
const bugReportUploadPath = "uploads/bugReports";

if (!fs.existsSync(bugReportUploadPath)) {
    fs.mkdirSync(bugReportUploadPath, { recursive: true });
}

const bugReportUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, bugReportUploadPath),
        filename: (req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
            return;
        }
        cb(new Error("Only image files are allowed"));
    },
});




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


/**
 * @swagger
 * /api/auth/bug-reports/submit-bug-report:
 *   post:
 *     summary: Submit a bug report
 *     tags: [Bug Report routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               severityId:
 *                 type: integer
 *                 description: Bug severity level ID
 *                 example: 5
 *               placeId:
 *                 type: integer
 *                 description: Bug place ID
 *                 example: 1
 *               bugDescription:
 *                 type: string
 *                 description: Description of the bug
 *                 example: "demo bug description"
 *               bugReproduce:
 *                 type: string
 *                 description: Steps to reproduce the bug
 *                 example: "1. Click on login button 2. Enter invalid credentials 3. Application crashes"
 *               deviceInformation:
 *                 type: string
 *                 description: Device information where bug occurred
 *                 example: "iPhone 12, iOS 15.4, Safari 15.0"
 *               isBlocking:
 *                 type: boolean
 *                 description: Indicates if the bug is blocking
 *                 example: true
 *               attachment:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image attachments (up to 10 files, 10 MB each)
 *     responses:
 *       200:
 *         description: Bug report submitted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/submit-bug-report", bugReportUpload.array("attachment", 10), async (req, res, next) => {
    const response = await BugController.submitBugReport({
        headers: req.headers,
        user: req.user,
        payload: req.body,
        files: req.files,
    });
    res.return(response);
});



/**
 * @swagger
 * /api/auth/bug-reports/get-my-bug-reports:
 *   get:
 *     summary: Get my bug reports
 *     tags: [Bug Report routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved user's bug reports
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/get-my-bug-reports", async (req, res, next) => {
    const response = await BugController.getMyBugReports({ headers: req.headers, user: req.user, payload: { ...req.body, ...req.query } });
    res.return(response);
});



/**
 * @swagger
 * /api/auth/bug-reports/get-all-bug-reports:
 *   get:
 *     summary: Get all bug reports
 *     tags: [Bug Report routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved all bug reports
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/get-all-bug-reports", async (req, res, next) => {
    const response = await BugController.getAllBugReports({ headers: req.headers, user: req.user, payload: { ...req.body, ...req.query } });
    res.return(response);
});

export default router;