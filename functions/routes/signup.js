const express = require('express');
const Joi = require('joi');
const router = express.Router();
const { firebase, db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

const validateSignUpUser = (user) => {
	const schema = Joi.object({
		email: Joi.string()
			.trim()
			.email({ minDomainSegments: 2 })
			.required()
			.error((errors) => {
				return errors.map((err) => {
					switch (err.type) {
						case 'any.empty':
							return { message: 'cannot be empty.' };
						case 'string.email':
							return {
								message: 'should be valid one.'
							};
						default:
							return {
								message: `${err.message}`
							};
					}
				});
			}),
		password: Joi.string()
			.min(6)
			.required()
			.regex(
				/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,}$/
			)
			.strip()
			.error((errors) => {
				return errors.map((err) => {
					switch (err.type) {
						case 'any.empty':
							return { message: 'cannot be empty.' };
						case 'string.min':
							return {
								message: 'should be at least 6 characters long.'
							};
						case 'string.regex.base':
							return {
								message:
									'must include uppercase, lowercase, digit and special characters without whitespaces.'
							};
						default:
							return {
								message: `${err.message}`
							};
					}
				});
			}),
		confirmPassword: Joi.string()
			.required()
			.valid(Joi.ref('password'))
			.strip()
			.error((errors) => {
				return errors.map((err) => {
					switch (err.type) {
						case 'any.empty':
							return { message: 'cannot be empty.' };
						case 'any.allowOnly':
							return {
								message: 'must match with the password.'
							};
						default:
							return {
								message: `${err.message}`
							};
					}
				});
			}),
		userName: Joi.string()
			.min(4)
			.required()
			.error((errors) => {
				return errors.map((err) => {
					switch (err.type) {
						case 'any.empty':
							return { message: 'cannot be empty.' };
						case 'string.min':
							return {
								message: 'must have at least 4 characters.'
							};
						default:
							return {
								message: `${err.message}`
							};
					}
				});
			})
	});

	return schema.validate(user);
};

router.post('/', (req, res) => {
	logger.debug('POST - /signup reached.');

	const { error } = validateSignUpUser(req.body);

	if (error) {
		logger.error(
			`user signup validation failed at ${error.details[0].path[0]} due to ${error.details[0].message}`
		);

		return res.status(400).send({
			code: 400,
			field: error.details[0].path[0],
			message: error.details[0].message
		});
	}

	const { email, password, confirmPassword, userName } = req.body;
	const newUser = { email, password, confirmPassword, userName };
	let token, userId;

	db.collection('users')
		.where('email', '==', email)
		.get()
		.then((userSnapshot) => {
			if (!userSnapshot.empty) {
				logger.debug('User already exists.');

				return res.status(400).send({
					code: 400,
					field: 'email',
					message: `User already signup with the ${email}`
				});
			} else {
				logger.debug('User creating in firebase authentication.');

				return firebase
					.auth()
					.createUserWithEmailAndPassword(
						newUser.email,
						newUser.password
					);
			}
		})
		.then((data) => {
			logger.debug('User token receiving.');

			userId = data.user.uid;
			return data.user.getIdToken();
		})
		.then((userToken) => {
			token = userToken;
			const userCredentials = {
				userName: newUser.userName,
				email: newUser.email,
				imageUrl: '',
				createdAt: new Date().toISOString()
			};

			logger.debug('User registering in firestore.');

			return db.doc(`/users/${userId}`).set(userCredentials);
		})
		.then(() => {
			logger.debug('User created in firestore.');

			return res.status(201).send({ code: 201, token });
		})
		.catch((err) => {
			logger.error(`Unable to signup: ${err}`);

			if (err.code === 'auth/email-already-in-use') {
				return res.status(400).send({
					code: 400,
					field: 'email',
					message: `User already signup with ${newUser.email}`
				});
			} else {
				return res.status(500).send({ code: 500, message: err.code });
			}
		});
});

module.exports = router;
