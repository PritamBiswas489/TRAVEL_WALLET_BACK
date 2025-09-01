import "../config/environment.js";
import express from "express";
import EncryptDecryptController from "../controllers/encrypt.decrypt.controller.js";
const router = express.Router();
/**
 * @swagger
 * /api/auth/crypto/encrypt:
 *   post:
 *     tags:
 *       - Encrypt-Decrypt routes
 *     summary: Encrypt data
 *     description: Encrypts the provided payload.
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Data to encrypt
 *             example:
 *               key: "value"
 *     responses:
 *       200:
 *         description: Encrypted result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/encrypt", async (req, res, next) => {
    const result = await EncryptDecryptController.encryptRequest({
        payload: { ...req.params, ...req.query, ...req.body },
        headers: req.headers,
        user: req.user
    });
    res.return(result);
});

/**
 * @swagger
 * /api/auth/crypto/decrypt:
 *   post:
 *     tags:
 *       - Encrypt-Decrypt routes
 *     summary: Decrypt data
 *     description: Decrypts the provided payload.
 *     security:
 *       - bearerAuth: []
 *       - refreshToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Data to decrypt
 *             example:
 *               key: "value"
 *     responses:
 *       200:
 *         description: Decrypted result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/decrypt", async (req, res, next) => {
    const result = await EncryptDecryptController.decryptRequest({
        payload: { ...req.params, ...req.query, ...req.body },
        headers: req.headers,
        user: req.user
    });
    res.return(result);
});



export default router;