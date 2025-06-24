import joi from "joi";

export const peleCardValidator = async (data, i18n) => {
  try {
    //add i18n messages to joi schema
    const schema = joi.object({
      cardholderName: joi.string().min(2).max(50).required().messages({
        "string.base": i18n.__("CARDHOLDER_NAME_STRING"),
        "string.empty": i18n.__("CARDHOLDER_NAME_REQUIRED"),
        "string.min": i18n.__("CARDHOLDER_NAME_MIN_LENGTH"),
        "string.max": i18n.__("CARDHOLDER_NAME_MAX_LENGTH"),
        "any.required": i18n.__("CARDHOLDER_NAME_REQUIRED"),
      }),

      cardNumber: joi.string()
        .pattern(/^\d{16}$/)
        .required()
        .messages({
          "string.pattern.base": i18n.__("CARD_NUMBER_STRING"),
          "string.empty": i18n.__("CARD_NUMBER_REQUIRED"),
          "any.required": i18n.__("CARD_NUMBER_REQUIRED"),
        }),

      creditCardDateMmYy: joi.string()
        .pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
        .required()
        .messages({
          "string.pattern.base": i18n.__("EXPIRATION_DATE_FORMAT"),
          "string.empty": i18n.__("EXPIRATION_DATE_REQUIRED"),
          "any.required": i18n.__("EXPIRATION_DATE_REQUIRED"),
        }),

      cvv: joi.string()
        .pattern(/^\d{3,4}$/)
        .required()
        .messages({
          "string.pattern.base": i18n.__("CVV_STRING"),
          "string.empty": i18n.__("CVV_REQUIRED"),
          "any.required": i18n.__("CVV_REQUIRED"),
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
        error: { message: i18n.__("CATCH_ERROR"), reason: e.message },
      },
      null,
    ];
  }
};
