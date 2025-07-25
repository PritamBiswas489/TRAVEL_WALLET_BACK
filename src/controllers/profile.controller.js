import db from "../databases/models/index.js";
import "../config/environment.js";
import { profileEditValidator } from "../validators/profileedit.validator.js";
import { upload } from "./uploadProfileImage.controller.js";
import { hashStr, compareHashedStr } from "../libraries/auth.js";
import { updatepinValidator } from "../validators/updatepin.validator.js";
import * as Sentry from "@sentry/node";
import UserService from "../services/user.service.js";
import PushNotificationService from "../services/pushNotification.service.js";
import NotificationService from "../services/notification.service.js";

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
      const updatedData = { name: payload.name, email: payload.email, address: payload.address, dob: payload.dob, language: payload.language };

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
  static async sendPushNotification(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;
    return new Promise((resolve) => {
      const title = payload?.title || "Hi from Travel Wallet";
      const body =
        payload?.body ||
        "Dummy push notification for testing purposes.Ignore it.";
      PushNotificationService.sendNotification(
        { userId: user.id, title, body, data: { action: 'testing_message' } },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message),
                reason: i18n.__("PUSH_NOTIFICATION_ERROR"),
              },
            });
          }

          return resolve({
            status: 200,
            data: response,
            message: i18n.__("PUSH_NOTIFICATION_SUCCESS"),
            error: {},
          });
        }
      );
    });
  }

  static async getUserNotifications(request) {
    const {
      headers: { i18n },
      payload,
      user,
    } = request;

    try {

      const [notifications, totalCount, totalUnread] = await Promise.all([
        NotificationService.getNotifications(user.id, payload?.page || 1, payload?.limit || 10),
        NotificationService.countNotifications(user.id),
        NotificationService.countUnreadNotifications(user.id)
      ]);

      return {
        status: 200,
        data: {
          notifications,
          totalCount,
          totalUnread
        },
        message: i18n.__("USER_NOTIFICATIONS_FETCHED_SUCCESSFULLY"),
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
  static async markNotificationAsRead(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const notificationId = payload.notificationId;

      if (!notificationId) {
        return {
          status: 400,
          data: [],
          error: { message: i18n.__("NOTIFICATION_ID_REQUIRED") },
        };
      }

      const notification = await NotificationService.markAsRead(user.id, notificationId);

      if (!notification) {
        return {
          status: 404,
          data: [],
          error: { message: i18n.__("NOTIFICATION_NOT_FOUND") },
        };
      }

      return {
        status: 200,
        data: notification,
        message: i18n.__("NOTIFICATION_MARKED_AS_READ"),
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
  static async markAllNotificationsAsRead(request) {
    const {
      headers: { i18n },
      user,
    } = request;

    try {
      const updatedCount = await NotificationService.markAllAsReads(user.id);

      if (updatedCount === 0) {
        return {
          status: 404,
          data: [],
          error: { message: i18n.__("NO_UNREAD_NOTIFICATIONS_FOUND") },
        };
      }

      return {
        status: 200,
        data: { updatedCount },
        message: i18n.__("ALL_NOTIFICATIONS_MARKED_AS_READ"),
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
  static async getLastUnreadNotification(request) {
    const {
      headers: { i18n },
      user,
    } = request;

    try {
      const lastNotification = await NotificationService.getLastUnreadNotification(user.id);

      if (!lastNotification) {
        return {
          status: 404,
          data: [],
          error: { message: i18n.__("NO_NOTIFICATIONS_FOUND") },
        };
      }

      return {
        status: 200,
        data: lastNotification,
        message: i18n.__("LAST_NOTIFICATION_FETCHED_SUCCESSFULLY"),
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
  static async getUnreadNotificationsCount(request) {
    const {
      headers: { i18n },
      user,
    } = request;

    try {
      const unreadCount = await NotificationService.countUnreadNotifications(user.id);

      return {
        status: 200,
        data: { unreadCount },
        message: i18n.__("UNREAD_NOTIFICATIONS_COUNT_FETCHED_SUCCESSFULLY"),
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
  static async getLastPendingTransferNotification(request) {
    const {
      headers: { i18n },
      user,
    } = request;

    try {
      const lastNotification = await NotificationService.getLastPendingTransferNotification(user.id);
      if (!lastNotification) {
        return {
          status: 404,
          data: [],
          error: { message: i18n.__("NO_PENDING_TRANSFER_NOTIFICATIONS_FOUND") },
        };
      }

      return {
        status: 200,
        data: lastNotification,
        message: i18n.__("LAST_PENDING_TRANSFER_NOTIFICATION_FETCHED_SUCCESSFULLY"),
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
