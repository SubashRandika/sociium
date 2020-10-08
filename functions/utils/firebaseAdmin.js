const fb = require('firebase');
const fbAdmin = require('firebase-admin');
const fbConfig = require('../config/firebaseConfig');

const firebase = fb.initializeApp(fbConfig);
const db = fbAdmin.database();

module.exports = { firebase, fbAdmin, db, fbConfig };
