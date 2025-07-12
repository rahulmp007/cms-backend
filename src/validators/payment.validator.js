const Joi = require('joi');

const createPaymentSchema = Joi.object({
  memberId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid member ID format'
    }),
  
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.base': 'Amount is required'
    }),
  
  paymentType: Joi.string()
    .valid('Membership Fee', 'Event Registration', 'Late Fee', 'Other')
    .required()
    .messages({
      'any.only': 'Invalid payment type'
    }),
  
  paymentMethod: Joi.string()
    .valid('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online', 'Cheque')
    .required()
    .messages({
      'any.only': 'Invalid payment method'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .optional(),
  
  eventId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid event ID format'
    }),
  
  transactionId: Joi.string()
    .trim()
    .max(100)
    .optional()
});

const updatePaymentSchema = Joi.object({
  status: Joi.string()
    .valid('Pending', 'Completed', 'Failed', 'Refunded')
    .optional(),
  
  transactionId: Joi.string()
    .trim()
    .max(100)
    .optional(),
  
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
});

const paymentFilterSchema = Joi.object({
  memberId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  
  paymentType: Joi.string()
    .valid('Membership Fee', 'Event Registration', 'Late Fee', 'Other')
    .optional(),
  
  status: Joi.string()
    .valid('Pending', 'Completed', 'Failed', 'Refunded')
    .optional(),
  
  eventId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  
  sortBy: Joi.string()
    .valid('paymentDate', 'amount', 'createdAt')
    .default('paymentDate'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
});

const paymentParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid payment ID format'
    })
});

module.exports = {
  createPaymentSchema,
  updatePaymentSchema,
  paymentFilterSchema,
  paymentParamsSchema
};
