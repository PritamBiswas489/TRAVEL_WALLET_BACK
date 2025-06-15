import joi from "joi";

export const profileEditValidator = async (data) => {
  try {
   const schema = joi.object({
		  name: joi.string().min(3).max(50).required(),
			email: joi.string().email().required(),
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
