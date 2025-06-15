import "../config/environment.js";
import express from "express";
import { getProfileDetails, updatePin } from "../controllers/profile.controller.js";
import { updateProfile, updateProfileAvatar } from "../controllers/profile.controller.js";
import { upload } from "../controllers/uploadProfileImage.controller.js";
 
const router = express.Router();
/**
 * @swagger
 * /api/auth/profile/detail:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth-Profile routes]
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
     const profileDetails = await getProfileDetails({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
     return res.status(profileDetails.status).json(profileDetails);
});
/**
 * @swagger
 * /api/auth/profile/edit:
 *   put:
 *     summary: Edit user profile
 *     tags: [Auth-Profile routes]
 *     security:
 *       - bearerAuth: []
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
  const profileDetails = await updateProfile({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
  return res.status(profileDetails.status).json(profileDetails);
});
/**
 * @swagger
 * /api/auth/profile/upload-profile-image:
 *   post:
 *     summary: Upload user profile image
 *     tags: [Auth-Profile routes]
 *     security:
 *       - bearerAuth: []
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
   const profileDetails = await updateProfileAvatar({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user, file: req.file });
   return res.status(profileDetails.status).json(profileDetails);
})
/**
 * @swagger
 * /api/auth/profile/update-pin:
 *   put:
 *     summary: Update user pin
 *     tags: [Auth-Profile routes]
 *     security:
 *       - bearerAuth: []
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
  const response = await updatePin({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
  return res.status(response.status).json(response);
});

export default router;
