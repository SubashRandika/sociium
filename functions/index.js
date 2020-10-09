const functions = require('firebase-functions');
const express = require('express');
const app = express();
const posts = require('./routes/posts');
const signin = require('./routes/signin');
const signup = require('./routes/signup');
const users = require('./routes/users');
const firebaseAuth = require('./middleware/firebaseAuth');

// built-in middlewares
app.use(express.json());
// encode complex objects like arrays, json objects.
app.use(express.urlencoded({ extended: true }));

// signin route
app.use('/signin', signin);

// signup route
app.use('/signup', signup);

// protected posts route
app.use('/posts', firebaseAuth, posts);

// protected users route
app.use('/users', firebaseAuth, users);

exports.api = functions.region('us-central').https.onRequest(app);
