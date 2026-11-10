import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import "../config/environment.js";
import FeedbackService from "../services/feedbackService.js";
import { translateValue } from "../libraries/tranlateValue.js";
export default class FeedbackController {
  /// Get Feedback Category
  static async getFeedbackCategory(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
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
  /// Submit Feedback
  static async submitFeedback(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user ? user.id : null;
    payload.userId = userId;
    try {
      const result = await FeedbackService.submitFeedback(payload);
      if (result.ERROR) {
        return {
          status: 500,
          data: [],
          error: { message: translateValue(i18n, "INVALID_CATEGORY_ID", "INVALID_CATEGORY_ID"), reason: result.message },
        };
      }
      return {
        status: 200,
        data: result.data,
        message: translateValue(i18n, "FEEDBACK_SUBMITTED_SUCCESSFULLY", "FEEDBACK_SUBMITTED_SUCCESSFULLY"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
       
        error: { message: translateValue(i18n, "CATCH_ERROR", "CATCH_ERROR"), reason: e.message },
      };
    }
  }
  static async getMyFeedbacks(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    const userId = user ? user.id : null;
    try {
      const result = await FeedbackService.getMyFeedbacks(userId, payload);
      if (result.ERROR) {
        return {
          status: 500,
          data: [],
          error: { message: translateValue(i18n, "CATCH_ERROR", "CATCH_ERROR"), reason: result.message },
        };
      }
      return {
        status: 200,
        data: result.data,
        message: translateValue(i18n, "FEEDBACKS_FETCHED_SUCCESSFULLY", "FEEDBACKS_FETCHED_SUCCESSFULLY"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: translateValue(i18n, "CATCH_ERROR", "CATCH_ERROR"), reason: e.message },
      };
    }
  }

  static async getAllFeedbacks(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    
    try {
      const result = await FeedbackService.getAllFeedbacks(payload);
      if (result.ERROR) {
        return {
          status: 500,
          data: [],
          error: { message: translateValue(i18n, "CATCH_ERROR", "CATCH_ERROR"), reason: result.message },
        };
      }
      return {
        status: 200,
        data: result.data,
        message: translateValue(i18n, "FEEDBACKS_FETCHED_SUCCESSFULLY", "FEEDBACKS_FETCHED_SUCCESSFULLY"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: translateValue(i18n, "CATCH_ERROR", "CATCH_ERROR"), reason: e.message },
      };
    }
  }
}
