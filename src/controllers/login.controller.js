import db from "../databases/models/index.js";
import { generateOtp } from "../libraries/utility.js";
import * as Sentry from "@sentry/node";
import { otpWhatsappService, otpSmsService } from "../services/messages.service.js";
import { registerValidator } from "../validators/register.validator.js";
import { hashStr, compareHashedStr, generateToken } from "../libraries/auth.js";
import { setNewPinValidator } from "../validators/setNewPin.validator.js";

const { User, Op } = db;

export default class LoginController {

    /**
     * Send OTP to mobile number
     * @param {*} request
     * @returns
     */
    static async sendOtpToMobileNumber(request) {
        const { payload, headers: { i18n } } = request;

        try {
            const otp = generateOtp();
            const phoneNumber = payload.phoneNumber;
            const messageType = payload.messageType || "whatsapp";

            const phoneRegex = /^\+\d{1,3}\d{4,14}$/;
            if (!phoneRegex.test(phoneNumber)) {
                return {
                    status: 400,
                    data: [],
                    error: { message: i18n.__("INVALID_PHONE_NUMBER_FORMAT") }
                };
            }

            const [whatsappResult, smsResult] = await Promise.all([
                messageType === "whatsapp" ? otpWhatsappService(phoneNumber, otp) : null,
                messageType === "sms" ? otpSmsService(phoneNumber, otp) : null
            ]);

            if (messageType === 'sms' && smsResult?.error) {
                return {
                    status: 500,
                    data: [],
                    error: { message: i18n.__("SMS_SEND_FAILED"), reason: smsResult.error }
                };
            }

            if (messageType === 'whatsapp' && whatsappResult?.error) {
                return {
                    status: 500,
                    data: [],
                    error: { message: i18n.__("WHATSAPP_SEND_FAILED"), reason: whatsappResult.error }
                };
            }

            return {
                status: 200,
                data: { whatsapp: whatsappResult, sms: smsResult, otp },
                message: i18n.__("OTP_SENT_SUCCESSFULLY"),
                error: {}
            };

        } catch (e) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
            return {
                status: 500,
                data: [],
                error: { message: i18n.__("OTP_SEND_FAILED"), reason: e.message }
            };
        }
    }

    /**
     * Create or verify PIN by phone number
     * @param {*} request
     * @returns
     */
    static async createOrVerifyPinByPhoneNumber(request) {
        const { payload, headers: { i18n } } = request;

        try {
            const insertedData = {
                phoneNumber: payload.phoneNumber,
                pinCode: payload.pinCode,
                type: payload.type || "login"
            };

            const [validationError, validatedData] = await registerValidator(insertedData, i18n);
            if (validationError) return validationError;

            let isNewUser = false;

            const user = await User.findOne({ where: { phoneNumber: validatedData?.phoneNumber } });

            if (!user) {
                isNewUser = true;
            }

            if (!isNewUser) {
               if( validatedData.type === "login"){ // Login flow if user exists type login
                    const isPinCodeValid = await compareHashedStr(validatedData?.pinCode, user?.password);
                    if (!isPinCodeValid) {
                        return {
                            status: 400,
                            isNewUser,
                            data: [],
                            error: { message: i18n.__("EXISTING_PIN_CODE_INVALID") }
                        };
                    }
               } else if (validatedData.type === "register") { // Register flow if user exists type register
                   user.password = await hashStr(validatedData?.pinCode);
                   await user.save();
               }

                const jwtPayload = {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    role: user.role
                };

                const accessToken = await generateToken(
                    jwtPayload,
                    process.env.JWT_ALGO,
                    process.env.ACCESS_TOKEN_SECRET_KEY,
                    Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
                );

                const refreshToken = await generateToken(
                    jwtPayload,
                    process.env.JWT_ALGO,
                    process.env.REFRESH_TOKEN_SECRET_KEY,
                    Number(process.env.REFRESH_TOKEN_EXPIRES_IN)
                );

                return {
                    status: 200,
                    isNewUser,
                    data: { accessToken, refreshToken },
                    message: i18n.__("SUCCESSFULLY_VERIFIED_PIN"),
                    error: {}
                };
            }

            if (isNewUser) {
                validatedData.password = await hashStr(validatedData?.pinCode);
                const newUser = await User.create({
                    phoneNumber: validatedData?.phoneNumber,
                    password: validatedData?.password
                });

                if (!newUser) {
                    return {
                        status: 500,
                        isNewUser,
                        data: [],
                        error: { message: i18n.__("FAILED_TO_CREATE_NEW_USER") }
                    };
                }

                const jwtPayload = {
                    id: newUser.id,
                    phoneNumber: newUser.phoneNumber,
                    role: newUser.role
                };

                const accessToken = await generateToken(
                    jwtPayload,
                    process.env.JWT_ALGO,
                    process.env.ACCESS_TOKEN_SECRET_KEY,
                    Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
                );

                const refreshToken = await generateToken(
                    jwtPayload,
                    process.env.JWT_ALGO,
                    process.env.REFRESH_TOKEN_SECRET_KEY,
                    Number(process.env.REFRESH_TOKEN_EXPIRES_IN)
                );

                return {
                    status: 200,
                    isNewUser,
                    data: { accessToken, refreshToken },
                    message: i18n.__("SUCCESSFULLY_CREATED_NEW_USER"),
                    error: {}
                };
            }

            return {
                status: 200,
                isNewUser,
                data: validatedData,
                message: i18n.__("SUCCESSFULLY_CREATED_OR_VERIFIED_PIN"),
                error: {}
            };

        } catch (e) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
            return {
                status: 500,
                data: [],
                error: { message: i18n.__("CATCH_ERROR"), reason: e.message }
            };
        }
    }

    /**
     * Update PIN by phone number
     * @param {*} request
     * @returns
     */
    static async updatePinByPhoneNumber(request) {
        const { payload, headers: { i18n } } = request;

        try {
            const updatedData = {
                phoneNumber: payload.phoneNumber,
                pinCode: payload.pinCode
            };

            const [validationError, validatedData] = await setNewPinValidator(updatedData, i18n);
            if (validationError) return validationError;

            const user = await User.findOne({ where: { phoneNumber: validatedData?.phoneNumber } });

            if (!user) {
                return {
                    status: 404,
                    data: [],
                    error: { message: i18n.__("USER_NOT_FOUND_WITH_PHONE", { phone: validatedData?.phoneNumber, pinCode: validatedData?.pinCode }) }
                };
            }

            user.password = await hashStr(validatedData?.pinCode);
            await user.save();

            return {
                status: 200,
                data: { phoneNumber: user.phoneNumber, pinCode: validatedData?.pinCode },
                message: i18n.__("SUCCESSFULLY_UPDATED_PIN"),
                error: {}
            };

        } catch (e) {
            process.env.SENTRY_ENABLED === "true" && Sentry.captureException(e);
            return {
                status: 500,
                data: [],
                error: { message: i18n.__("CATCH_ERROR"), reason: e.message }
            };
        }
    }
}
