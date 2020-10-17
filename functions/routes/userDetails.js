const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

// get any user's details (public route. not protected)
router.get('/:userName', (req, res) => {
	logger.debug('GET - /userDetails/:userName reached');

	let userData = {};
	const { userName } = req.params;

	db.collection('users')
		.where('userName', '==', userName)
		.get()
		.then((userSnapshot) => {
			if (!userSnapshot.empty) {
				logger.debug('getting user information');

				userSnapshot.forEach((doc) => {
					userData.userInfo = doc.data();
				});

				return db
					.collection('posts')
					.where('userName', '==', userName)
					.orderBy('createdAt', 'desc')
					.get();
			} else {
				logger.warn(`user: ${userName} information not found`);

				return res
					.status(404)
					.send({ code: 404, message: 'user information not found' });
			}
		})
		.then((postsSnapshot) => {
			logger.debug(`getting posts of user: ${userName}`);

			userData.posts = [];

			postsSnapshot.forEach((doc) => {
				userData.posts.push({
					postId: doc.id,
					...doc.data()
				});
			});

			return res.status(200).send(userData);
		})
		.catch((err) => {
			logger.error(
				`cannot fetch data for user: ${userName} due to: ${err}`
			);

			return res
				.status(500)
				.send({ code: 500, message: 'unable get user data' });
		});
});

module.exports = router;
