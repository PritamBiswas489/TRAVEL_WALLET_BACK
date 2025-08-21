import db from "../databases/models/index.js";

import "../config/environment.js";
import * as Sentry from "@sentry/node";
const { Op, WhitelistMobiles } = db;
import { handleCallback } from "../libraries/utility.js";

export default class WhitelistMobilesService {
  static async create( data, callback ) {

    try {
      if (!Array.isArray(data?.mobileNumbers) || data.mobileNumbers.length === 0) {
        return handleCallback(new Error("MOBILE_NUMBERS_REQUIRED"), null, callback);
      }
      if (!['send', 'request'].includes(data.type)) {
        return handleCallback(new Error("TYPE_REQUIRED_SEND_REQUEST"), null, callback);
      }
      const records = data.mobileNumbers.map(mobileNumber => ({
        userId: data.userId,
        ...mobileNumber,
        type: data.type
      }));
     
      const result = await WhitelistMobiles.bulkCreate(records);
      return handleCallback(null, { data: result }, callback);
    } catch (error) {
      console.log(error);
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return handleCallback(new Error("CATCH_ERROR"), null, callback);
    }
  }

  static async findAll(options, callback) {
    try {
        if(!['send','request'].includes(options.type)){
           return handleCallback(new Error("TYPE_REQUIRED_SEND_REQUEST"), null, callback);
        }
       
      const result = await WhitelistMobiles.findAll({
        where: {
          ...options
        }
      });
      return handleCallback(null, {data:result}, callback);
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return handleCallback(new Error("CATCH_ERROR"), null, callback);
    }
  }

  static async checkWhitelistContact(data, callback) {
    try {
      if (!data?.mobileNumber) {
        return handleCallback(new Error("MOBILE_NUMBER_REQUIRED"), null, callback);
      }
      if (!['send', 'request'].includes(data?.type)) {
        return handleCallback(new Error("TYPE_REQUIRED_SEND_REQUEST"), null, callback);
      }
     
      const result = await WhitelistMobiles.findOne({
        where: {
          [Op.or]: [
            { mobileNumber: data?.mobileNumber },
            { formattedNumber: data?.mobileNumber }
          ],
          userId: data?.userId,
          type: data?.type
        }
      });
     

      return handleCallback(null, { data: { isWhitelisted: !!result } }, callback);
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return handleCallback(new Error("CATCH_ERROR"), null, callback);
    }
  }

  static async destroy(options, callback) {
    try {
      const affectedCount = await WhitelistMobiles.destroy(options);
      return handleCallback(null, affectedCount, callback);
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return handleCallback(new Error("CATCH_ERROR"), null, callback);
    }
  }
}
