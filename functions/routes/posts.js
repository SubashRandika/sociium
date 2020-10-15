const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

// create a new post
router.post('/', (req, res) => {
	logger.debug('POST - /posts reached.');

	const newPost = {
		...req.body,
		userName: req.signin.userName,
		userImage: req.signin.imageUrl,
		createdAt: new Date().toISOString(),
		likeCount: 0,
		commentCount: 0
	};

	db.collection('posts')
		.add(newPost)
		.then((doc) => {
			logger.debug(`post: ${doc.id} created.`);

			res.status(201).send({ postId: doc.id, ...newPost });
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
				postData.comments.push({ commentId: doc.id, ...doc.data() });
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

// create a comment on a post
router.post('/:postId/comment', (req, res) => {
	logger.debug('POST - /posts/:postId/comment reached');

	const { body } = req.body;
	const { postId } = req.params;
	const { userName, imageUrl } = req.signin;

	if (body.trim() === '') {
		return res
			.status(400)
			.send({ code: 400, message: 'cannot create empty comment' });
	}

	const newComment = {
		body,
		postId,
		userName,
		userImage: imageUrl,
		createdAt: new Date().toISOString()
	};

	db.doc(`posts/${postId}`)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				return res.status(404).send({
					code: 404,
					message: `unable to find post: ${postId}`
				});
			}

			logger.debug('updating comment count');

			return doc.ref.update({
				commentCount: doc.data().commentCount + 1
			});
		})
		.then(() => {
			logger.debug('adding new comments record');

			return db.collection('comments').add(newComment);
		})
		.then((doc) => {
			logger.debug(`comment: ${doc.id} successfully added`);

			res.status(200).send({ commentId: doc.id, ...newComment });
		})
		.catch((err) => {
			logger.error(`adding comment to post is failed due to: ${err}`);

			res.status(500).send({
				code: 500,
				message: 'Unable to add comment on post'
			});
		});
});

// like the post
router.get('/:postId/like', (req, res) => {
	logger.debug('GET - /posts/:postId/like reached');

	const { postId } = req.params;
	const { userName } = req.signin;
	let postData;
	const postDocument = db.doc(`/posts/${postId}`);

	postDocument
		.get()
		.then((doc) => {
			if (doc.exists) {
				logger.debug(`getting post document data`);

				postData = doc.data();
				postData.postId = doc.id;

				return db
					.collection('likes')
					.where('userName', '==', userName)
					.where('postId', '==', postId)
					.limit(1)
					.get();
			} else {
				logger.warn(`cannot find a post: ${postId}`);

				return res
					.status(404)
					.send({ code: 404, message: `post: ${postId} not found` });
			}
		})
		.then(async (data) => {
			if (data.empty) {
				logger.debug('user liking the post');

				await db
					.collection('likes')
					.add({ postId: postId, userName: userName });

				logger.debug('increasing the number of likes');

				postData.likeCount++;

				await postDocument.update({
					likeCount: postData.likeCount
				});

				logger.debug('post updated with latest no of likes');

				return res.status(200).send(postData);
			} else {
				logger.warn('user already liked');

				res.status(400).send({
					code: 400,
					message: 'you already liked the post'
				});
			}
		})
		.catch((err) => {
			logger.error(`liking post is failed due to: ${err}`);

			res.status(500).send({
				code: 500,
				message: 'unable to like the post'
			});
		});
});

// unlike the post
router.get('/:postId/unlike', (req, res) => {
	logger.debug('GET - /posts/:postId/unlike reached');

	const { postId } = req.params;
	const { userName } = req.signin;
	let postData;
	const postDocument = db.doc(`/posts/${postId}`);

	postDocument
		.get()
		.then((doc) => {
			if (doc.exists) {
				logger.debug(`getting post document data`);

				postData = doc.data();
				postData.postId = doc.id;

				return db
					.collection('likes')
					.where('userName', '==', userName)
					.where('postId', '==', postId)
					.limit(1)
					.get();
			} else {
				logger.warn(`cannot find a post: ${postId}`);

				return res
					.status(404)
					.send({ code: 404, message: `post: ${postId} not found` });
			}
		})
		.then(async (data) => {
			if (data.empty) {
				logger.warn('user not liked yet');

				res.status(400).send({
					code: 400,
					message: 'you not liked the post'
				});
			} else {
				logger.debug('user disliking the post');

				await db.doc(`/likes/${data.docs[0].id}`).delete();

				logger.debug('decreasing the number of likes');

				postData.likeCount--;

				await postDocument.update({
					likeCount: postData.likeCount
				});

				logger.debug('post updated with latest no of likes');

				return res.status(200).send(postData);
			}
		})
		.catch((err) => {
			logger.error(`disliking post is failed due to: ${err}`);

			res.status(500).send({
				code: 500,
				message: 'unable to unlike the post'
			});
		});
});

module.exports = router;
