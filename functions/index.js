const functions = require('firebase-functions');
const express = require('express');
const app = express();
const posts = require('./routes/posts');
const signin = require('./routes/signin');
const signup = require('./routes/signup');
const users = require('./routes/users');
const firebaseAuth = require('./middleware/firebaseAuth');
const { db } = require('./utils/firebaseAdmin');
const logger = require('./utils/logger');

// built-in middlewares
app.use(express.json());
// encode complex objects like arrays, json objects.
app.use(express.urlencoded({ extended: true }));

// signin route
app.use('/signin', signin);

// signup route
app.use('/signup', signup);

// protected posts route
app.use('/posts', firebaseAuth, posts);

// protected users route
app.use('/users', firebaseAuth, users);

exports.api = functions.https.onRequest(app);

exports.deleteLikesCommentsOnPostDelete = functions.firestore
	.document('posts/{postId}')
	.onDelete((change, context) => {
		logger.debug('onDelete triggered for post deletion');

		const postId = context.params.postId;

		db.collection('likes')
			.where('postId', '==', postId)
			.get()
			.then((likesSnapshot) => {
				logger.debug('getting likes for post to delete');

				if (likesSnapshot.empty) {
					logger.warn('likes not available for the post');
					return;
				} else {
					logger.debug('starting to delete likes of deleted post');

					const likesBatch = db.batch();

					likesSnapshot.forEach((doc) => {
						likesBatch.delete(doc.ref);
					});

					return likesBatch.commit();
				}
			})
			.then(() => {
				logger.debug('all likes related to post deletion successful');
				return;
			})
			.catch((err) => {
				logger.error(
					`all likes related to post deletion failed due to: ${err}`
				);
				return;
			});

		db.collection('comments')
			.where('postId', '==', postId)
			.get()
			.then((commentsSnapshot) => {
				logger.debug('getting likes for post to delete');

				if (commentsSnapshot.empty) {
					logger.warn('comments not available for the post');
					return;
				} else {
					logger.debug('starting to delete comments of deleted post');

					const commentsBatch = db.batch();

					commentsSnapshot.forEach((doc) => {
						commentsBatch.delete(doc.ref);
					});

					return commentsBatch.commit();
				}
			})
			.then(() => {
				logger.debug('all likes related to post deletion successful');
				return;
			})
			.catch((err) => {
				logger.error(
					`all likes related to post deletion failed due to: ${err}`
				);
				return;
			});
	});
