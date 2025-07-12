const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { formatResponse } = require("../utils/helpers");
const { HTTP_STATUS } = require("../config/constants");

/**
 * Middleware to authenticate user using JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(formatResponse(false, "Access denied. No token provided."));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(
          formatResponse(
            false,
            user ? "Account is deactivated." : "Invalid token. User not found."
          )
        );
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json(formatResponse(false, "Invalid or expired token."));
  }
};

/**
 * Middleware to authorize based on user roles
 * @param  {...string} roles - allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(formatResponse(false, "Authentication required."));
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json(
          formatResponse(false, "Access denied. Insufficient permissions.")
        );
    }

    next();
  };
};

module.exports = { authenticate, authorize };
