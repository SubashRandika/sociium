const fbConfig = require('../config/firebaseConfig');
const firebase = require('firebase').initializeApp(fbConfig);
const fbAdmin = require('firebase-admin').initializeApp(fbConfig);

const db = fbAdmin.firestore();

module.exports = { firebase, fbAdmin, db, fbConfig };
