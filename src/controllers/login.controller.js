import { AuthCallsCredentialListMappingList } from "twilio/lib/rest/api/v2010/account/sip/domain/authTypes/authCallsMapping/authCallsCredentialListMapping.js";
import db from "../databases/models/index.js";
import { generateOtp } from "../libraries/utility.js";
import {
  otpWhatsappService,
  otpSmsService,
} from "../services/messages.service.js";
import { registerValidator } from "../validators/register.validator.js";
import { hashStr, compareHashedStr, generateToken } from "../libraries/auth.js";
const { User, Op } = db;

/**
 * Send OTP to mobile number
 * @param {*} request
 * @returns
 */
export const sendOtpToMobileNumber = async (request) => {
  const {
    payload,
    headers: { i18n },
  } = request;
  try {
    const otp = generateOtp(); // Generate a 4-digit OTP
    const phoneNumber = payload.phoneNumber;
    const phoneRegex = /^\+\d{1,3}\d{4,14}$/; // Example regex for international phone numbers
    if (!phoneRegex.test(phoneNumber)) {
      return {
        status: 400,
        data: [],
        error: {
          message: i18n.__("INVALID_PHONE_NUMBER_FORMAT"),
        },
      };
    }
    // Here you would typically send the OTP to the phone number using an SMS service
    const [whatsappResult, smsResult] = await Promise.all([
      otpWhatsappService(phoneNumber, otp),
      otpSmsService(phoneNumber, otp),
    ]);
    return {
      status: 200,
      data: {
        whatsapp: whatsappResult,
        sms: smsResult,
      },
      message: i18n.__("OTP_SENT_SUCCESSFULLY"),
      error: {},
    };
  } catch (e) {
    return {
      status: 500,
      data: [],
      error: {
        message: i18n.__("OTP_SEND_FAILED"),
        reason: e.message,
      },
    };
  }
};
/**
 * Create or verify pin by phone number
 * @param {*} request
 * @returns
 */
export const createOrVerifyPinByPhoneNumber = async (request) => {
   const { payload, headers: { i18n } } = request;
  try {
   
    const insertedData = {
      phoneNumber: payload.phoneNumber,
      pinCode: payload.pinCode,
    };

    const [validationError, validatedData] =
      await registerValidator(insertedData, i18n);
    if (validationError) {
      return validationError;
    }
    let isCreateNewUser = false;
    const checkUser = await User.findOne({
      where: { phoneNumber: validatedData?.phoneNumber },
    });
    if (!checkUser) {
      isCreateNewUser = true;
    }
    if (!isCreateNewUser) {
      const isPinCodeValid = await compareHashedStr(
        validatedData?.pinCode,
        checkUser?.password
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
      const jwtpayload = {
        id: checkUser.id,
        phoneNumber: checkUser.phoneNumber,
        role: checkUser.role,
      };
      const accessToken = await generateToken(
        jwtpayload,
        process.env.JWT_ALGO,
        process.env.ACCESS_TOKEN_SECRET_KEY,
        Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
      );
      const refreshToken = await generateToken(
        jwtpayload,
        process.env.JWT_ALGO,
        process.env.REFRESH_TOKEN_SECRET_KEY,
        Number(process.env.REFRESH_TOKEN_EXPIRES_IN)
      );

      return {
        status: 200,
        data: {
          accessToken,
          refreshToken,
        },
        message: i18n.__("SUCCESSFULLY_VERIFIED_PIN"),
        error: {},
      };
    }

    if (isCreateNewUser) {
      validatedData.password = await hashStr(validatedData?.pinCode);
      const newUser = await User.create({
        phoneNumber: validatedData?.phoneNumber,
        password: validatedData?.password,
      });
      if (!newUser) {
        return {
          status: 500,
          data: [],
          error: { message: i18n.__("FAILED_TO_CREATE_NEW_USER") },
        };
      }
      const jwtpayload = {
        id: newUser.id,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      };
      const accessToken = await generateToken(
        jwtpayload,
        process.env.JWT_ALGO,
        process.env.ACCESS_TOKEN_SECRET_KEY,
        Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
      );
      const refreshToken = await generateToken(
        jwtpayload,
        process.env.JWT_ALGO,
        process.env.REFRESH_TOKEN_SECRET_KEY,
        Number(process.env.REFRESH_TOKEN_EXPIRES_IN)
      );

      return {
        status: 200,
        data: {
          accessToken,
          refreshToken,
        },
        message: i18n.__("SUCCESSFULLY_CREATED_NEW_USER"),
        error: {},
      };
    }

    return {
      status: 200,
      data: validatedData,
      message: i18n.__("SUCCESSFULLY_CREATED_OR_VERIFIED_PIN"),
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
 * Update pin by phone number
 * @param {*} request
 * @returns
 */

export const updatePinByPhoneNumber = async (request) => {
   const { payload, headers: { i18n } } = request;
  try {
   
    const updatedData = {
      phoneNumber: payload.phoneNumber,
      pinCode: payload.pinCode,
    };

    const [validationError, validatedData] =
      await registerValidator(updatedData, i18n);
    if (validationError) {
      return validationError;
    }

    const user = await User.findOne({
      where: { phoneNumber: validatedData?.phoneNumber },
    });
    if (!user) {
      return {
        status: 404,
        data: [],
        error: {
          message: i18n.__("USER_NOT_FOUND_WITH_PHONE", { phone: validatedData?.phoneNumber }),
        },
      };
    }

    user.password = await hashStr(validatedData?.pinCode);
    await user.save();

    return {
      status: 200,
      data: {
        phoneNumber: user.phoneNumber,
      },
      message: i18n.__("SUCCESSFULLY_UPDATED_PIN"),
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
