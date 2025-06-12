import joi from 'joi';
 
export const addContactValidator = async (data) => {
	try {
		const schema = joi.object({
			address: joi.string().required(),
			phoneOne: joi.string().required(),
			phoneTwo: joi.string().optional().allow('', null), // optional and can be empty or null
			email: joi.string().email().required(),
			website: joi.string().uri().optional().allow('', null), // optional and can be empty or null
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
		return [{ status: 500, data: [], error: { message: 'Something went wrong !', reason: e.message } }, null];
	}
};
