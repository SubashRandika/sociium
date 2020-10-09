const functions = require('firebase-functions');
const express = require('express');
const app = express();
const posts = require('./routes/posts');
const signin = require('./routes/signin');
const firebaseAuth = require('./middleware/firebaseAuth');

// built-in middlewares
app.use(express.json());
// encode complex objects like arrays, json objects.
app.use(express.urlencoded({ extended: true }));

// protected posts route
app.use('/posts', firebaseAuth, posts);

// signin route
app.use('/signin', signin);

exports.api = functions.region('us-central').https.onRequest(app);
