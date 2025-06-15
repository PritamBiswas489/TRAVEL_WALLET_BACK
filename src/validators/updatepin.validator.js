import joi from "joi";

export const updatepinValidator = async (data) => {
  try {
   
    const otpRegex = /^\d{4}$/; // Example regex for 4-digit OTP codes

    const schema = joi.object({
     existingPinCode: joi.string().pattern(otpRegex).required().messages({
        "string.pattern.base": "Existing pin must be a 4-digit code",
        "any.required": "Existing pin is required",
      }),   
     
      pinCode: joi.string().pattern(otpRegex).required().messages({
        "string.pattern.base": "Pin must be a 4-digit code",
        "any.required": "Pin is required",
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
