const express = require('express');
const Joi = require('joi');
const router = express.Router();
const { firebase, db, fbConfig } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

const validateSignUpUser = (user) => {
	const schema = {
		email: Joi.string()
			.trim()
			.email({ minDomainAtoms: 2 })
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
					}
				});
			}),
		handle: Joi.string()
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
					}
				});
			})
	};

	return Joi.validate(user, schema);
};

router.post('/', (req, res) => {
	const { error } = validateSignUpUser(req.body);

	if (error) {
		return res.status(400).send({
			code: 400,
			field: error.details[0].path[0],
			message: error.details[0].message
		});
	}

	const { email, password, confirmPassword, handle } = req.body;
	const newUser = { email, password, confirmPassword, handle };
	let token, userId;
	const noProfileImage = 'default_profile_image.png';

	db.doc(`/users/${newUser.handle}`)
		.get()
		.then((doc) => {
			if (doc.exists) {
				return res.status(400).send({
					code: 400,
					field: 'handle',
					message: 'User already signup.'
				});
			} else {
				return firebase
					.auth()
					.createUserWithEmailAndPassword(
						newUser.email,
						newUser.password
					);
			}
		})
		.then((data) => {
			userId = data.user.uid;
			return data.user.getToken();
		})
		.then((userToken) => {
			token = userToken;
			const userCredentials = {
				userId,
				handle: newUser.handle,
				email: newUser.email,
				imageUrl: `https://firebasestorage.googleapis.com/v0/b/${fbConfig.storageBucket}/o/${noProfileImage}?alt=media`,
				createdAt: new Date().toISOString()
			};

			return db.doc(`/users/${newUser.handle}`).set(userCredentials);
		})
		.then(() => {
			return res.status(201).send({ code: 201, token });
		})
		.catch((err) => {
			logger.error(`Unable to signup: ${err}`);

			if (err.code === 'auth/email-already-in-use') {
				return res.status(400).send({
					code: 400,
					field: 'email',
					message: `User already signup with the email: ${newUser.email}`
				});
			} else {
				return res.status(500).send({ code: 500, message: err.code });
			}
		});
});

module.exports = router;