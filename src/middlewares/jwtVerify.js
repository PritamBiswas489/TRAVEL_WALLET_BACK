import '../config/environment.js';
import jwt from 'jsonwebtoken';
import { generateToken } from '../libraries/auth.js';

const { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY, JWT_ALGO, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } = process.env;

export default (req, res, next) => {
	try {
		const { authorization, refreshtoken } = req.headers;

		if (!authorization) {
			return res.send({
				status: 401,
				data: [],
				error: { message: 'Unathorize action', reason: 'Token not found !' },
			});
		}
		const token = authorization.split(' ')[1];
		try {
			const verifiedData = jwt.verify(token, ACCESS_TOKEN_SECRET_KEY);
			req.user = verifiedData;
			return next();
		} catch (e) {
			if (!refreshtoken) {
				return res.send({
					status: 401,
					data: [],
					error: { message: 'Unathorize action', reason: 'Refresh token not found !' },
				});
			}
			jwt.verify(refreshtoken, REFRESH_TOKEN_SECRET_KEY, async (err, data) => {
				if (err) {
					return res.send({ status: 401, data: [], error: { message: 'Unathorize action' } });
				}

				const payload = {
					id: data.id,
					email: data.email,
					role: data.role,
					avatar: data.avatar,
					name: data.name,
					userName: data.userName,
					// theme: data.theme,
				};

				req.user = payload;
				const accessToken = await generateToken(payload, JWT_ALGO, ACCESS_TOKEN_SECRET_KEY, Number(ACCESS_TOKEN_EXPIRES_IN));
				const refreshToken = await generateToken(payload, JWT_ALGO, REFRESH_TOKEN_SECRET_KEY, Number(REFRESH_TOKEN_EXPIRES_IN));

				res.set({ accesstoken: accessToken, refreshtoken: refreshToken });
				res.accesstoken = accessToken;
				res.refreshtoken = refreshToken;
				return next();
			});
		}
	} catch (e) {
		res.send({ status: 500, data: [], error: { message: 'Something went wrong !', reason: e.message } });
	}
};
