import ControlledProfileService from "../services/controlledProfile.service.js";
import { translateValue } from "../libraries/tranlateValue.js";
export default class ControlledProfileController {
  static async createControlledProfile(request) {
    const {
      payload,
      headers: { i18n },
      user,
    } = request;

    return new Promise((resolve) => {
      ControlledProfileService.createControlledProfile(
        { userId: user.id, i18n, payload },
        (err, response) => {
          if (err) {
            return resolve({
              status: 400,
              data: null,
              error: {
                message: translateValue(
                  i18n,
                  err.message,
                  "FAILED_CONTROLLED_PROFILE_CREATION",
                ),
                reason: err.message,
              },
            });
          }
          return resolve({
            status: 200,
            data: response.data,
            message: translateValue(
              i18n,
              "CONTROLLED_PROFILE_CREATED_SUCCESSFULLY",
            ),
            error: null,
          });
        },
      );
    });
  }

  static async listConnectedAccounts({ headers: { i18n }, user }) {
    return new Promise((resolve) => {
      ControlledProfileService.listConnectedAccounts({ userId: user.id }, (err, response) => {
        if (err) {
          return resolve({
            status: 500,
            data: null,
            error: { message: translateValue(i18n, err.message), reason: err.message },
          });
        }
        return resolve({
          status: 200,
          data: response.data,
          message: translateValue(i18n, "CONNECTED_ACCOUNTS_RETRIEVED_SUCCESSFULLY"),
          error: null,
        });
      });
    });
  }

  static async getConnectedAccount({ headers: { i18n }, user, id }) {
    return new Promise((resolve) => {
      ControlledProfileService.getConnectedAccount({ userId: user.id, id }, (err, response) => {
        if (err) {
          const status = err.message === "CONNECTED_ACCOUNT_NOT_FOUND"
            ? 404
            : err.message === "CONTROLLED_PROFILE_ID_INVALID" ? 400 : 500;
          return resolve({
            status,
            data: null,
            error: { message: translateValue(i18n, err.message), reason: err.message },
          });
        }
        return resolve({
          status: 200,
          data: response.data,
          message: translateValue(i18n, "CONNECTED_ACCOUNT_RETRIEVED_SUCCESSFULLY"),
          error: null,
        });
      });
    });
  }

  static async updateConnectedAccount({ headers: { i18n }, user, id, payload }) {
    return new Promise((resolve) => {
      ControlledProfileService.updateConnectedAccount({ userId: user.id, id, payload }, (err, response) => {
        if (err) {
          const status = err.message === "CONNECTED_ACCOUNT_NOT_FOUND"
            ? 404 : err.message === "CONNECTED_ACCOUNT_UPDATE_FAILED" ? 500 : 400;
          return resolve({
            status,
            data: null,
            error: { message: translateValue(i18n, err.message), reason: err.message },
          });
        }
        return resolve({
          status: 200,
          data: response.data,
          message: translateValue(i18n, "CONNECTED_ACCOUNT_UPDATED_SUCCESSFULLY"),
          error: null,
        });
      });
    });
  }

  static async regenerateActivationCode({ headers: { i18n }, user, id }) {
    return new Promise((resolve) => {
      ControlledProfileService.regenerateActivationCode({ userId: user.id, id }, (err, response) => {
        if (err) {
          const status = err.message === "CONNECTED_ACCOUNT_NOT_FOUND"
            ? 404
            : err.message === "CONTROLLED_PROFILE_ID_INVALID" ? 400 : 500;
          return resolve({
            status,
            data: null,
            error: { message: translateValue(i18n, err.message), reason: err.message },
          });
        }
        return resolve({
          status: 200,
          data: response.data,
          message: translateValue(i18n, "ACTIVATION_CODE_REGENERATED_SUCCESSFULLY"),
          error: null,
        });
      });
    });
  }

  static async updateConnectedAccountStatus({ headers: { i18n }, user, id, payload }) {
    return new Promise((resolve) => {
      ControlledProfileService.updateConnectedAccountStatus({ userId: user.id, id, payload }, (err, response) => {
        if (err) {
          const status = err.message === "CONNECTED_ACCOUNT_NOT_FOUND"
            ? 404
            : ["CONTROLLED_PROFILE_ID_INVALID", "CONTROLLED_PROFILE_STATUS_INVALID"].includes(err.message) ? 400 : 500;
          return resolve({
            status,
            data: null,
            error: { message: translateValue(i18n, err.message), reason: err.message },
          });
        }
        return resolve({
          status: 200,
          data: response.data,
          message: translateValue(i18n, "CONNECTED_ACCOUNT_STATUS_UPDATED"),
          error: null,
        });
      });
    });
  }

  static async deleteConnectedAccount({ headers: { i18n }, user, id }) {
    return new Promise((resolve) => {
      ControlledProfileService.deleteConnectedAccount({ userId: user.id, id }, (err, response) => {
        if (err) {
          const status = err.message === "CONNECTED_ACCOUNT_NOT_FOUND"
            ? 404
            : err.message === "CONTROLLED_PROFILE_ID_INVALID" ? 400 : 500;
          return resolve({
            status,
            data: null,
            error: { message: translateValue(i18n, err.message), reason: err.message },
          });
        }
        return resolve({
          status: 200,
          data: response.data,
          message: translateValue(i18n, "CONNECTED_ACCOUNT_DELETED"),
          error: null,
        });
      });
    });
  }
}
