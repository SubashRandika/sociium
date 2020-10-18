const functions = require('firebase-functions');
const { db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

exports.likesCommentsNotificationsOnPostDeletion = functions.firestore
	.document('posts/{postId}')
	.onDelete(async (snapshot, context) => {
		logger.debug('Trigger[likesCommentsNotificationsOnPostDeletion] fired');

		const postId = context.params.postId;
		const batch = db.batch();

		try {
			logger.debug('fetching all likes of deleted post');

			const likesSnapshot = await db
				.collection('likes')
				.where('postId', '==', postId)
				.get();

			if (likesSnapshot.empty) {
				logger.warn('likes are not available for the post');
			} else {
				logger.debug('batching all likes of deleted post');

				likesSnapshot.forEach((likeDoc) => {
					batch.delete(likeDoc.ref);
				});
			}

			logger.debug('fetching all comments of deleted post');

			const commentsSnapshot = await db
				.collection('comments')
				.where('postId', '==', postId)
				.get();

			if (commentsSnapshot.empty) {
				logger.warn('comments are not available for the post');
			} else {
				logger.debug('batching all comments of deleted post');

				commentsSnapshot.forEach((commentDoc) => {
					batch.delete(commentDoc.ref);
				});
			}

			logger.debug('fetching all notifications of deleted post');

			const notificationsSnapshot = await db
				.collection('notifications')
				.where('postId', '==', postId)
				.get();

			if (notificationsSnapshot.empty) {
				logger.warn('notifications are not available for the post');
			} else {
				logger.debug('batching all notifications of deleted post');

				notificationsSnapshot.forEach((notificationDoc) => {
					batch.delete(notificationDoc.ref);
				});
			}

			batch.commit();
		} catch (err) {
			logger.error(
				`Trigger[likesCommentsNotificationsOnPostDeletion] failed due to: ${err}`
			);
		}
	});
