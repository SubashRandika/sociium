const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

router.post('/', (req, res) => {
	const newPost = {
		...req.body,
		user: req.signin.user,
		createdAt: new Date().toISOString()
	};

	db.collection('posts')
		.add(newPost)
		.then((doc) => {
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
	db.collection('posts')
		.orderBy('createdAt', 'desc')
		.get()
		.then((querySnapshot) => {
			let post = [];

			querySnapshot.forEach((doc) => {
				post.push({
					postId: doc.id,
					...doc.data()
				});
			});

			res.status(200).send(post);
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
