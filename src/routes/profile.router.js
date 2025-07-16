import "../config/environment.js";
import express from "express";
 
import ProfileController from "../controllers/profile.controller.js";
import { upload } from "../controllers/uploadProfileImage.controller.js";
 
const router = express.Router();
/**
 * @swagger
 * /api/auth/profile/detail:
 *   get:
 *     summary: Get user profile
 *     tags:
 *       - Auth-Profile routes
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Success - User profile retrieved
 */

router.get("/detail", async (req, res, next) => {
     const profileDetails = await ProfileController.getProfileDetails({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
     res.return(profileDetails);
});
/**
 * @swagger
 * /api/auth/profile/edit:
 *   put:
 *     summary: Edit user profile
 *     tags: [Auth-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 default: "John Doe"
 *               email:
 *                 type: string
 *                 default: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Success - User profile updated
 */

router.put("/edit", async (req, res, next) => {
  const profileDetails = await ProfileController.updateProfile({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
  res.return(profileDetails);
});
/**
 * @swagger
 * /api/auth/profile/upload-profile-image:
 *   post:
 *     summary: Upload user profile image
 *     tags: [Auth-Profile routes]
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
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Success - User profile image uploaded
 *       400:
 *         description: Bad Request - Invalid file type or size
 */
router.post("/upload-profile-image", upload.single("image"), async (req, res) => {
   const profileDetails = await ProfileController.updateProfileAvatar({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user, file: req.file });
   res.return(profileDetails);
})
/**
 * @swagger
 * /api/auth/profile/update-pin:
 *   put:
 *     summary: Update user pin
 *     tags: [Auth-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               existingPinCode:
 *                 type: string
 *                 description: The existing pin code to verify before updating
 *                 example: "1234"
 *               pinCode:
 *                 type: string
 *                 description: The new pin code to set
 *                 example: "5678"
 *     responses:
 *       200:
 *         description: Success - User pin updated
 */

router.put("/update-pin", async (req, res) => {
  const response = await ProfileController.updatePin({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});
/**
 * @swagger
 * /api/auth/profile/save-fcm-token:
 *   post:
 *     summary: Save user's mobile FCM token
 *     tags: [Auth-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: The FCM token to register/update
 *                 example: "fcm_token_example_123"
 *     responses:
 *       200:
 *         description: Success - FCM token updated
 */
router.post("/save-fcm-token", async (req, res) => {
  const response = await ProfileController.saveFcmToken({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
  res.return(response);
});
/**
 * @swagger
 * /api/auth/profile/delete:
 *   delete:
 *     summary: Remove user account
 *     tags: [Auth-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Success - User account deleted
 */
router.delete("/delete", async (req, res) => {
  const response = await ProfileController.removeAccount({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});


export default router;
