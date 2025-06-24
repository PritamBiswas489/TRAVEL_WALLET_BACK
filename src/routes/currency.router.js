import "../config/environment.js";
import express from "express";
const router = express.Router();
import CurrencyController from "../controllers/currency.controller.js";
/**
 * @swagger
 * /api/currency/fixerExchangeRates:
 *   get:
 *     summary: Get exchange rates from Fixer.io
 *     tags:
 *       - Currency routes
 *     responses:
 *       200:
 *         description: Success - Exchange rates retrieved
 */
router.get("/fixerExchangeRates", async (req, res, next) => {
  const exchangeRates = await CurrencyController.fixerExchangeRates({
    payload: { ...req.params, ...req.query, ...req.body },
    headers: req.headers,
    user: req.user,
  });
  res.return(exchangeRates);
});

/**
 * @swagger
 * /api/currency/rateByCode:
 *   get:
 *     summary: Get currency rate by code
 *     tags:
 *       - Currency routes
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           example: ILS_TO_THB
 *     responses:
 *       200:
 *         description: Success - Currency rate retrieved
 *       400:
 *         description: Bad Request - Missing or invalid currency code
 *       500:
 *         description: Internal Server Error
 */

router.get("/rateByCode", async (req, res, next) => {
  const currency = await CurrencyController.getCurrencyByCode({
    payload: { ...req.params, ...req.query, ...req.body },
    headers: req.headers,
    user: req.user,
  });
  res.return(currency);
});
/**
 * @swagger
 * /api/currency/allCurrencies:
 *   get:
 *     summary: Get all currencies
 *     tags:
 *       - Currency routes
 *     responses:
 *       200:
 *         description: Success - All currencies retrieved
 *       500:
 *         description: Internal Server Error
 */
router.get("/allCurrencies", async (req, res, next) => {
  const currencies = await CurrencyController.getAllCurrencies({
    payload: { ...req.params, ...req.query, ...req.body },
    headers: req.headers,
    user: req.user,
  });
  res.return(currencies);
});

/**
 * @swagger
 * /api/currency/amount-convert-to-thb:
 *   post:
 *     summary: Convert amount to THB
 *     tags:
 *       - Currency routes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100
 *               fromCurrency:
 *                 type: string
 *                 example: ILS
 *     responses:
 *       200:
 *         description: Success - Amount converted to THB
 */

router.post("/amount-convert-to-thb", async (req, res, next) => {
  try {
    const result = await CurrencyController.convertToTHB({
      payload: { ...req.params, ...req.query, ...req.body },
      headers: req.headers,
    });
    res.return(result);
  } catch (e) {
    process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
    res.return({
      status: 500,
      data: [],
      error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
    });
  }
});

export default router;
