const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

router.post('/', (req, res) => {
	logger.debug('POST - /posts reached.');

	const newPost = {
		...req.body,
		user: req.signin.user,
		createdAt: new Date().toISOString()
	};

	db.collection('posts')
		.add(newPost)
		.then((doc) => {
			logger.debug(`post: ${doc.id} created.`);

			res.status(201).send({
				code: 201,
				message: `Post: ${doc.id} created successfully`
			});
		})
		.catch((err) => {
			logger.error(`Post creation failed: ${err}`);

			res.status(500).send({
				code: 500,
				message: 'Unable to create the post.'
			});
		});
});

router.get('/', (req, res) => {
	logger.debug('GET - /posts path reached.');

	db.collection('posts')
		.orderBy('createdAt', 'desc')
		.get()
		.then((querySnapshot) => {
			let posts = [];

			querySnapshot.forEach((doc) => {
				posts.push({
					postId: doc.id,
					...doc.data()
				});
			});

			logger.debug(`${posts.length} posts received.`);

			res.status(200).send(posts);
		})
		.catch((err) => {
			logger.error(`Cannot get the posts: ${err}`);

			res.status(500).send({
				code: 500,
				message: 'Unable to load the posts.'
			});
		});
});

module.exports = router;
