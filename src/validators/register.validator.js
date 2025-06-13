import joi from "joi";

export const registerValidator = async (data) => {
  try {
    const phoneRegex = /^\+\d{1,3}\d{4,14}$/; // Example regex for international phone numbers
    const otpRegex = /^\d{4}$/; // Example regex for 4-digit OTP codes

    const schema = joi.object({
      phoneNumber: joi.string().pattern(phoneRegex).required().messages({
        "string.pattern.base":
          "Phone number must be in international format, e.g., +1234567890",
        "any.required": "Phone number is required",
      }),
      pinCode: joi.string().pattern(otpRegex).required().messages({
        "string.pattern.base": "OTP must be a 4-digit code",
        "any.required": "OTP is required",
      }),
    });
    return [null, await schema.validateAsync(data)];
  } catch (e) {
    if (e.details) {
      const errRes = {
        status: 400,
        data: [],
        error: { message: e.details[0].message },
      };
      return [errRes, null];
    }
    return [
      {
        status: 500,
        data: [],
        error: { message: "Something went wrong !", reason: e.message },
      },
      null,
    ];
  }
};
