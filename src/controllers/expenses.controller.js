import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import ExpensesService from "../services/expenses.service.js";


export default class ExpensesController {
     static async listExpenses(req, res) {
        try {
            const expenses = await ExpensesService.getAllExpenses();
            return { status: 200, data: expenses, message: "",  error: {}, };
        } catch (e) {
            if (process.env.SENTRY_ENABLED === "true") {
                Sentry.captureException(e);
            }
            return { status: 500, error: e.message , data:{}, message: "" };
        }

    }

}