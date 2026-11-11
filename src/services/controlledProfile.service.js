import db from "../databases/models/index.js";
import "../config/environment.js";
import * as Sentry from "@sentry/node";
import {
  generateActivationCode,
  lockActivationCodes,
} from "../databases/models/ControlledProfiles.js";
import {
  createControlledProfileSchema,
  updateControlledProfileSchema,
  controlledProfileIdSchema,
  controlledProfileStatusSchema,
  permissionFields,
} from "../validators/controlledProfile.validator.js";

const { ControlledProfiles } = db;

export default class ControlledProfileService {
  static async createControlledProfile({ userId, payload }, callback) {
    const { error, value } = createControlledProfileSchema.validate(payload);
    if (error) {
      return callback(new Error(error.details[0].message), null);
    }

    const permissions = Object.fromEntries(
      permissionFields
        .filter((field) => value[field] !== undefined)
        .map((field) => [field, value[field]]),
    );
    const spendingLimit = (amount) => ({
      amount,
      currency: "ILS",
      enabled: true,
    });

    let profile;
    try {
      profile = await db.sequelize.transaction(async (transaction) =>
        ControlledProfiles.create({
          userId,
          name: value.name,
          profile_type: value.profile_type,
          balance_visibility: value.balance_visibility,
          spending_limits: {
            daily: spendingLimit(value.daily_spend_limit),
            monthly: spendingLimit(value.monthly_spend_limit),
            per_transaction: spendingLimit(value.per_transaction_limit),
          },
          permissions,
        }, { transaction }),
      );
    } catch (error) {
      console.error("Error creating controlled profile:", error);
      if (process.env.SENTRY_ENABLED === "true") {
        Sentry.captureException(error);
      }
      return callback(new Error("CONTROLLED_PROFILE_CREATION_FAILED"), null);
    }
    const data = profile.get({ plain: true });
    delete data.activation_code_hash;
    data.activation_code = profile.activationCode;
    return callback(null, { data });
  }

  static async listConnectedAccounts({ userId }, callback) {
    let profiles;
    try {
      profiles = await ControlledProfiles.findAll({
        where: { userId },
        attributes: { exclude: ["activation_code_hash"] },
        order: [["id", "DESC"]],
      });
    } catch (error) {
      console.error("Error listing connected accounts:", error);
      if (process.env.SENTRY_ENABLED === "true") Sentry.captureException(error);
      return callback(new Error("CONNECTED_ACCOUNTS_RETRIEVAL_FAILED"), null);
    }
    return callback(null, { data: profiles });
  }

  static async getConnectedAccount({ userId, id }, callback) {
    const { error, value } = controlledProfileIdSchema.validate(id);
    if (error) return callback(new Error(error.details[0].message), null);

    let profile;
    try {
      profile = await ControlledProfiles.findOne({
        where: { userId, id: value },
        attributes: { exclude: ["activation_code_hash"] },
      });
    } catch (error) {
      console.error("Error retrieving connected account:", error);
      if (process.env.SENTRY_ENABLED === "true") Sentry.captureException(error);
      return callback(new Error("CONNECTED_ACCOUNT_RETRIEVAL_FAILED"), null);
    }
    if (!profile) return callback(new Error("CONNECTED_ACCOUNT_NOT_FOUND"), null);
    return callback(null, { data: profile });
  }

  static async updateConnectedAccount({ userId, id, payload }, callback) {
    const idResult = controlledProfileIdSchema.validate(id);
    if (idResult.error) return callback(new Error(idResult.error.details[0].message), null);
    const { error, value } = updateControlledProfileSchema.validate(payload);
    if (error) return callback(new Error(error.details[0].message), null);

    let updated;
    try {
      updated = await db.sequelize.transaction(async (transaction) => {
        const profile = await ControlledProfiles.findOne({
          where: { userId, id: idResult.value },
          attributes: { exclude: ["activation_code_hash"] },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!profile) return null;

        const changes = {};
        if (value.name !== undefined) changes.name = value.name;
        const permissions = { ...profile.permissions };
        let permissionsChanged = false;
        for (const field of permissionFields) {
          if (value[field] !== undefined) {
            permissions[field] = value[field];
            permissionsChanged = true;
          }
        }
        if (permissionsChanged) changes.permissions = permissions;

        const spendingLimits = { ...profile.spending_limits };
        let limitsChanged = false;
        for (const [field, key] of [
          ["daily_spend_limit", "daily"],
          ["monthly_spend_limit", "monthly"],
          ["per_transaction_limit", "per_transaction"],
        ]) {
          if (value[field] !== undefined) {
            spendingLimits[key] = {
              currency: "ILS",
              enabled: true,
              ...spendingLimits[key],
              amount: value[field],
            };
            limitsChanged = true;
          }
        }
        if (limitsChanged) changes.spending_limits = spendingLimits;
        await profile.update(changes, { transaction });
        return profile.get({ plain: true });
      });
    } catch (error) {
      console.error("Error updating connected account:", error);
      if (process.env.SENTRY_ENABLED === "true") Sentry.captureException(error);
      return callback(new Error("CONNECTED_ACCOUNT_UPDATE_FAILED"), null);
    }
    if (!updated) return callback(new Error("CONNECTED_ACCOUNT_NOT_FOUND"), null);
    return callback(null, { data: updated });
  }

  static async regenerateActivationCode({ userId, id }, callback) {
    const { error, value } = controlledProfileIdSchema.validate(id);
    if (error) return callback(new Error(error.details[0].message), null);

    let result;
    try {
      result = await db.sequelize.transaction(async (transaction) => {
        await lockActivationCodes(db.sequelize, userId, transaction);
        const profile = await ControlledProfiles.findOne({
          where: { userId, id: value },
          transaction,
        });
        if (!profile) return null;
        const activationCode = await generateActivationCode(profile, transaction);
        return { id: profile.id, activation_code: activationCode };
      });
    } catch (error) {
      console.error("Error regenerating activation code:", error);
      if (process.env.SENTRY_ENABLED === "true") Sentry.captureException(error);
      return callback(new Error("ACTIVATION_CODE_REGENERATION_FAILED"), null);
    }
    if (!result) return callback(new Error("CONNECTED_ACCOUNT_NOT_FOUND"), null);
    return callback(null, { data: result });
  }

  static async updateConnectedAccountStatus({ userId, id, payload }, callback) {
    const idResult = controlledProfileIdSchema.validate(id);
    if (idResult.error) return callback(new Error(idResult.error.details[0].message), null);
    const statusResult = controlledProfileStatusSchema.validate(payload);
    if (statusResult.error) return callback(new Error(statusResult.error.details[0].message), null);

    let updated;
    try {
      [updated] = await ControlledProfiles.update(
        { status: statusResult.value.status },
        { where: { userId, id: idResult.value } },
      );
    } catch (error) {
      console.error("Error updating connected account status:", error);
      if (process.env.SENTRY_ENABLED === "true") Sentry.captureException(error);
      return callback(new Error("CONNECTED_ACCOUNT_STATUS_UPDATE_FAILED"), null);
    }
    if (!updated) return callback(new Error("CONNECTED_ACCOUNT_NOT_FOUND"), null);
    return callback(null, { data: { id: idResult.value, status: statusResult.value.status } });
  }

  static async deleteConnectedAccount({ userId, id }, callback) {
    const { error, value } = controlledProfileIdSchema.validate(id);
    if (error) return callback(new Error(error.details[0].message), null);

    let deleted;
    try {
      deleted = await db.sequelize.transaction(async (transaction) => {
        await lockActivationCodes(db.sequelize, userId, transaction);
        return ControlledProfiles.destroy({ where: { userId, id: value }, transaction });
      });
    } catch (error) {
      console.error("Error deleting connected account:", error);
      if (process.env.SENTRY_ENABLED === "true") Sentry.captureException(error);
      return callback(new Error("CONNECTED_ACCOUNT_DELETION_FAILED"), null);
    }
    if (!deleted) return callback(new Error("CONNECTED_ACCOUNT_NOT_FOUND"), null);
    return callback(null, { data: { id: value } });
  }
}