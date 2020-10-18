const functions = require('firebase-functions');
const { db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

exports.onLikeThePost = functions.firestore
	.document('likes/{likeId}')
	.onCreate(async (snapshot, context) => {
		logger.debug('Trigger[onLikeThePost] fired');

		const { postId, userName } = snapshot.data();
		const likeId = context.params.likeId;

		try {
			logger.debug('fetching post data of liked post');

			const doc = await db.doc(`posts/${postId}`).get();

			if (doc.exists && doc.data().userName !== userName) {
				logger.debug('creating a notification with like id');

				await db.doc(`notifications/${likeId}`).set({
					postId: doc.id,
					sender: userName,
					recipient: doc.data().userName,
					type: 'like',
					read: false,
					createdAt: new Date().toISOString()
				});
			}
		} catch (err) {
			logger.error(`Trigger[onLikeThePost] failed due to: ${err}`);
		}
	});

exports.onCommentThePost = functions.firestore
	.document(`comments/{commentId}`)
	.onCreate(async (snapshot, context) => {
		logger.debug('Trigger[onCommentThePost] fired');

		const { postId, userName } = snapshot.data();
		const commentId = context.params.commentId;

		logger.debug('fetching post data of commented post');

		try {
			const doc = await db.doc(`posts/${postId}`).get();

			if (doc.exists && doc.data().userName !== userName) {
				logger.debug('creating a notification with comment id');

				await db.doc(`notifications/${commentId}`).set({
					postId: doc.id,
					sender: userName,
					recipient: doc.data().userName,
					type: 'comment',
					read: false,
					createdAt: new Date().toISOString()
				});
			}
		} catch (err) {
			logger.error(`Trigger[onCommentThePost] failed due to: ${err}`);
		}
	});

exports.onUnlikeThePost = functions.firestore
	.document(`likes/{likeId}`)
	.onDelete(async (snapshot, context) => {
		logger.debug('Trigger[onUnlikeThePost] fired');

		try {
			await db.doc(`notifications/${context.params.likeId}`).delete();
		} catch (err) {
			logger.error(`Trigger[onUnlikeThePost] failed due to: ${err}`);
		}
	});
