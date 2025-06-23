import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";

const { Currency, Op } = db;

export default class CurrencyService {

    static async insertOrUpdateCurrency(data) {
        try {
            const codes = ["ILS_TO_THB", "THB_TO_ILS", "EUR_TO_ILS", "EUR_TO_THB"];

            const existingCurrencies = await Currency.findAll({
                where: { code: { [Op.in]: codes } }
            });

            const existingMap = {};
            existingCurrencies.forEach(currency => {
                existingMap[currency.code] = currency;
            });

            for (let code of codes) {
                if (existingMap[code]) {
                    await Currency.update(
                        { value: data[code] },
                        { where: { id: existingMap[code].id } }
                    );
                } else {
                    await Currency.create({
                        code: code,
                        value: data[code]
                    });
                }
            }

            return { SUCCESS: 1 };
        } catch (e) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
            return { ERROR: e.message };
        }
    }

    static async getCurrencyByCode(code) {
        try {
            const currency = await Currency.findOne({ where: { code } });
            if (!currency) {
                return { ERROR: 1 };
            }
            return { data: currency };
        } catch (e) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
            return { ERROR: 1 };
        }
    }

    static async getAllCurrencies() {
        try {
            const currencies = await Currency.findAll();
            return { data: currencies };
        } catch (e) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
            return { ERROR: 1 };
        }
    }
}
