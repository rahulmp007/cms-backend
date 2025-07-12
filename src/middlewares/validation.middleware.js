const { formatResponse } = require('../utils/helpers');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Middleware to validate the request body using a Joi schema.
 *
 * @param {Object} schema - Joi schema to validate against.
 * @returns {Function} Express middleware function.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, errorMessage)
      );
    }

    next();
  };
};

/**
 * Middleware to validate route parameters using a Joi schema.
 *
 * @param {Object} schema - Joi schema to validate route params.
 * @returns {Function} Express middleware function.
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, errorMessage)
      );
    }

    next();
  };
};

/**
 * Middleware to validate query parameters using a Joi schema.
 *
 * @param {Object} schema - Joi schema to validate query string.
 * @returns {Function} Express middleware function.
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        formatResponse(false, errorMessage)
      );
    }

    next();
  };
};

module.exports = {
  validate,
  validateParams,
  validateQuery
};
