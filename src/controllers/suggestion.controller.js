import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import "../config/environment.js";
import SuggestionService from "../services/suggestionService.js";
export default class SuggestionController {
  static async getSuggestionTypes(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    try {
      const result = await SuggestionService.getSuggestionTypes();
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
        message: i18n.__("SUGGESTION_TYPES_FETCHED_SUCCESSFULLY"),
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
  static async getSuggestionPriorityLevels(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    try {
      const result = await SuggestionService.getSuggestionPriorityLevels();
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
        message: i18n.__("SUGGESTION_PRIORITY_LEVELS_FETCHED_SUCCESSFULLY"),
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
