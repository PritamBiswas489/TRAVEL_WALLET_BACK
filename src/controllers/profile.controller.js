import db from "../databases/models/index.js";
import "../config/environment.js";
import { profileEditValidator } from "../validators/profileedit.validator.js";
import { upload } from "./uploadProfileImage.controller.js";
import { hashStr, compareHashedStr, generateToken } from "../libraries/auth.js";
import { updatepinValidator } from "../validators/updatepin.validator.js";

const { User, Op } = db;
/**
 * Get user profile details
 * @param {*} request
 * @returns
 */

export const getProfileDetails = async (request) => {
  const {
    payload,
    headers: { i18n },
    user,
  } = request;

  try {
    const userDetails = await User.findOne({
      where: { id: user.id },
      attributes: ["id", "name", "email", "phoneNumber", "role", "avatar"],
    });
    if (
      userDetails.avatar &&
      userDetails.avatar !== null &&
      userDetails.avatar !== undefined &&
      userDetails.avatar !== ""
    ) {
      userDetails.avatar = process.env.BASE_URL + "/" + userDetails.avatar;
    }
    return {
      status: 200,
      data: userDetails,
      message: "",
      error: {},
    };
  } catch (e) {
    return {
      status: 500,
      data: [],
      error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
    };
  }
};
/**
 *  Update user profile
 * @param {*} request
 * @returns
 */

export const updateProfile = async (request) => {
  const {
    payload,
    headers: { i18n },
    user,
  } = request;
  try {
    const updatedData = {
      name: payload.name,
      email: payload.email,
    };

    const [validationError, validatedData] =
      await profileEditValidator(updatedData, i18n);
    if (validationError) {
      return validationError;
    }

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
    return {
      status: 500,
      data: [],
      error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
    };
  }
};
/**
 * Update user profile avatar
 * @param {*} request
 * @returns
 */

export const updateProfileAvatar = async (request) => {
  const {
    payload,
    headers: { i18n },
    user,
  } = request;
  try {
    //upload avatar in folder from input file and get the path

    if (!request.file) {
      return res.status(400).json({ error: i18n.__("NO_FILE_UPLOADED") });
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
      path: process.env.BASE_URL + `/uploads/${request.file.filename}`,
    };
  } catch (e) {
    return {
      status: 500,
      data: [],
      error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
    };
  }
};
/**
 * Update pin
 * @param {*} request
 */

export const updatePin = async (request) => {
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

    const [validationError, validatedData] =
      await updatepinValidator(updatedData, i18n);

    if (validationError) {
      return validationError;
    }

    const userDetails = await User.findOne({ where: { id: user.id } });

    const isPinCodeValid = await compareHashedStr(
      validatedData?.existingPinCode,
      userDetails?.password
    );
    if (!isPinCodeValid) {
      return {
        status: 400,
        data: [],
        error: {
          message: i18n.__("EXISTING_PIN_CODE_INVALID"),
        },
      };
    }

    if (!userDetails) {
      return {
        status: 404,
        data: [],
        error: { message: i18n.__("USER_NOT_FOUND_WITH_ID", { id: user.id }) },
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
    return {
      status: 500,
      data: [],
      error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
    };
  }
};

/**
 * Remove user account
 * @param {*} request
 * @returns
 */

export const removeAccount = async (request) => {
  const {
    payload,
    headers: { i18n },
    user,
  } = request;
  try {
    const userDetails = await User.findOne({ where: { id: user.id } });
    if (!userDetails) {
      return {
        status: 404,
        data: [],
        error: { message: i18n.__("USER_NOT_FOUND_WITH_ID", { id: user.id }) },
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
    return {
      status: 500,
      data: [],
      error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
    };
  }
};
