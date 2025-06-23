import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
const { UserCard, Op, User } = db;

export default class DepositService {
  static async SaveCardDetails(data) {
    try {
      const createdCard = await UserCard.create(data);
      return createdCard;
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return { ERROR: e.message };
    }
  }
}
