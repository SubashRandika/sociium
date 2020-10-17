const functions = require('firebase-functions');
const { db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

exports.likesAndCommentsWhenDeleteAPost = functions.firestore
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
