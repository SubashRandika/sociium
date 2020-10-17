const functions = require('firebase-functions');
const { db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

exports.createOnLikeThePost = functions.firestore
	.document('likes/{likeId}')
	.onCreate((snapshot, context) => {
		logger.debug('onCreate triggered for like the post');

		const { postId, userName } = snapshot.data();
		const likeId = context.params.likeId;

		db.doc(`posts/${postId}`)
			.get()
			.then((doc) => {
				logger.debug('getting post data of liked post');

				if (doc.exists) {
					logger.debug('updating notification data with like id');

					return db.doc(`notifications/${likeId}`).set({
						postId: doc.id,
						sender: userName,
						recipient: doc.data().userName,
						type: 'like',
						read: false,
						createdAt: new Date().toISOString()
					});
				}
			})
			.then(() => {
				logger.debug(
					'adding notification on like to the post is successful'
				);
				return;
			})
			.catch((err) => {
				logger.error(
					`adding notification on like to the post is failed due to: ${err}`
				);
				return;
			});
	});

exports.createWhenCommentOnPost = functions.firestore
	.document(`comments/{commentId}`)
	.onCreate((snapshot, context) => {
		logger.debug('onCreate triggered for comment on post');

		const { postId, userName } = snapshot.data();
		const commentId = context.params.commentId;

		db.doc(`posts/${postId}`)
			.get()
			.then((doc) => {
				logger.debug('getting post data of commented post');

				if (doc.exists) {
					logger.debug('updating notification data with comment id');

					return db.doc(`notifications/${commentId}`).set({
						postId: doc.id,
						sender: userName,
						recipient: doc.data().userName,
						type: 'comment',
						read: false,
						createdAt: new Date().toISOString()
					});
				}
			})
			.then(() => {
				logger.debug(
					'adding notification on comment to post the is successful'
				);
				return;
			})
			.catch((err) => {
				logger.error(
					`adding notification on comment to post the is failed due to: ${err}`
				);
				return;
			});
	});

exports.deleteWhenUnlikeThePost = functions.firestore
	.document(`likes/{likeId}`)
	.onDelete((snapshot, context) => {
		logger.debug('onDelete triggered for unlike the post');

		db.doc(`notifications/${context.params.likeId}`)
			.delete()
			.then(() => {
				logger.debug(
					`notification successfully deleted for like: ${snapshot.id}`
				);
				return;
			})
			.catch((err) => {
				logger.error(`notification deletion failed due to: ${err}`);
				return;
			});
	});
