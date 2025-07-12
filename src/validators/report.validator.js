// src/validators/report.validator.js
const Joi = require('joi');

const paymentReportSchema = Joi.object({
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  paymentType: Joi.string()
    .valid('Membership Fee', 'Event Registration', 'Late Fee', 'Other')
    .optional(),
  memberId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  status: Joi.string()
    .valid('Pending', 'Completed', 'Failed', 'Refunded')
    .optional(),
  paymentMethod: Joi.string()
    .valid('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online', 'Cheque')
    .optional(),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
});

const eventReportSchema = Joi.object({
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  status: Joi.string()
    .valid('Upcoming', 'Ongoing', 'Completed', 'Cancelled')
    .optional()
});

const memberReportSchema = Joi.object({
  zone: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  membershipType: Joi.string()
    .valid('Basic', 'Premium', 'VIP')
    .optional(),
  status: Joi.string()
    .valid('Active', 'Inactive', 'Suspended', 'Expired')
    .optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional()
});

module.exports = {
  paymentReportSchema,
  eventReportSchema,
  memberReportSchema
};