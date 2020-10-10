const express = require('express');
const Joi = require('joi');
const router = express.Router();
const { firebase } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

const validateSignInUser = (user) => {
	const schema = {
		email: Joi.string()
			.trim()
			.required()
			.error((errors) => {
				return errors.map((err) => {
					switch (err.type) {
						case 'any.empty':
							return { message: 'cannot be empty.' };
						default:
							return {
								message: `${err.message}`
							};
					}
				});
			}),
		password: Joi.string()
			.required()
			.error((errors) => {
				return errors.map((err) => {
					switch (err.type) {
						case 'any.empty':
							return { message: 'cannot be empty.' };
						default:
							return {
								message: `${err.message}`
							};
					}
				});
			})
	};

	return Joi.validate(user, schema);
};

router.post('/', (req, res) => {
	logger.debug('POST - /signin reached.');

	const { error } = validateSignInUser(req.body);

	if (error) {
		logger.error(
			`user signin validation failed at ${error.details[0].path[0]} due to ${error.details[0].message}`
		);

		return res.status(400).send({
			code: 400,
			field: error.details[0].path[0],
			message: error.details[0].message
		});
	}

	const { email, password } = req.body;
	const user = { email, password };

	firebase
		.auth()
		.signInWithEmailAndPassword(user.email, user.password)
		.then((data) => {
			return data.user.getIdToken();
		})
		.then((token) => {
			logger.debug('user token receiving.');

			return res.status(200).send({ code: 200, token });
		})
		.catch((err) => {
			logger.error(`Unable to signin: ${err}`);

			if (err.code === 'auth/wrong-password') {
				return res.status(401).send({
					code: 401,
					message:
						'Incorrect password. Please enter correct password.'
				});
			} else if (err.code === 'auth/user-not-found') {
				return res.status(401).send({
					code: 401,
					message: 'You are not signup. Please signup before signin.'
				});
			} else {
				return res.status(500).send({ code: 500, message: err.code });
			}
		});
});

module.exports = router;
