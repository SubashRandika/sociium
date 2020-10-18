const functions = require('firebase-functions');
const express = require('express');
const app = express();
const posts = require('./routes/posts');
const signin = require('./routes/signin');
const signup = require('./routes/signup');
const users = require('./routes/users');
const notificationsMarksRead = require('./routes/notifications');
const userDetails = require('./routes/userDetails');
const firebaseAuth = require('./middleware/firebaseAuth');
const notifications = require('./triggers/notifications');
const cleanup = require('./triggers/cleanup');
const updatePosts = require('./triggers/updatePosts');

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

// public route of users details
app.use('/userDetails', userDetails);

// notifications marks as read
app.use('/notifications', firebaseAuth, notificationsMarksRead);

exports.api = functions.https.onRequest(app);

exports.notify = notifications;
exports.cleanup = cleanup;
exports.updatePosts = updatePosts;
