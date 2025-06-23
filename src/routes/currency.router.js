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
    const exchangeRates = await CurrencyController.fixerExchangeRates({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
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

router.get("/rateByCode",async (req, res, next) => {
    const currency = await CurrencyController.getCurrencyByCode({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
    res.return(currency);
})
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
    const currencies = await CurrencyController.getAllCurrencies({ payload: { ...req.params, ...req.query, ...req.body }, headers: req.headers, user: req.user });
    res.return(currencies);
});


export default router;