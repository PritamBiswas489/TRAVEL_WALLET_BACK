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
      order: [["createdAt", "ASC"]], // oldest first (FIFO)
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

    return { allocations, unallocated: remaining / 100 };
  }

  static async userBalanceFullRefund(userId, callback) {
    try {
      let refundablePaymentIntents;
      let allocations;
       const getAccountBa =
        (await new Promise((resolve, reject) => {
          AirwallexPaymentService.getAccountBalance({ userId: userId, i18n: null }, (err, result) => {
            if (err) return reject(err);
            resolve(result?.data || {});
          });
        })) || {};
      const currentBalance = getAccountBa?.ILS || 0;
      if(currentBalance <= 0){
         throw new Error("INSUFFICIENT_BALANCE.");
      }
      await sequelize.transaction(async (t) => {
        refundablePaymentIntents =
          await UserFullRefundService.getRefundablePaymentIntents(userId, t);
        allocations = UserFullRefundService.allocateRefund(
          refundablePaymentIntents,
          currentBalance, // replace 0 with actual wallet balance
        );
      });
      const data = [];
      for (const { intent, amount } of allocations) {
         data.push({ paymentId: intent.id, splitAmount: intent.splitAmount, amount });

      }
      return callback(null, { data });
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      callback(error);
    }
  }
}
