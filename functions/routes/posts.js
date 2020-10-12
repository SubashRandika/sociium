const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebaseAdmin');
const { data } = require('../utils/logger');
const logger = require('../utils/logger');

// create a new post
router.post('/', (req, res) => {
	logger.debug('POST - /posts reached.');

	const newPost = {
		...req.body,
		userId: req.signin.uid,
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

// get all posts
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

// get one post by id
router.get('/:postId', (req, res) => {
	logger.debug('GET - /posts/:postId reached');

	let postData = {};
	const { postId } = req.params;
	console.log(postId);

	db.doc(`posts/${postId}`)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				return res
					.status(404)
					.send({ code: 404, message: `Post: ${postId} not found` });
			}

			logger.debug(`getting post: ${postId} data.`);

			postData = doc.data();
			postData.postId = doc.id;

			return db
				.collection('comments')
				.orderBy('createdAt', 'desc')
				.where('postId', '==', postId)
				.get();
		})
		.then((data) => {
			logger.debug(`getting comments for post: ${postId}`);

			postData.comments = [];
			data.forEach((doc) => {
				postData.comments.push(doc.data());
			});

			return res.status(200).send(postData);
		})
		.catch((err) => {
			logger.error(`Unable to get post data due to: ${err}`);

			res.status(500).send({
				code: 500,
				message: 'cannot get post data'
			});
		});
});

module.exports = router;
