const Joi = require('joi');

const createMemberSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'string.empty': 'User ID is required'
    }),
  
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long'
    }),
  
  phone: Joi.string()
    .pattern(/^\+?[\d\s-()]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'string.empty': 'Phone number is required'
    }),
  
  address: Joi.object({
    street: Joi.string().trim().allow(''),
    city: Joi.string().trim().allow(''),
    state: Joi.string().trim().allow(''),
    zipCode: Joi.string().trim().allow(''),
    country: Joi.string().trim().allow('')
  }).optional(),
  
  zoneId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid zone ID format',
      'string.empty': 'Zone is required'
    }),
  
  membershipType: Joi.string()
    .valid('Basic', 'Premium', 'VIP')
    .required()
    .messages({
      'any.only': 'Membership type must be Basic, Premium, or VIP',
      'string.empty': 'Membership type is required'
    }),
  
  dateOfBirth: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': 'Date of birth cannot be in the future'
    }),
  
  renewalDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'Renewal date must be in the future',
      'date.base': 'Renewal date is required'
    })
});

const updateMemberSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional(),
  
  phone: Joi.string()
    .pattern(/^\+?[\d\s-()]+$/)
    .optional(),
  
  address: Joi.object({
    street: Joi.string().trim().allow(''),
    city: Joi.string().trim().allow(''),
    state: Joi.string().trim().allow(''),
    zipCode: Joi.string().trim().allow(''),
    country: Joi.string().trim().allow('')
  }).optional(),
  
  zoneId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  
  membershipType: Joi.string()
    .valid('Basic', 'Premium', 'VIP')
    .optional(),
  
  status: Joi.string()
    .valid('Active', 'Inactive', 'Suspended', 'Expired')
    .optional(),
  
  dateOfBirth: Joi.date()
    .max('now')
    .optional(),
  
  renewalDate: Joi.date()
    .min('now')
    .optional()
});

const memberFilterSchema = Joi.object({
  zone: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  
  status: Joi.string()
    .valid('Active', 'Inactive', 'Suspended', 'Expired')
    .optional(),
  
  membershipType: Joi.string()
    .valid('Basic', 'Premium', 'VIP')
    .optional(),
  
  search: Joi.string()
    .trim()
    .max(100)
    .optional(),
  
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
    .valid('name', 'memberId', 'joinDate', 'renewalDate')
    .default('createdAt'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
});

const memberParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid member ID format'
    })
});


const renewMembershipSchema = Joi.object({
  renewalPeriod: Joi.number()
    .integer()
    .min(1)
    .max(60)
    .required()
    .messages({
      'number.min': 'Renewal period must be at least 1 month',
      'number.max': 'Renewal period cannot exceed 60 months',
      'number.base': 'Renewal period is required'
    }),
  
  paymentAmount: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Payment amount cannot be negative',
      'number.base': 'Payment amount is required'
    }),
  
  paymentMethod: Joi.string()
    .valid('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online', 'Cheque')
    .required()
    .messages({
      'any.only': 'Invalid payment method'
    }),
  
  transactionId: Joi.string()
    .trim()
    .max(100)
    .optional()
});

const extendMembershipSchema = Joi.object({
  newRenewalDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'New renewal date must be in the future',
      'date.base': 'New renewal date is required'
    }),
  
  reason: Joi.string()
    .trim()
    .max(500)
    .optional()
});

// Add to module.exports
module.exports = {
  createMemberSchema,
  updateMemberSchema,
  memberFilterSchema,
  memberParamsSchema,
  renewMembershipSchema,
  extendMembershipSchema
};

