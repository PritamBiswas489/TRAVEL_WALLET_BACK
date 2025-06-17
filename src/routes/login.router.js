import "../config/environment.js";
import express from "express";
import { sendOtpToMobileNumber } from "../controllers/login.controller.js";
import { createOrVerifyPinByPhoneNumber, updatePinByPhoneNumber } from "../controllers/login.controller.js";
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
 *               messageType:
 *                type: string
 *                required: true
 *                enum: ["whatsapp", "sms"]
 *                default: "whatsapp"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post("/send-otp", async (req, res) => {
  const response = await sendOtpToMobileNumber({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response);
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
   const response = await createOrVerifyPinByPhoneNumber({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
   res.return(response)
});
/**
 * @swagger
 * /api/front/login/update-pin-by-phone-number:
 *   post:
 *     summary: Update pin by phone number
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
 *         description: Pin updated successfully
 */
router.post("/update-pin-by-phone-number", async (req, res) => {
  const response = await updatePinByPhoneNumber({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers });
  res.return(response)
});
export default router;
