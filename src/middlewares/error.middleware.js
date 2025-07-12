const logger = require("../utils/logger");
const { formatResponse } = require("../utils/helpers");
const { HTTP_STATUS } = require("../config/constants");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { statusCode: HTTP_STATUS.NOT_FOUND, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { statusCode: HTTP_STATUS.CONFLICT, message };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { statusCode: HTTP_STATUS.BAD_REQUEST, message };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { statusCode: HTTP_STATUS.UNAUTHORIZED, message };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { statusCode: HTTP_STATUS.UNAUTHORIZED, message };
  }

  res
    .status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR)
    .json(formatResponse(false, error.message || "Server Error"));
};

const notFoundHandler = (req, res) => {
  const language = req.language || "en";
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message:
      getLocalizedMessage("NOT_FOUND", language) ||
      `Route ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFoundHandler };
