import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import AirwallexPaymentService from "./airwallexPayment.service.js";
import UserService from "./user.service.js";
import ActiveOperationService, { OP_TYPE } from "./activeOperations.service.js";
const { modelWithUserIdFields, sequelize, User, AirwallexKycAccount } = db;

export default class UserAccRemoveService {
  static async removeUserAccount(userid) {
    try {
      let airwallexAccountId = null;
      let customerName = null;
      let customerPhone = null;
      let customerEmail = null;

      const getUserDetails = await UserService.getUserById(userid);

      customerName = getUserDetails?.name || null;
      customerPhone = getUserDetails?.phoneNumber || null;
      customerEmail = getUserDetails?.email || null;

      const airwallexAccount = await AirwallexKycAccount.findOne({
        where: { userId: userid },
      });
      if (airwallexAccount) {
        airwallexAccountId = airwallexAccount.airwallexAccountId;
      }
      await sequelize.transaction(async (transaction) => {
        const userRecord = await User.findByPk(userid, { transaction });
        if (!userRecord) {
          throw new Error(`User with id ${userid} not found`);
        }

        for (const { model: modelName, fields } of modelWithUserIdFields) {
          const model = db[modelName];
          for (const { attribute } of fields) {
            try {
              await model.destroy({
                where: { [attribute]: userid },
                transaction,
              });
            } catch (error) {
              console.log(
                `Failed to delete records from ${modelName} where ${attribute} = ${userid}:`,
                error?.message,
              );
            }
          }
        }

        await userRecord.destroy({ transaction });
        if (airwallexAccountId) {
          await AirwallexPaymentService.offboardingAirewallexAccount(
            {
              payload: {
                airwallexAccountId,
                customerName,
                customerPhone,
                customerEmail,
              },
            },
            (err, result) => {
              if (err) {
                console.error(
                  `Failed to offboard Airwallex account with id ${airwallexAccountId}:`,
                  err?.message,
                );
              }
              if (result) {
                console.log(
                  `Successfully offboarded Airwallex account with id ${airwallexAccountId}:`,
                  result,
                );
              }
            },
          );
        }
      });
      return true;
    } catch (error) {
      console.error(error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw error;
    }
  }
  static async executeUserAccountRemoval(userId, i18n, payload) {
    try {
      if (payload?.forceDelete) {
        return {
          status: 200,
          data: {
            action: "deleteProfile",
            message: i18n.__("DELETE_PROFILE"),
          },
        };
      }
      const getKycAccount = await AirwallexKycAccount.findOne({
        where: { userId: userId },
      });
      if (getKycAccount?.airwallexAccountId) {
        const hasActivePaymentOperation =
          await ActiveOperationService.hasActive(userId, OP_TYPE.PAYMENT);
        const hasActiveRefundOperation = await ActiveOperationService.hasActive(
          userId,
          OP_TYPE.REFUND,
        );
        if (hasActivePaymentOperation && hasActiveRefundOperation) {
          return {
            status: 200,
            data: {
              action: "waitForActivePaymentAndRefundOperation",
              message: i18n.__("WAIT_FOR_ACTIVE_PAYMENT_AND_REFUND_OPERATION"),
            },
          };
        }
        if (hasActivePaymentOperation) {
          return {
            status: 200,
            data: {
              action: "waitForActivePaymentOperation",
              message: i18n.__("WAIT_FOR_ACTIVE_PAYMENT_OPERATION"),
            },
          };
        }
        if (hasActiveRefundOperation) {
          return {
            status: 200,
            data: {
              action: "waitForActiveRefundOperation",
              message: i18n.__("WAIT_FOR_ACTIVE_REFUND_OPERATION"),
            },
          };
        }
        const accountBalance = await new Promise((resolve, reject) => {
          AirwallexPaymentService.getAccountBalance(
            { userId, i18n: null },
            (error, response) => {
              if (error) return reject(error);
              resolve(response?.data || {});
            },
          );
        });
        const currentBalance = Number(accountBalance?.ILS);
        if (currentBalance > 0) {
          return {
            status: 200,
            data: {
              action: "executeRefund",
              currentBalance,
              message: i18n.__("EXECUTE_REFUND", { currentBalance }),
            },
          };
        } else {
          return {
            status: 200,
            data: {
              action: "deleteProfile",
              message: i18n.__("DELETE_PROFILE"),
            },
          };
        }
      }
      // You can reuse the removeUserAccount logic here or implement any additional steps needed for execution
      return {
        status: 200,
        data: {
          action: "deleteProfile",
          message: i18n.__("DELETE_PROFILE"),
        },
      };
    } catch (error) {
      console.error(error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      throw error;
    }
  }
}
