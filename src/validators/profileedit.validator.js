import joi from "joi";

export const profileEditValidator = async (data, i18n) => {
  try {
    //add message attribute in joi schema to customize error messages
   const schema = joi.object({
		  name: joi.string().min(3).max(50).required().messages({
			  'string.empty': i18n.__('NAME_REQUIRED'),
			  'any.required': i18n.__('NAME_REQUIRED')
		  }),
			email: joi.string().email().required().messages({
				'string.empty': i18n.__('EMAIL_REQUIRED'),
				'any.required': i18n.__('EMAIL_REQUIRED'),
				'string.email': i18n.__('INVALID_EMAIL_FORMAT')
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
