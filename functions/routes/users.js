const express = require('express');
const router = express.Router();
const Busboy = require('busboy');
const { db, fbAdmin, fbConfig } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');
const path = require('path');
const os = require('os');
const fs = require('fs');

router.post('/image', (req, res) => {
	logger.debug('POST - /users/image reached.');

	const busboy = new Busboy({ headers: req.headers });
	let imageFileName;
	let imageToBeUploaded = {};

	busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
		logger.debug(`${filename} accepting by busboy.`);

		if (!['image/png', 'image/jpeg'].includes(mimetype)) {
			logger.error(`${mimetype} type not supported.`);

			return res.status(400).send({
				code: 400,
				message: `${mimetype} type not supported. Only jpeg/png types.`
			});
		}

		const filenameParts = filename.split('.');
		const imageExtension = filenameParts[filenameParts.length - 1];
		const uniquePart = new Date().getTime().toString().slice(3, 12);
		imageFileName = `${uniquePart}.${imageExtension}`;
		const filePath = path.join(os.tmpdir(), imageFileName);
		imageToBeUploaded = { filePath, mimetype };
		file.pipe(fs.createWriteStream(filePath));

		logger.debug(`${imageToBeUploaded} prepared to upload.`);
	});

	busboy.on('finish', () => {
		logger.debug('starting to upload into firestorage.');

		fbAdmin
			.storage()
			.bucket()
			.upload(imageToBeUploaded.filePath, {
				resumable: false,
				destination: `${req.signin.uid}/${imageFileName}`,
				metadata: {
					metadata: {
						contentType: imageToBeUploaded.mimetype
					}
				}
			})
			.then(() => {
				logger.debug(`updating user: ${req.signin.user} image url.`);

				const uploadedPath = encodeURIComponent(
					`${req.signin.uid}/${imageFileName}`
				);
				const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${fbConfig.storageBucket}/o/${uploadedPath}?alt=media`;

				return db.doc(`users/${req.signin.uid}`).update({ imageUrl });
			})
			.then(() => {
				logger.debug('Image uploaded successfully.');

				return res.status(200).send({
					code: 200,
					message: 'Image successfully uploaded'
				});
			})
			.catch((err) => {
				logger.error(`Image upload failed: ${err}`);

				return res.status(500).send({ error: err.code });
			});
	});

	busboy.end(req.rawBody);
});

router.post('/', (req, res) => {
	logger.debug('POST - /users reached.');

	const { bio, website, location } = req.body;
	const userDetails = {};

	if (bio.trim()) {
		userDetails.bio = bio.trim();
	}

	if (website.trim()) {
		if (!website.trim().startsWith('http')) {
			userDetails.website = `http://${website}`;
		} else {
			userDetails.website = website;
		}
	}

	if (location.trim()) {
		userDetails.location = location.trim();
	}

	db.doc(`users/${req.signin.uid}`)
		.update(userDetails)
		.then(() => {
			logger.debug(`updated user ${req.signin.uid} details.`);

			return res.status(200).send({
				code: 200,
				message: 'User details successfully updated.'
			});
		})
		.catch((err) => {
			logger.error(`Unable to update user details due to: ${err}`);

			return res
				.status(500)
				.send({ code: 500, message: 'User details update failed' });
		});
});

router.get('/', (req, res) => {
	logger.debug('GET - /users reached.');

	const userData = {};

	db.doc(`users/${req.signin.uid}`)
		.get()
		.then((doc) => {
			if (doc.exists) {
				logger.debug(
					`getting user credentials for user: ${req.signin.uid}`
				);

				userData.credentials = doc.data();
				userData.credentials.userId = req.signin.uid;

				return db
					.collection('likes')
					.where('userName', '==', req.signin.userName)
					.get();
			}
		})
		.then((likesSnapshot) => {
			logger.debug(`getting likes of user: ${req.signin.uid}`);

			userData.likes = [];
			likesSnapshot.forEach((doc) => {
				userData.likes.push(doc.data());
			});

			return db
				.collection('notifications')
				.where('recipient', '==', req.signin.userName)
				.orderBy('createdAt', 'desc')
				.limit(10)
				.get();
		})
		.then((notificationsSnapshot) => {
			logger.debug(`getting notifications of user: ${req.signin.uid}`);

			userData.notifications = [];

			notificationsSnapshot.forEach((doc) => {
				userData.notifications.push({
					notificationId: doc.id,
					...doc.data()
				});
			});

			res.status(200).send(userData);
		})
		.catch((err) => {
			logger.error(`Unable to get user data due to: ${err}`);

			res.status(500).send({
				code: 500,
				message: 'Unable get user data'
			});
		});
});

module.exports = router;
