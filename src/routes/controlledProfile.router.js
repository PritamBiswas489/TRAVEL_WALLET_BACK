import "../config/environment.js";
import express from "express";
import ControlledProfileController from "../controllers/controlledProfile.controller.js";

const router = express.Router();


/**
 * @swagger
 * /api/auth/controlled-profiles/create:
 *   post:
 *     summary: Create a controlled profile
 *     tags: [Auth-Controlled-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the controlled profile
 *               profile_type:
 *                 type: string
 *                 enum: [family_member, child_profile]
 *                 description: Type of controlled profile
 *               balance_visibility:
 *                 type: string
 *                 enum: [spending_allowance, shared_wallet_balance]
 *                 description: Balance visibility mode
 *               daily_spend_limit:
 *                 type: number
 *                 default: 100
 *               monthly_spend_limit:
 *                 type: number
 *                 default: 1500
 *               per_transaction_limit:
 *                 type: number
 *                 default: 50
 *               qr_payments:
 *                 type: boolean
 *                 enum: [true, false]
 *                 example: true
 *               add_money:
 *                 type: boolean
 *                 enum: [true, false]
 *                 example: false
 *               debit_card_access:
 *                 type: boolean
 *                 enum: [true, false]
 *                 example: false
 *               money_transfers:
 *                 type: boolean
 *                 enum: [true, false]
 *                 example: false
 *               currency_exchange:
 *                 type: boolean
 *                 enum: [true, false]
 *                 example: false
 *               request_extra_spending:
 *                 type: boolean
 *                 enum: [true, false]
 *                 example: true
 *               parent_notifications:
 *                 type: boolean
 *                 enum: [true, false]
 *                 example: true
 *     responses:
 *       200:
 *         description: Controlled profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     activation_code:
 *                       type: string
 *                       pattern: '^[0-9]{4}$'
 *                       description: Activation code returned only when the profile is created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/create", async (req, res) => {
     res.set("Cache-Control", "no-store");
     const response = await ControlledProfileController.createControlledProfile({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
      res.return(response);
   
});

/**
 * @swagger
 * /api/auth/controlled-profiles:
 *   get:
 *     summary: List connected accounts owned by the current user
 *     tags: [Auth-Controlled-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     responses:
 *       200:
 *         description: Connected accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res) => {
  const response = await ControlledProfileController.listConnectedAccounts({
    headers: req.headers,
    user: req.user,
  });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/controlled-profiles/{id}:
 *   get:
 *     summary: Get a connected account owned by the current user
 *     tags: [Auth-Controlled-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Controlled profile ID
 *         schema:
 *           type: string
 *           pattern: '^[1-9][0-9]{0,18}$'
 *     responses:
 *       200:
 *         description: Connected account retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid account ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Connected account not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", async (req, res) => {
  const response = await ControlledProfileController.getConnectedAccount({
    headers: req.headers,
    user: req.user,
    id: req.params.id,
  });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/controlled-profiles/{id}:
 *   patch:
 *     summary: Update an owned connected profile
 *     description: Only supplied fields are updated; activation codes are unchanged.
 *     tags: [Auth-Controlled-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[1-9][0-9]{0,18}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             additionalProperties: false
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               daily_spend_limit:
 *                 type: number
 *                 minimum: 0
 *               monthly_spend_limit:
 *                 type: number
 *                 minimum: 0
 *               per_transaction_limit:
 *                 type: number
 *                 minimum: 0
 *               qr_payments:
 *                 type: boolean
 *               add_money:
 *                 type: boolean
 *               debit_card_access:
 *                 type: boolean
 *               money_transfers:
 *                 type: boolean
 *               currency_exchange:
 *                 type: boolean
 *               request_extra_spending:
 *                 type: boolean
 *               parent_notifications:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated account without activation code or hash
 *       400:
 *         description: Invalid ID or update fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Connected account not found
 *       500:
 *         description: Update failed
 */
router.patch("/:id", async (req, res) => {
  const response = await ControlledProfileController.updateConnectedAccount({
    headers: req.headers,
    user: req.user,
    id: req.params.id,
    payload: req.body,
  });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/controlled-profiles/{id}/regenerate-activation-code:
 *   post:
 *     summary: Replace the activation code for an owned controlled profile
 *     tags: [Auth-Controlled-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[1-9][0-9]{0,18}$'
 *     responses:
 *       200:
 *         description: New code generated; the previous code is invalidated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     activation_code:
 *                       type: string
 *                       pattern: '^[0-9]{4}$'
 *                       description: Returned only in this response
 *       400:
 *         description: Invalid account ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Connected account not found
 *       500:
 *         description: Code regeneration failed
 */
router.post("/:id/regenerate-activation-code", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const response = await ControlledProfileController.regenerateActivationCode({
    headers: req.headers,
    user: req.user,
    id: req.params.id,
  });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/controlled-profiles/{id}/status:
 *   patch:
 *     summary: Update an owned connected profile's status
 *     tags: [Auth-Controlled-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[1-9][0-9]{0,18}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [active, inactive]
 *       400:
 *         description: Invalid account ID or status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Connected account not found
 *       500:
 *         description: Status update failed
 */
router.patch("/:id/status", async (req, res) => {
  const response = await ControlledProfileController.updateConnectedAccountStatus({
    headers: req.headers,
    user: req.user,
    id: req.params.id,
    payload: req.body,
  });
  res.return(response);
});

/**
 * @swagger
 * /api/auth/controlled-profiles/{id}:
 *   delete:
 *     summary: Permanently delete an owned connected profile
 *     tags: [Auth-Controlled-Profile routes]
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[1-9][0-9]{0,18}$'
 *     responses:
 *       200:
 *         description: Connected profile deleted permanently
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *       400:
 *         description: Invalid account ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Connected account not found
 *       500:
 *         description: Deletion failed
 */
router.delete("/:id", async (req, res) => {
  const response = await ControlledProfileController.deleteConnectedAccount({
    headers: req.headers,
    user: req.user,
    id: req.params.id,
  });
  res.return(response);
});

export default router;