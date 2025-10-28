import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
const { FeedbackCategory, Op, User } = db;

export default class FeedbackService {
  static async addCategories(categories) {
    try {
      const createdCategories = await FeedbackCategory.bulkCreate(categories);
      return createdCategories;
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw new Error("Error adding categories");
    }
  }
  static async getFeedbackCategory() {
    try {
      const categories = await FeedbackCategory.findAll();
      return { data: categories };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { ERROR: true, message: error.message };
    }

  }

  static async clearFeedbackCategoryTable() {
    try {
      await FeedbackCategory.destroy({ where: {}, truncate: true });
      return { message: "All feedback categories cleared successfully." };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { error: error.message };
    }
  }
}
