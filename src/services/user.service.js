import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";

const { Op, User, UserKyc } = db;

export default class UserService {
  static async getUserById(userId) {
    try {
      const user = await User.findOne({
        where: { id: userId },
        attributes: { exclude: ["password", "createdAt", "updatedAt"] },
      });
      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw error;
    }
  }
  static async createSiteApplicant({ id, userId }) {
    try {
      const newSiteApplicant = await UserKyc.create({
        uuid: id,
        userId,
      });
      return newSiteApplicant;
    } catch (error) {
      console.error("Error creating site applicant:", error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw error;
    }
  }
  static async updateKycData({ applicantid, id }) {
    try {
      const updatedKyc = await UserKyc.update(
        { applicantId: applicantid },
        { where: { id } }
      );
      return updatedKyc;
    } catch (error) {
      console.error("Error updating KYC data:", error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw error;
    }
  }
  static async getUserKycData(userId) {
    try {
      const userKyc = await UserKyc.findOne({
        where: { userId },
      });
      return userKyc;
    } catch (error) {
      console.error("Error fetching user KYC data:", error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw error;
    }
  }
  static async deleteUserKycData(userId) {
    try {
      const deletedKyc = await UserKyc.destroy({
        where: { userId },
      });
      return deletedKyc;
    } catch (error) {
      console.error("Error deleting user KYC data:", error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw error;
    }
  }
}
