import "../config/environment.js";
import db from "../databases/models/index.js";
import * as Sentry from "@sentry/node";
import AirwallexPaymentService from "./airwallexPayment.service.js";
const { AirwallexPaymentIntent, sequelize, Op } = db;

export default class UserFullRefundService {
  static async getRefundablePaymentIntents(userId, transaction) {
    return AirwallexPaymentIntent.findAll({
      where: {
        userId,
        isCompleteRefund: false,
        isCompleteReverseSplit: false,
        // add this if you only want successful payments, e.g. status: "SUCCEEDED"
        [Op.and]: [
          // totalRefundAmount = totalReverseSplitAmount (NULL treated as 0)
          db.Sequelize.literal(
            `COALESCE("totalRefundAmount", 0) = COALESCE("totalReverseSplitAmount", 0)`,
          ),
          // splitAmount - totalRefundAmount > 0
          db.Sequelize.literal(
            `COALESCE("splitAmount", 0) - COALESCE("totalRefundAmount", 0) > 0`,
          ),
        ],
      },
      attributes: {
        include: [
          [
            db.Sequelize.literal(
              `COALESCE("splitAmount", 0) - COALESCE("totalRefundAmount", 0)`,
            ),
            "refundableAmount",
          ],
        ],
      },
      order: [["createdAt", "DESC"]], // newest first (LIFO)
      transaction,
      lock: transaction ? transaction.LOCK.UPDATE : undefined, // prevents double refunds
    });
  }
  static allocateRefund(intents, walletBalance) {
    let remaining = Math.round(Number(walletBalance) * 100); // work in cents
    const allocations = [];

    for (const intent of intents) {
      if (remaining <= 0) break;

      const refundable = Math.round(
        Number(intent.get("refundableAmount")) * 100,
      );
      const refundNow = Math.min(refundable, remaining);

      allocations.push({ intent, amount: refundNow / 100 });
      remaining -= refundNow;
    }

    return allocations;
  }

  static async userBalanceFullRefund(userId, callback) {
    let result;
    try {
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
      if (!Number.isFinite(currentBalance) || currentBalance <= 0) {
        throw new Error("INSUFFICIENT_BALANCE.");
      }

      const allocations = await sequelize.transaction(async (transaction) => {
        const refundablePaymentIntents =
          await UserFullRefundService.getRefundablePaymentIntents(
            userId,
            transaction,
          );
        return UserFullRefundService.allocateRefund(
          refundablePaymentIntents,
          currentBalance,
        );
      });

      if (allocations.length === 0) {
        throw new Error("NO_REFUNDABLE_PAYMENT_INTENTS.");
      }

      const data = [];
      for (const { intent, amount } of allocations) {
        const allocationResult = {
          paymentId: intent.id,
          splitAmount: intent.splitAmount,
          amount,
        };

        try {
          const refundResponse = await new Promise((resolve, reject) => {
            AirwallexPaymentService.mainPaymentRefundProcessHandle(
              {
                userId,
                payload: {
                  refundPaymentId: intent.id,
                  refundPaymentAmt: amount,
                },
              },
              (error, response) => {
                if (error) return reject(error);
                resolve(response);
              },
            ).catch(reject);
          });
          data.push({
            ...allocationResult,
            status: "initiated",
            reverseSplit: refundResponse?.data,
          });
        } catch (error) {
          data.push({
            ...allocationResult,
            status: "failed",
            error: error?.message || "REFUND_PROCESS_FAILED",
          });
        }
      }

      result = { data };
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return callback(error);
    }
    return callback(null, result);
  }
}
