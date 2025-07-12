const AuthService = require("../services/auth.service");
const { formatResponse } = require("../utils/helpers");
const { HTTP_STATUS } = require("../config/constants");

/**
 * Controller for authentication-related endpoints.
 */
class AuthController {
  /**
   * @route POST /auth/register
   * @desc Register a new user
   * @access Public
   */
  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);

      res
        .status(HTTP_STATUS.CREATED)
        .json(formatResponse(true, "User registered successfully", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /auth/login
   * @desc Login user and return token
   * @access Public
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Login successful", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /auth/profile
   * @desc Get the profile of the logged-in user
   * @access Private
   */
  async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);

      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Profile retrieved successfully", { user }));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
