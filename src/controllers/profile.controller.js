import db from "../databases/models/index.js";
import "../config/environment.js";
import { profileEditValidator } from "../validators/profileedit.validator.js";
import { upload } from "./uploadProfileImage.controller.js";
import { hashStr, compareHashedStr } from "../libraries/auth.js";
import { updatepinValidator } from "../validators/updatepin.validator.js";
import { verifyPinValidator } from "../validators/verifiy.validator.js";
import * as Sentry from "@sentry/node";
import UserService from "../services/user.service.js";

import NotificationService from "../services/notification.service.js";
import WhitelistMobilesService from "../services/whitelistMobiles.service.js";
import userSettingsService from "../services/userSettings.service.js";
import ContactListService from "../services/contactList.service.js";
import { enqueueUserNotification } from "../queues/pushNotification.queue.js";
import UserAccRemoveService from "../services/userAccRemoveService.js";
import ActiveOperationService, {
  OP_TYPE,
} from "../services/activeOperations.service.js";

const {
  User,
  Op,
  UserKyc,
  UserWallet,
  UserFcm,
  UserCard,
  WalletPelePayment,
  WalletTransaction,
  ApiLogs,
  Transfer,
  TransferRequests,
  UserSettings,
  Notification,
  TripBudgets,
} = db;

const getTodayDate = () => {
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: process.env.TIMEZONE || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const { year, month, day } = Object.fromEntries(
    dateParts.map(({ type, value }) => [type, value]),
  );
  return `${year}-${month}-${day}`;
};

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
      const updatedData = {
        name: payload.name,
        email: payload.email,
        address: payload.address,
        dob: payload.dob,
        language: payload.language,
        passportId: payload.passportId,
        passportExpiryDate: payload.passportExpiryDate,
        nationality: payload.nationality,
      };

      const [validationError, validatedData] = await profileEditValidator(
        updatedData,
        i18n,
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

  static async updateLanguage(request) {
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
          error: { message: i18n.__("USER_NOT_FOUND", { id: user.id }) },
        };
      }

      await userDetails.update({ language: request.payload.language });

      return {
        status: 200,
        data: { language: request.payload.language },
        message: i18n.__("LANGUAGE_UPDATED_SUCCESSFULLY"),
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
        i18n,
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
        userDetails?.password,
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

  static async verifyPin(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const [validationError, validatedData] = await verifyPinValidator(
        {
          pinCode: payload.pinCode,
        },
        i18n,
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
        validatedData?.pinCode,
        userDetails?.password,
      );

      if (!isPinCodeValid) {
        return {
          status: 400,
          data: [],
          error: { message: i18n.__("PIN_CODE_INVALID") },
        };
      }

      return {
        status: 200,
        data: validatedData,
        message: i18n.__("PIN_VERIFIED_SUCCESSFULLY"),
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

  static async executeUserAccountRemoval(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const res = await UserAccRemoveService.executeUserAccountRemoval(
        user.id,
        i18n,
        payload,
      );
      return {
        status: 200,
        data: res?.data || [],
        message: i18n.__("USER_ACCOUNT_REMOVAL_EXECUTED_SUCCESSFULLY"),
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
      await UserAccRemoveService.removeUserAccount(user.id);
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
      headers: { i18n, deviceid },
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

      let userFcm = await UserFcm.findOne({
        where: { userId: user.id, deviceID: deviceid },
      });

      if (!userFcm) {
        await UserFcm.destroy({
          where: { userId: user.id, deviceID: deviceid },
        });
        userFcm = await UserFcm.create({
          userId: user.id,
          fcmToken,
          deviceID: deviceid,
        });
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
      try {
        enqueueUserNotification({
          userId: user.id,
          title,
          body,
          data: { action: "testing_message" },
        });
      } catch (e) {
        process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
        console.error("Error sending push notification:", e);
        return resolve({
          status: 500,
          data: [],
          error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
        });
      }
      return resolve({
        status: 200,
        data: [],
        message: i18n.__("PUSH_NOTIFICATION_SENT"),
        error: {},
      });
    });
  }

  static async getUserNotifications(request) {
    const {
      headers: { i18n },
      payload,
      user,
    } = request;

    try {
      const [notifications, totalCount] = await Promise.all([
        NotificationService.getNotifications(
          user.id,
          payload?.page || 1,
          payload?.limit || 10,
        ),
        NotificationService.countUnreadNotifications(user.id),
      ]);

      return {
        status: 200,
        data: {
          notifications,
          totalCount,
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

      const notification = await NotificationService.markAsRead(
        user.id,
        notificationId,
      );

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
      const lastNotification =
        await NotificationService.getLastUnreadNotification(user.id);

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
      const unreadCount = await NotificationService.countUnreadNotifications(
        user.id,
      );

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
  static async getNotificationBellIconColor(request) {
    const {
      headers: { i18n },
      user,
    } = request;

    try {
      const color = await NotificationService.getNotificationBellIconColor(
        user.id,
      );

      return {
        status: 200,
        data: { color },
        message: i18n.__("NOTIFICATION_BELL_ICON_COLOR_FETCHED_SUCCESSFULLY"),
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
      const lastNotification =
        await NotificationService.getLastPendingTransferNotification(user.id);
      if (!lastNotification) {
        return {
          status: 404,
          data: [],
          error: {
            message: i18n.__("NO_PENDING_TRANSFER_NOTIFICATIONS_FOUND"),
          },
        };
      }

      return {
        status: 200,
        data: lastNotification,
        message: i18n.__(
          "LAST_PENDING_TRANSFER_NOTIFICATION_FETCHED_SUCCESSFULLY",
        ),
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
  static async addMobileNumberToContactList(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    return new Promise((resolve) => {
      ContactListService.addMobileNumbers(user.id, payload, (err, response) => {
        if (err) {
          return resolve({
            status: 400,
            data: null,
            error: {
              message: i18n.__(
                err.message || "FAILED_TO_ADD_MOBILE_NUMBERS_TO_CONTACT_LIST",
              ),
              reason: err.message,
            },
          });
        }
        return resolve({
          status: 200,
          data: response.data,
          message: i18n.__("MOBILE_NUMBERS_ADDED_SUCCESSFULLY_TO_CONTACT_LIST"),
          error: null,
        });
      });
    });
  }
  static async clearContactList(request) {
    const {
      headers: { i18n },
      user,
    } = request;

    const type = request?.payload?.type || "all"; // all or whitelist

    return new Promise((resolve) => {
      ContactListService.clearContactList(user.id, type, (err, response) => {
        if (err) {
          return resolve({
            status: 400,
            data: null,
            error: {
              message: i18n.__(err.message || "FAILED_TO_CLEAR_CONTACT_LIST"),
              reason: err.message,
            },
          });
        }
        return resolve({
          status: 200,
          data: response.data,
          message: i18n.__("CONTACT_LIST_CLEARED_SUCCESSFULLY"),
          error: null,
        });
      });
    });
  }
  static async addMobileNumberToWhiteList(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    // console.log(payload);
    return new Promise((resolve) => {
      WhitelistMobilesService.create(
        { userId: user.id, ...payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_ADD_MOBILE_NUMBER_TO_WHITELIST",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("MOBILE_NUMBER_ADDED_SUCCESSFULLY_TO_WHITELIST"),
            error: null,
          });
        },
      );
    });
  }
  static async getMobileNumberWhiteList(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    return new Promise((resolve) => {
      WhitelistMobilesService.findAll(
        { userId: user.id, type: payload.type ?? "" },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_FETCH_MOBILE_NUMBER_WHITELIST",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("MOBILE_NUMBER_WHITELIST_FETCHED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async deleteMobileNumberFromWhiteList(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    return new Promise((resolve) => {
      WhitelistMobilesService.destroy(
        {
          where: { userId: user.id, id: payload.id },
        },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  "FAILED_TO_DELETE_MOBILE_NUMBER_FROM_WHITELIST",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response,
            message: i18n.__(
              "MOBILE_NUMBER_DELETED_SUCCESSFULLY_FROM_WHITELIST",
            ),
            error: null,
          });
        },
      );
    });
  }
  static async setRequestMoneyRestriction(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    return new Promise((resolve) => {
      if (
        !["everyone", "noone", "contactonly", "whitelist"].includes(
          payload?.restriction,
        )
      ) {
        return resolve({
          status: 400,
          data: null,
          error: {
            message: i18n.__("INVALID_REQUEST_MONEY_RESTRICTION"),
            reason: "INVALID_REQUEST_MONEY_RESTRICTION",
          },
        });
      }
      userSettingsService.updateSettings(
        "request_contact_restriction",
        payload.restriction,
        user.id,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_SET_REQUEST_MONEY_RESTRICTION",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("REQUEST_MONEY_RESTRICTION_SET_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async setSendMoneyRestriction(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    return new Promise((resolve) => {
      if (
        !["everyone", "noone", "contactonly", "whitelist"].includes(
          payload?.restriction,
        )
      ) {
        return resolve({
          status: 400,
          data: null,
          error: {
            message: i18n.__("INVALID_SEND_MONEY_RESTRICTION"),
            reason: "INVALID_SEND_MONEY_RESTRICTION",
          },
        });
      }
      userSettingsService.updateSettings(
        "send_money_restriction",
        payload.restriction,
        user.id,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message || "FAILED_TO_SET_SEND_MONEY_RESTRICTION",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("SEND_MONEY_RESTRICTION_SET_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async checkMobileNumberInContactList(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    return new Promise((resolve) => {
      ContactListService.checkMobileNumberInContactList(
        user.id,
        payload,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message ||
                    "FAILED_TO_CHECK_MOBILE_NUMBER_IN_CONTACT_LIST",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("MOBILE_NUMBER_CHECKED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }

  static async removeMobileNumberFromContactList(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    return new Promise((resolve) => {
      ContactListService.removeMobileNumberFromContactList(
        user.id,
        payload,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(
                  err.message ||
                    "FAILED_TO_REMOVE_MOBILE_NUMBER_FROM_CONTACT_LIST",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__(
              "MOBILE_NUMBER_REMOVED_SUCCESSFULLY_FROM_CONTACT_LIST",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async clearDeviceId(request) {
    const {
      headers: { i18n, deviceid },
      user,
      payload,
    } = request;

    return new Promise((resolve) => {
      UserService.clearDeviceId(
        user.id,
        deviceid,
        false,
        i18n,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "FAILED_TO_CLEAR_DEVICE_ID"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("DEVICE_ID_CLEARED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async deleteDeviceId(request) {
    const {
      headers: { i18n, deviceid },
      user,
      payload,
    } = request;

    if (deviceid === payload?.deviceId) {
      return {
        status: 400,
        data: null,
        error: {
          message: i18n.__("CANNOT_DELETE_CURRENTLY_USED_DEVICE_ID"),
          reason: "CANNOT_DELETE_CURRENTLY_USED_DEVICE_ID",
        },
      };
    }

    return new Promise((resolve) => {
      UserService.clearDeviceId(
        user.id,
        payload.deviceId,
        true,
        i18n,
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: i18n.__(err.message || "FAILED_TO_DELETE_DEVICE_ID"),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: i18n.__("DEVICE_ID_DELETED_SUCCESSFULLY"),
            error: null,
          });
        },
      );
    });
  }
  static async checkPendingPaymentRefundProcessInQueue(request) {
    const {
      headers: { i18n },
      user,
      payload,
    } = request;

    try {
      const [counts, listRefunds, listPayment] = await Promise.all([
        ActiveOperationService.getCounts(user.id),
        ActiveOperationService.list(user.id, OP_TYPE.REFUND),
        ActiveOperationService.list(user.id, OP_TYPE.PAYMENT),
      ]);
      return {
        status: 200,
        data: {
          counts,
          listRefunds,
          listPayment,
        },
        message: i18n.__("PENDING_PAYMENT_REFUND_PROCESS_STATUS"),
        error: null,
      };
    } catch (err) {
      return {
        status: 400,
        data: null,
        error: {
          message: i18n.__(
            err.message || "FAILED_TO_CHECK_PENDING_PAYMENT_REFUND_PROCESS",
          ),
          reason: err.message,
        },
      };
    }
  }

  static async setTripBudget(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const {
        trip_id,
        countryCode,
        total_budget,
        daily_budget,
        currency,
        category_budgets,
        startDate,
        endDate,
      } = payload ?? {};
      const isValidDate = (value) =>
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
        new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
      const isValidAmount = (value) =>
        (typeof value === "number" || typeof value === "string") &&
        value !== "" &&
        Number.isFinite(Number(value)) &&
        Number(value) >= 0;
      const hasTripId =
        trip_id !== undefined && trip_id !== null && trip_id !== "";
      const normalizedTripId = hasTripId ? Number(trip_id) : null;
      const normalizedCountryCode =
        typeof countryCode === "string" ? countryCode.trim().toUpperCase() : "";
      const today = getTodayDate();

      if (
        (hasTripId &&
          (!Number.isSafeInteger(normalizedTripId) || normalizedTripId <= 0)) ||
        !/^[A-Z]{2,3}$/.test(normalizedCountryCode) ||
        !isValidAmount(total_budget) ||
        !isValidAmount(daily_budget) ||
        Number(daily_budget) >= Number(total_budget) ||
        typeof currency !== "string" ||
        !/^[A-Z]{3}$/.test(currency) ||
        !Array.isArray(category_budgets) ||
        !category_budgets.every(
          (category) =>
            category &&
            Number.isSafeInteger(Number(category.category_id)) &&
            Number(category.category_id) > 0 &&
            isValidAmount(category.amount),
        ) ||
        !isValidDate(startDate) ||
        startDate < today ||
        !isValidDate(endDate) ||
        endDate < startDate
      ) {
        return {
          status: 400,
          data: [],
          error: { message: i18n.__("INVALID_TRIP_BUDGET_PAYLOAD") },
        };
      }

      const existingBudget = hasTripId
        ? await TripBudgets.findByPk(normalizedTripId)
        : null;
      const duplicateBudget = await TripBudgets.findOne({
        where: {
          countryCode: normalizedCountryCode,
          userId: user.id,
          startDate,
          endDate,
          ...(existingBudget && {
            id: { [Op.ne]: existingBudget.id },
          }),
        },
      });

      if (duplicateBudget) {
        return {
          status: 409,
          data: [],
          error: {
            message: i18n.__("DUPLICATE_TRIP_BUDGET"),
          },
        };
      }

      const budgetData = {
        countryCode: normalizedCountryCode,
        total_budget,
        daily_budget,
        currency,
        category_budgets,
        startDate,
        endDate,
        userId: user.id,
      };
      const tripBudget = existingBudget
        ? await existingBudget.update(budgetData)
        : await TripBudgets.create(budgetData);

      return {
        status: 200,
        data: tripBudget,
        message: "Trip budget saved successfully",
        error: {},
      };
    } catch (e) {
      process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
      if (e.name === "SequelizeUniqueConstraintError") {
        return {
          status: 409,
          data: [],
          error: {
            message: i18n.__("DUPLICATE_TRIP_BUDGET"),
          },
        };
      }
      return {
        status: 500,
        data: [],
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      };
    }
  }

  static async getUpcomingTrip(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    try {
      const countryCode =
        typeof payload?.countryCode === "string"
          ? payload.countryCode.trim().toUpperCase()
          : "";

      if (!/^[A-Z]{2,3}$/.test(countryCode)) {
        return {
          status: 400,
          data: [],
          error: { message: i18n.__("INVALID_COUNTRY_CODE") },
        };
      }

      const today = getTodayDate();
      const upcomingTrip = await TripBudgets.findOne({
        where: {
          countryCode,
          userId: user.id,
          startDate: { [Op.gte]: today },
        },
        order: [
          ["startDate", "ASC"],
          ["endDate", "ASC"],
        ],
      });

      if (!upcomingTrip) {
        return {
          status: 200,
          data: [],
          message: i18n.__("NO_UPCOMING_TRIP_FOUND"),
        };
      }

      return {
        status: 200,
        data: upcomingTrip,
        message: i18n.__("UPCOMING_TRIP_RETRIEVED_SUCCESSFULLY"),
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

  static async removeTripBudget(request) {
    const {
      payload,
      headers: { i18n },
    } = request;

    try {
      const tripId = Number(payload?.tripId);
      if (!Number.isSafeInteger(tripId) || tripId <= 0) {
        return {
          status: 400,
          data: [],
          error: { message: i18n.__("INVALID_TRIP_BUDGET_ID") },
        };
      }

      const tripBudget = await TripBudgets.findByPk(tripId);
      if (!tripBudget) {
        return {
          status: 404,
          data: [],
          error: { message: i18n.__("TRIP_BUDGET_NOT_FOUND") },
        };
      }

      await tripBudget.destroy();
      return {
        status: 200,
        data: { id: tripBudget.id },
        message: i18n.__("TRIP_BUDGET_REMOVED_SUCCESSFULLY"),
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
