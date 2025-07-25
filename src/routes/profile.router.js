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
 *               address:
 *                 type: string
 *                 default: "123 Main St, City, Country"
 *               dob:
 *                 type: string
 *                 default: "1990-01-01"
 *               language:
 *                 type: string
 *                 default: "he"
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
 * /api/auth/profile/send-push-notification:
 *   post:
 *     summary: Send push notification to connected mobile via firebase
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
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Hi from Travel Wallet"
 *               body:
 *                 type: string
 *                 example: "Dummy push notification for testing purposes.Ignore it."
 *     responses:
 *       200:
 *         description: Success - JSON received
 */
router.post("/send-push-notification", async (req, res) => {
   const response = await ProfileController.sendPushNotification({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
})

/**
 * @swagger
 * /api/auth/profile/get-notifications:
 *   post:
 *     summary: Get paginated list of user notifications
 *     tags: [Auth-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Maximum number of notifications to return
 *               page:
 *                 type: integer
 *                 default: 1
 *                 minimum: 1
 *                 description: Page number to return
 *     responses:
 *       200:
 *         description: Success - Paginated user notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 profiles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Profile'
 */

router.post("/get-notifications", async (req, res) => {
   const response = await ProfileController.getUserNotifications({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});


/**
 * @swagger
 * /api/auth/profile/mark-notification-as-read:
 *   post:
 *     summary: Mark a notification as read
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
 *               notificationId:
 *                 type: string
 *                 description: The ID of the notification to mark as read
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Success - Notification marked as read
 */
router.post("/mark-notification-as-read", async (req, res) => {
   const response = await ProfileController.markNotificationAsRead({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
});
/**
 * @swagger
 * /api/auth/profile/mark-all-notifications-as-read:
 *   post:
 *     summary: Mark all notifications as read for the user
 *     tags: [Auth-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Success - All notifications marked as read
 */
router.post("/mark-all-notifications-as-read", async (req, res) => {
   const response = await ProfileController.markAllNotificationsAsRead({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);

})
/**
 * @swagger
 * /api/auth/profile/get-unread-notifications-count:
 *   get:
 *     summary: Get the count of unread notifications for the user
 *     tags: [Auth-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Success - Unread notifications count retrieved
 */
router.get("/get-unread-notifications-count", async (req, res) => {
   const response = await ProfileController.getUnreadNotificationsCount({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);
})
/**
 * @swagger
 * /api/auth/profile/get-last-unread-notification:
 *   get:
 *     summary: Get the last unread notification for the user
 *     tags: [Auth-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Success - Last notification retrieved
 */
router.get("/get-last-unread-notification", async (req, res) => {
   const response = await ProfileController.getLastUnreadNotification({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
   res.return(response);

})

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
