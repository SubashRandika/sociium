const express = require('express');
const router = express.Router();
const Busboy = require('busboy');
const { db, fbAdmin, fbConfig } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');
const path = require('path');
const os = require('os');
const fs = require('fs');

router.post('/image', (req, res) => {
	logger.debug(`${req.path} reached.`);

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

				return db.doc(`users/${req.signin.user}`).update({ imageUrl });
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

module.exports = router;
