const functions = require('firebase-functions');
const { db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

exports.onUserProfileImageChanged = functions.firestore
	.document('/users/{userId}')
	.onUpdate(async (change, context) => {
		logger.debug('Trigger[onUserProfileImageChanged] fired');

		const { imageUrl: imageUrlBefore, userName } = change.before.data();
		const { imageUrl: imageUrlAfter } = change.after.data();

		if (imageUrlBefore !== imageUrlAfter) {
			logger.debug('updating image url of all posts belong to the user');

			const batch = db.batch();

			try {
				const postSnapshot = await db
					.collection('posts')
					.where('userName', '==', userName)
					.get();

				postSnapshot.forEach((doc) => {
					const postDocumentRef = db.doc(`posts/${doc.id}`);
					batch.update(postDocumentRef, {
						userImage: imageUrlAfter
					});
				});

				logger.debug(
					'user posts successfully updated with latest image url'
				);

				batch.commit();
			} catch (err) {
				logger.error(
					`Trigger[onUserProfileImageChanged] failed due to: ${err}`
				);
			}
		}
	});
