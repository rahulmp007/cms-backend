const Joi = require('joi');

const createEventSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Event title is required',
      'string.min': 'Title must be at least 3 characters long'
    }),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Event description is required',
      'string.min': 'Description must be at least 10 characters long'
    }),
  
  eventDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'Event date must be in the future',
      'date.base': 'Event date is required'
    }),
  
  location: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Event location is required'
    }),
  
  maxAttendees: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.min': 'Maximum attendees must be at least 1'
    }),
  
  registrationFee: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.min': 'Registration fee cannot be negative'
    })
});

const updateEventSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .optional(),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .optional(),
  
  eventDate: Joi.date()
    .min('now')
    .optional(),
  
  location: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .optional(),
  
  maxAttendees: Joi.number()
    .integer()
    .min(1)
    .optional(),
  
  registrationFee: Joi.number()
    .min(0)
    .optional(),
  
  status: Joi.string()
    .valid('Upcoming', 'Ongoing', 'Completed', 'Cancelled')
    .optional()
});

const eventFilterSchema = Joi.object({
  status: Joi.string()
    .valid('Upcoming', 'Ongoing', 'Completed', 'Cancelled')
    .optional(),
  
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  
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
    .valid('title', 'eventDate', 'createdAt')
    .default('eventDate'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('asc')
});

const attendanceSchema = Joi.object({
  memberId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid member ID format'
    }),
  
  attendanceStatus: Joi.string()
    .valid('Registered', 'Attended', 'No Show')
    .required()
});

const eventParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid event ID format'
    })
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  eventFilterSchema,
  attendanceSchema,
  eventParamsSchema
};
