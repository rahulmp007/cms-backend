const crypto = require("crypto");

/**
 * Generates a unique ID with a prefix, timestamp, and random hex string.
 *
 * @param {string} prefix - Optional prefix for the ID (e.g., 'MEM', 'PAY').
 * @returns {string} - The generated unique ID in uppercase.
 */
const generateId = (prefix = "") => {
  const timestamp = Date.now().toString(36); // Base36 encoding for compact timestamp
  const randomStr = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}${timestamp}${randomStr}`.toUpperCase();
};

/**
 * Generates a unique Member ID with 'MEM' prefix.
 *
 * @returns {string} - Member ID.
 */
const generateMemberId = () => {
  return generateId("MEM");
};

/**
 * Generates a unique Payment ID with 'PAY' prefix.
 *
 * @returns {string} - Payment ID.
 */
const generatePaymentId = () => {
  return generateId("PAY");
};

/**
 * Formats a standard API response object.
 *
 * @param {boolean} success - Indicates success or failure.
 * @param {string} message - Human-readable message.
 * @param {any} [data=null] - Optional payload.
 * @returns {object} - Standardized API response.
 */
const formatResponse = (success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;

  return response;
};

module.exports = {
  generateId,
  generateMemberId,
  generatePaymentId,
  formatResponse,
};
