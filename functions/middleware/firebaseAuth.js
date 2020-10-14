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
			logger.debug(
				`Token successfully verified for userId ${decodedToken.uid}`
			);
			req.signin = decodedToken;

			return db.doc(`users/${req.signin.uid}`).get();
		})
		.then((doc) => {
			logger.debug('Passing verified user for next request.');

			req.signin.userName = doc.data().userName;
			req.signin.imageUrl = doc.data().imageUrl;
			return next();
		})
		.catch((err) => {
			logger.error(`Unable to verify token. User may be unauthorized.`);
			return res.status(401).send(err);
		});
};

router.use(firebaseAuth);

module.exports = router;
