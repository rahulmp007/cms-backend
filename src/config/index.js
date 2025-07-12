require("dotenv").config();

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,

  // Database
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/cms",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",

  // Firebase
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,

  // Upload limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,


  // auth
  PASSWORD_MIN_LENGTH: 6,
};

module.exports = config;
