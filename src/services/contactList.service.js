import db from "../databases/models/index.js";

import "../config/environment.js";
import * as Sentry from "@sentry/node";
const { Op, User, UserContactList } = db;
import { handleCallback } from "../libraries/utility.js";
import { createHmacExecute, randomSaltHex } from "../libraries/utility.js";

export default class ContactListService {
  static async addMobileNumbers(userId, data, callback) {
    try {
      if (!data?.mobileNumbers || data.mobileNumbers.length === 0) {
        return handleCallback(
          new Error("MOBILE_NUMBERS_REQUIRED"),
          null,
          callback
        );
      }
      if (!["send", "request"].includes(data?.type)) {
        return handleCallback(
          new Error("TYPE_REQUIRED_SEND_REQUEST"),
          null,
          callback
        );
      }
      const user = await User.findOne({
        where: { id: userId },
      });
      if (!user.hexSalt) {
        user.hexSalt = randomSaltHex();
        await user.save();
      }
      const mobileHexArray = data.mobileNumbers.map((number) => {
        return createHmacExecute(number, user.hexSalt);
      });
      //   console.log(mobileHexArray);
      // Find existing contact hashes for the user
      const existingContacts = await UserContactList.findAll({
        where: {
          userId,
          contactHash: { [Op.in]: mobileHexArray },
          type: data.type,
        },
        attributes: ["contactHash"],
      });
      const existingHashes = existingContacts.map((c) => c.contactHash);
      // Filter out duplicates
      const newContactHashes = mobileHexArray.filter(
        (hash) => !existingHashes.includes(hash)
      );
      if (newContactHashes.length > 0) {
        await UserContactList.bulkCreate(
          newContactHashes.map((contactHash) => ({
            userId,
            contactHash,
            type: data.type,
          }))
        );
      }
      return handleCallback(
        null,
        { data: { success: true, mobileHexArray } },
        callback
      );
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return handleCallback(new Error("CATCH_ERROR"), null, callback);
    }
  }
  static async checkMobileNumberInContactList(userId, data, callback) {
    try {
      
      let checkUserId = userId;
      if (data?.checkUserId) {
        checkUserId = data.checkUserId;
      }
      if (!["send", "request"].includes(data?.type)) {
        return handleCallback(
          new Error("TYPE_REQUIRED_SEND_REQUEST"),
          null,
          callback
        );
      }
      const user = await User.findOne({
        where: { id: checkUserId },
        attributes: ["id", "hexSalt"],
      });

      if (!user) {
        return handleCallback(new Error("USER_NOT_FOUND"), null, callback);
      }
      if (!user.hexSalt) {
        user.hexSalt = randomSaltHex();
        await user.save();
      }

      const mobileHex = createHmacExecute(data.mobileNumber, user.hexSalt);
      const isInContactList = await UserContactList.findOne({
        where: {
          userId: checkUserId,
          contactHash: mobileHex,
          type: data.type,
        },
      });

      return handleCallback(
        null,
        { data: { isInContactList: !!isInContactList } },
        callback
      );
    } catch (error) {
        console.log(error)
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return handleCallback(new Error("CATCH_ERROR"), null, callback);
    }
  }
  static async removeMobileNumberFromContactList(userId, data, callback) {
      try{
        if (!["send", "request"].includes(data?.type)) {
            return handleCallback(
            new Error("TYPE_REQUIRED_SEND_REQUEST"),
            null,
            callback
            );
        }
        if (!data?.mobileNumber) {
            return handleCallback(new Error("MOBILE_NUMBER_REQUIRED"), null, callback);
        }

      const user = await User.findOne({
        where: { id: userId },
        attributes: ["id", "hexSalt"],
      });

      if (!user) {
        return handleCallback(new Error("USER_NOT_FOUND"), null, callback);
      }
      if (!user.hexSalt) {
        user.hexSalt = randomSaltHex();
        await user.save();
      }

      const mobileHex = createHmacExecute(data.mobileNumber, user.hexSalt);
      await UserContactList.destroy({
        where: {
          userId,
          contactHash: mobileHex,
          type: data.type,
        },
      });

      return handleCallback(
        null,
        { data: { success: true } },
        callback
      );
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return handleCallback(new Error("CATCH_ERROR"), null, callback);
      }

  }
}
