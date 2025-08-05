import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import KycService from "./kyc.service.js";
import { hashStr, compareHashedStr, generateToken } from "../libraries/auth.js";

const { Op, User, UserKyc, UserWallet, UserFcm } = db;

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
  static async updateKycStatus({ applicantid, status }) {
    try {
      const updatedKyc = await UserKyc.update(
        { status },
        { where: { applicantId: applicantid } }
      );
      return updatedKyc;
    } catch (error) {
      console.error("Error updating KYC status:", error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw error;
    }
  }
  static async deleteUserKycData(userId) {
    try {
      const userKyc = await UserKyc.findOne({
        where: { userId },
      });
      if (!userKyc) {
        // No KYC data found for this user
        return 0;
      }
      const applicantId = userKyc.applicantId;
      const deletedKyc = await UserKyc.destroy({
        where: { userId },
      });
      if (applicantId) {
        await KycService.deleteWebHookStatus(applicantId);
      }
      return deletedKyc;
    } catch (error) {
      console.error("Error deleting user KYC data:", error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw error;
    }
  }
  static async getUserDetails(userId) {
    try {
      const user = await User.findOne({
        where: { id: userId },
        attributes: ["id", "name", "email", "phoneNumber", "role", "avatar", "dob", "address", "language"],
        include: [
          {
            model: UserKyc,
            as: "kyc",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: UserWallet,
            as: "wallets",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: UserFcm,
            as: "fcm",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
        ],
      });
      return user;
    } catch (error) {
      console.error("Error fetching user details:", error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw error;
    }
  }
  static async createDefaultAdminUser() {

    try{
      const user = await User.findOne({
        where: { role: "ADMIN" },
      });
      if (user) {
        console.log("Admin user already exists.");
        return;
      }
      const adminUser = {
        name: "Admin User",
        email: "admin@travelmoney.co.il",
        phoneNumber: "1111111111",
        password: await hashStr("admin@travelmoney.co.il"),
        role: "ADMIN",
        status: "active",
      };
      await User.create(adminUser);
      console.log("Default admin user created successfully.");
    }catch (error) {
      console.error("Error creating default admin user:", error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw error;
    }
  }
}

