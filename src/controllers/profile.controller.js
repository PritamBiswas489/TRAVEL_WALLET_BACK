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
  try {
    const { payload, user } = request;
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
      error: { message: "Something went wrong !", reason: e.message },
    };
  }
};
/**
 *  Update user profile
 * @param {*} request
 * @returns
 */

export const updateProfile = async (request) => {
  try {
    const { payload, user } = request;
    const updatedData = {
      name: payload.name,
      email: payload.email,
    };

    const [validationError, validatedData] =
      await profileEditValidator(updatedData);
    if (validationError) {
      return validationError;
    }

    const userDetails = await User.findOne({ where: { id: user.id } });
    if (!userDetails) {
      return {
        status: 404,
        data: [],
        error: { message: `User not found for id ${user.id}` },
      };
    }

    await userDetails.update(validatedData);

    return {
      status: 200,
      data: validatedData,
      message: "Profile updated successfully",
      error: {},
    };
  } catch (e) {
    return {
      status: 500,
      data: [],
      error: { message: "Something went wrong !", reason: e.message },
    };
  }
};
/**
 * Update user profile avatar
 * @param {*} request
 * @returns
 */

export const updateProfileAvatar = async (request) => {
  try {
    //upload avatar in folder from input file and get the path
    const { payload, user } = request;
    if (!request.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const userDetails = await User.findOne({ where: { id: user.id } });
    if (!userDetails) {
      return {
        status: 404,
        data: [],
        error: { message: `User not found for id ${user.id}` },
      };
    }
    await userDetails.update({ avatar: `uploads/${request.file.filename}` });
    return {
      status: 200,
      message: "Image uploaded successfully!",
      filename: request.file.filename,
      path: process.env.BASE_URL + `/uploads/${request.file.filename}`,
    };
  } catch (e) {
    return {
      status: 500,
      data: [],
      error: { message: "Something went wrong !", reason: e.message },
    };
  }
};
/**
 * Update pin
 * @param {*} request
 */

export const updatePin = async (request) => {
  try {
    const { payload, user } = request;
    const updatedData = {
      pinCode: payload.pinCode,
      existingPinCode: payload.existingPinCode,
    };

    const [validationError, validatedData] =
      await updatepinValidator(updatedData);

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
          message: `Existing pin code is not valid`,
        },
      };
    }

    if (!userDetails) {
      return {
        status: 404,
        data: [],
        error: { message: `User not found for id ${user.id}` },
      };
    }

    await userDetails.update({
      password: await hashStr(validatedData?.pinCode),
    });

    return {
      status: 200,
      data: validatedData,
      message: "Pin updated successfully",
      error: {},
    };
  } catch (e) {
    return {
      status: 500,
      data: [],
      error: { message: "Something went wrong !", reason: e.message },
    };
  }
};
