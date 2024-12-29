const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY)),
});

module.exports = admin;