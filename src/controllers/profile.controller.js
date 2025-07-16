import db from "../databases/models/index.js";
import "../config/environment.js";
import { profileEditValidator } from "../validators/profileedit.validator.js";
import { upload } from "./uploadProfileImage.controller.js";
import { hashStr, compareHashedStr } from "../libraries/auth.js";
import { updatepinValidator } from "../validators/updatepin.validator.js";
import * as Sentry from "@sentry/node";
import UserService from "../services/user.service.js";

const { User, Op, UserKyc, UserWallet, UserFcm } = db;

export default class ProfileController {
  /**
   * Get user profile details
   */
  static async getProfileDetails(request) {
    const {
      headers: { i18n },
      user,
    } = request;

    try {
      const userDetails = await UserService.getUserDetails(user.id);

      if (userDetails?.avatar) {
        userDetails.avatar = `${process.env.BASE_URL}/${userDetails.avatar}`;
      }

      return {
        status: 200,
        data: userDetails,
        message: "",
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const updatedData = { name: payload.name, email: payload.email };

      const [validationError, validatedData] = await profileEditValidator(
        updatedData,
        i18n
      );
      if (validationError) return validationError;

      const userDetails = await User.findOne({ where: { id: user.id } });

      if (!userDetails) {
        return {
          status: 404,
          data: [],
          error: { message: i18n.__("USER_NOT_FOUND", { id: user.id }) },
        };
      }

      await userDetails.update(validatedData);

      return {
        status: 200,
        data: validatedData,
        message: i18n.__("PROFILE_UPDATED_SUCCESSFULLY"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }

  /**
   * Update user profile avatar
   */
  static async updateProfileAvatar(request) {
    const {
      headers: { i18n },
      user,
    } = request;

    try {
      if (!request.file) {
        return {
          status: 400,
          data: [],
          error: { message: i18n.__("NO_FILE_UPLOADED") },
        };
      }

      const userDetails = await User.findOne({ where: { id: user.id } });

      if (!userDetails) {
        return {
          status: 404,
          data: [],
          error: { message: i18n.__("USER_NOT_FOUND", { id: user.id }) },
        };
      }

      await userDetails.update({ avatar: `uploads/${request.file.filename}` });

      return {
        status: 200,
        message: i18n.__("IMAGE_UPLOADED_SUCCESSFULLY"),
        filename: request.file.filename,
        path: `${process.env.BASE_URL}/uploads/${request.file.filename}`,
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }

  /**
   * Update user PIN
   */
  static async updatePin(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const updatedData = {
        pinCode: payload.pinCode,
        existingPinCode: payload.existingPinCode,
      };

      const [validationError, validatedData] = await updatepinValidator(
        updatedData,
        i18n
      );
      if (validationError) return validationError;

      const userDetails = await User.findOne({ where: { id: user.id } });

      if (!userDetails) {
        return {
          status: 404,
          data: [],
          error: {
            message: i18n.__("USER_NOT_FOUND_WITH_ID", { id: user.id }),
          },
        };
      }

      const isPinCodeValid = await compareHashedStr(
        validatedData?.existingPinCode,
        userDetails?.password
      );

      if (!isPinCodeValid) {
        return {
          status: 400,
          data: [],
          error: { message: i18n.__("EXISTING_PIN_CODE_INVALID") },
        };
      }

      await userDetails.update({
        password: await hashStr(validatedData?.pinCode),
      });

      return {
        status: 200,
        data: validatedData,
        message: i18n.__("PIN_UPDATED_SUCCESSFULLY"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }

  /**
   * Remove user account
   */
  static async removeAccount(request) {
    const {
      headers: { i18n },
      user,
    } = request;

    try {
      const userDetails = await User.findOne({ where: { id: user.id } });

      if (!userDetails) {
        return {
          status: 404,
          data: [],
          error: {
            message: i18n.__("USER_NOT_FOUND_WITH_ID", { id: user.id }),
          },
        };
      }

      await userDetails.destroy();

      return {
        status: 200,
        data: [],
        message: i18n.__("ACCOUNT_REMOVED_SUCCESSFULLY"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }

  static async saveFcmToken(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const fcmToken = payload.fcmToken;

      if (!fcmToken) {
        return {
          status: 400,
          data: [],
          error: { message: i18n.__("FCM_TOKEN_REQUIRED") },
        };
      }

      let userFcm = await UserFcm.findOne({ where: { userId: user.id } });

      if (!userFcm) {
        userFcm = await UserFcm.create({ userId: user.id, fcmToken });
      } else {
        await userFcm.update({ fcmToken });
      }

      return {
        status: 200,
        data: { fcmToken: userFcm.fcmToken },
        message: i18n.__("FCM_TOKEN_SAVED_SUCCESSFULLY"),
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }
}
