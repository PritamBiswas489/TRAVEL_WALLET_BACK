import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
const { SuggestionType, SuggestionPriorityLevel, Op, User } = db;

export default class SuggestionService {
  static async addSuggestionType(suggestionTypes) {
    try {
      const createdSuggestionTypes = await SuggestionType.bulkCreate(suggestionTypes);
      return createdSuggestionTypes;
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw new Error("Error adding suggestion types");
    }
  }
  static async getSuggestionTypes() {
    try {
      const suggestionTypes = await SuggestionType.findAll();
      return { data: suggestionTypes };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { ERROR: true, message: error.message };
    }
  }

  static async clearSuggestionTypeTable() {
    try {
      await SuggestionType.destroy({ where: {}, truncate: true });
      return { message: "All suggestion types cleared successfully." };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { error: error.message };
    }
  }

  static async addSuggestionPriorityLevels(priorityLevels) {
    try {
      const createdPriorityLevels = await SuggestionPriorityLevel.bulkCreate(priorityLevels);
      return createdPriorityLevels;
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw new Error("Error adding suggestion priority levels");
    }
  }
  static async getSuggestionPriorityLevels() {
    try {
      const priorityLevels = await SuggestionPriorityLevel.findAll();
      return { data: priorityLevels };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { ERROR: true, message: error.message };
    }
  }

  static async clearSuggestionPriorityLevelTable() {
    try {
      await SuggestionPriorityLevel.destroy({ where: {}, truncate: true });
      return { message: "All suggestion priority levels cleared successfully." };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { error: error.message };
    }

  }
}
