const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * AuthService handles user authentication, including registration,
 * login, token generation, and profile retrieval.
 */
class AuthService {
  /**
   * Generates a JWT token for the given user ID.
   * @param {string} userId - The ID of the user.
   * @returns {string} JWT token.
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }

  /**
   * Registers a new user.
   * @param {Object} userData - The user data to register.
   * @throws {Error} If a user already exists with the given email.
   * @returns {Object} The created user (excluding password) and JWT token.
   */
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const user = new User(userData);
    await user.save();

    const token = this.generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      token,
    };
  }

  /**
   * Logs in a user with email and password.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @throws {Error} If credentials are invalid or account is deactivated.
   * @returns {Object} The logged-in user (excluding password) and JWT token.
   */
  async login(email, password) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      token,
    };
  }

  /**
   * Retrieves a user profile by ID.
   * @param {string} userId - The ID of the user.
   * @throws {Error} If the user is not found.
   * @returns {Object} The user profile (excluding password).
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

module.exports = new AuthService();
