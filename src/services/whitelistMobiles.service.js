import db from "../databases/models/index.js";

import "../config/environment.js";
import * as Sentry from "@sentry/node";
const { Op, WhitelistMobiles } = db;
import { handleCallback } from "../libraries/utility.js";

export default class WhitelistMobilesService {
  static async create(data, callback) {
    try {
      const result = await WhitelistMobiles.create(data);
      return handleCallback(null, {data:result}, callback);
    } catch (error) {
     process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return handleCallback(error, null, callback);
    }
  }

  static async findAll(options, callback) {
    try {
      const result = await WhitelistMobiles.findAll(options);
      return handleCallback(null, result, callback);
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return handleCallback(error, null, callback);
    }
  }

  static async destroy(options, callback) {
    try {
      const affectedCount = await WhitelistMobiles.destroy(options);
      return handleCallback(null, affectedCount, callback);
    } catch (error) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(error);
      return handleCallback(error, null, callback);
    }
  }
}
