const express = require('express');
const router = express.Router();
const { db, fbAdmin } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

const firebaseAuth = (req, res, next) => {
	const { authorization } = req.headers;
	let idToken;

	if (authorization && authorization.startsWith('Bearer ')) {
		idToken = authorization.split('Bearer ')[1];
	} else {
		logger.error('Unable to find token');
		return res.status(401).send({ code: 401, message: 'Unauthorized' });
	}

	fbAdmin
		.auth()
		.verifyIdToken(idToken)
		.then((decodedToken) => {
			const { uid } = decodedToken;

			return db
				.collection('users')
				.where('userId', '==', uid)
				.limit(1)
				.get();
		})
		.then((data) => {
			req.signin.user = data.docs[0].data().handle;
			return next();
		})
		.catch((err) => {
			logger.error(`Unable to verify token. User may be unauthorized.`);
			return res.status(401).send(err);
		});
};

router.use(firebaseAuth);

module.exports = router;
