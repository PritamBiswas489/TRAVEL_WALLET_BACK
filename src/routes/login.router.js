import "../config/environment.js";
import express from "express";
import { sendOtpToMobileNumber } from "../controllers/login.controller.js";
import { createOrVerifyPinByPhoneNumber } from "../controllers/login.controller.js";
const router = express.Router();


/**
 * @swagger
 * /api/front/login/send-otp:
 *   post:
 *     summary: Send OTP for login
 *     tags: 
 *       - Login routes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 required: true
 *                 default: "+919830990065"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post("/send-otp", async (req, res) => {
  res.send(await sendOtpToMobileNumber({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers }));
});

/**
 * @swagger
 * /api/front/login/create-verify-pin-by-phone-number:
 *   post:
 *     summary: Get user by phone number and pin code
 *     tags: 
 *       - Login routes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 required: true
 *                 default: "+919830990065"
 *               pinCode:
 *                 type: string
 *                 required: true
 *                 default: "1234"
 *     responses:
 *       200:
 *         description: User retrieved successfully
 */
router.post("/create-verify-pin-by-phone-number", async (req, res) => {
   res.send(await createOrVerifyPinByPhoneNumber({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers }));
});
export default router;
