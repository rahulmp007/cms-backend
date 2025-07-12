const admin = require('firebase-admin');
const config = require('./index');
const logger = require('../utils/logger');

let firebaseApp = null;

const initializeFirebase = () => {
  if (!firebaseApp && config.FIREBASE_PROJECT_ID) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.FIREBASE_PROJECT_ID,
          clientEmail: config.FIREBASE_CLIENT_EMAIL,
          privateKey: config.FIREBASE_PRIVATE_KEY
        }),
        storageBucket: config.FIREBASE_STORAGE_BUCKET
      });
      logger.info('Firebase initialized successfully');
    } catch (error) {
      logger.error('Firebase initialization failed:', error);
    }
  }
  return firebaseApp;
};

const getFirebaseApp = () => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

module.exports = {
  initializeFirebase,
  getFirebaseApp
};