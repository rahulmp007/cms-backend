// src/validators/notification.validator.js
const Joi = require('joi');

const createNotificationSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Notification title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  
  message: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Notification message is required',
      'string.min': 'Message must be at least 10 characters long',
      'string.max': 'Message cannot exceed 1000 characters'
    }),
  
  type: Joi.string()
    .valid('General', 'Event', 'Payment', 'Membership', 'Reminder')
    .required()
    .messages({
      'any.only': 'Invalid notification type'
    }),
  
  priority: Joi.string()
    .valid('Low', 'Medium', 'High', 'Urgent')
    .default('Medium'),
  
  targetMembers: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .default([])
    .messages({
      'array.base': 'Target members must be an array',
      'string.pattern.base': 'Invalid member ID format'
    }),
  
  status: Joi.string()
    .valid('Draft', 'Scheduled', 'Sent', 'Failed')
    .default('Sent')
});

const sendToAllSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required(),
  
  message: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required(),
  
  type: Joi.string()
    .valid('General', 'Event', 'Payment', 'Membership', 'Reminder')
    .default('General'),
  
  priority: Joi.string()
    .valid('Low', 'Medium', 'High', 'Urgent')
    .default('Medium')
});

const sendToMembersSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required(),
  
  message: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required(),
  
  type: Joi.string()
    .valid('General', 'Event', 'Payment', 'Membership', 'Reminder')
    .default('General'),
  
  priority: Joi.string()
    .valid('Low', 'Medium', 'High', 'Urgent')
    .default('Medium'),
  
  targetMembers: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one target member is required',
      'string.pattern.base': 'Invalid member ID format'
    })
});

const notificationFilterSchema = Joi.object({
  type: Joi.string()
    .valid('General', 'Event', 'Payment', 'Membership', 'Reminder')
    .optional(),
  
  priority: Joi.string()
    .valid('Low', 'Medium', 'High', 'Urgent')
    .optional(),
  
  status: Joi.string()
    .valid('Draft', 'Scheduled', 'Sent', 'Failed')
    .optional(),
  
  unreadOnly: Joi.boolean()
    .default(false),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
});

const notificationParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid notification ID format'
    })
});

module.exports = {
  createNotificationSchema,
  sendToAllSchema,
  sendToMembersSchema,
  notificationFilterSchema,
  notificationParamsSchema
};