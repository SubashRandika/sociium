const functions = require('firebase-functions');
const express = require('express');
const app = express();
const posts = require('./routes/posts');
const firebaseAuth = require('./middleware/firebaseAuth');

// built-in middlewares
app.use(express.json());
// encode complex objects like arrays, json objects.
app.use(express.urlencoded({ extended: true }));

// protected posts route
app.use('/posts', firebaseAuth, posts);

exports.api = functions.region('us-central').https.onRequest(app);
