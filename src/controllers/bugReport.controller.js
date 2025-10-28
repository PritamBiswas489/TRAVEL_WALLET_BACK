import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import "../config/environment.js";
import BugReportService from "../services/bugReportService.js";

export default class BugReportController {
    static async getBugSeverityLevels(request) {
        const { payload, headers: { i18n }, user } = request;

        try {
            const result = await BugReportService.getBugSeverityLevels();
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
                message: i18n.__("BUG_SEVERITIES_FETCHED_SUCCESSFULLY"),
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
    static async getBugPlaces(request) {
        const { payload, headers: { i18n }, user } = request;

        try {
            const result = await BugReportService.getBugPlaces();
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
                message: i18n.__("BUG_PLACES_FETCHED_SUCCESSFULLY"),
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