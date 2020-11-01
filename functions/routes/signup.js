const express = require('express');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const router = express.Router();
const { firebase, db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

const complexityOptions = {
	min: 6,
	max: 20,
	lowerCase: 1,
	upperCase: 1,
	numeric: 1,
	symbol: 1,
	requirementCount: 4
};

const validateSignUpUser = (user) => {
	const schema = Joi.object({
		email: Joi.string()
			.trim()
			.email({ minDomainSegments: 2 })
			.required()
			.messages({
				'string.empty': 'cannot be empty.',
				'string.email': 'should be valid one.'
			}),
		password: passwordComplexity(complexityOptions),
		confirmPassword: Joi.string()
			.required()
			.valid(Joi.ref('password'))
			.messages({
				'any.only': 'must match with the password.'
			}),
		userName: Joi.string().min(4).required().messages({
			'string.empty': 'cannot be empty.',
			'string.min': 'must have at least 4 characters.'
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
				return res.status(500).send({
					code: 500,
					message: 'signup failed. please try again'
				});
			}
		});
});

module.exports = router;
