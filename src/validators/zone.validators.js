const Joi = require('joi');

const createZoneSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Zone name is required',
      'string.min': 'Zone name must be at least 2 characters long',
      'string.max': 'Zone name cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

const updateZoneSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Zone name must be at least 2 characters long',
      'string.max': 'Zone name cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

const zoneFilterSchema = Joi.object({
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
    .valid('name', 'createdAt')
    .default('name'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('asc')
});

const zoneParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid zone ID format'
    })
});

module.exports = {
  createZoneSchema,
  updateZoneSchema,
  zoneFilterSchema,
  zoneParamsSchema
};