const mongoose = require("mongoose");
const config = require("./index");
const logger = require("../utils/logger");

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
};

module.exports = { connectDatabase };
