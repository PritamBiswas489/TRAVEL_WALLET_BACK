import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
const { BugSeverity, Op, User, BugPlace } = db;

export default class BugReportService {
  static async addBugSeverity(bugSeverities) {
    try {
      const createdBugSeverities = await BugSeverity.bulkCreate(bugSeverities);
      return createdBugSeverities;
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw new Error("Error adding bug severities");
    }
  }
  static async getBugSeverityLevels() {
    try {
      const bugSeverities = await BugSeverity.findAll();
      return { data: bugSeverities };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { ERROR: true, message: error.message };
    }

  }
  static async clearBugSeverityTable() {
    try {
      await BugSeverity.destroy({ where: {}, truncate: true });
      return { message: "All bug severities cleared successfully." };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { error: error.message };
    }
  }
  static async addBugPlaces(bugPlaces) {
    try {
      const createdBugPlaces = await BugPlace.bulkCreate(bugPlaces);
      return createdBugPlaces;
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw new Error("Error adding bug places");
    }
  }
  static async getBugPlaces() {
    try {
      const bugPlaces = await BugPlace.findAll();
      return { data: bugPlaces };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { ERROR: true, message: error.message };
    }
  }
  static async clearBugPlaceTable() {
    try {
      await BugPlace.destroy({ where: {}, truncate: true });
      return { message: "All bug places cleared successfully." };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return { error: error.message };
    }
  }
}
