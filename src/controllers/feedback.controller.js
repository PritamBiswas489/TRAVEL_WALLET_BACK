import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import "../config/environment.js";
import FeedbackService from "../services/feedbackService.js";
export default class FeedbackController {
    static async getFeedbackCategory(request) {
        const { payload, headers: { i18n }, user } = request;
        try {
            const result = await FeedbackService.getFeedbackCategory();
            if (result.ERROR) {
                return {
                    status: 500,
                    data: [],
                    error: { message: i18n.__("CATCH_ERROR"), reason: result.message },
                };
            }
            return {
                status: 200,
                data: result.data,
                message: i18n.__("FEEDBACK_CATEGORY_FETCHED_SUCCESSFULLY"),
                error: {},
            };
        } catch (e) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
            return {
                status: 500,
                data: [],
                message: i18n.__("CATCH_ERROR"),
                error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
            };
        }
    }
}