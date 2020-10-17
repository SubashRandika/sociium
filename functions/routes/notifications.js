const express = require('express');
const router = express.Router();
const { db } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

router.post('/', (req, res) => {
	logger.debug('POST - /notifications reached');

	let batch = db.batch();

	req.body.forEach((notificationId) => {
		const notificationRef = db.doc(`notifications/${notificationId}`);
		batch.update(notificationRef, { read: true });
	});

	batch
		.commit()
		.then(() => {
			logger.debug('requested notifications marked as read');

			return res.status(200).send({
				code: 200,
				message: 'notifications successfully marked as read'
			});
		})
		.catch((err) => {
			logger.error(`marking notifications as read failed due to: ${err}`);

			return res.status(500).send({
				code: 500,
				message: 'notifications marking as read is failed'
			});
		});
});

module.exports = router;
