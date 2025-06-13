import db from '../databases/models/index.js';
import '../config/environment.js';


const { User, Op } = db;
/**
 * Get user profile details
 * @param {*} request
 * @returns
 */

export const getProfileDetails = async (request) => {
	try {
		const { payload, user } = request;
		const userDetails = await User.findOne({ where: { id: user.id }, attributes: [
			'id', 
			'name',
            'email',
            'phoneNumber',
            'role',
            'avatar',
		] });
		return {
			status: 200,
			data: userDetails,
			message: '',
			error: {},
		};
	} catch (e) {
		return { status: 500, data: [], error: { message: 'Something went wrong !', reason: e.message } };
	}
};