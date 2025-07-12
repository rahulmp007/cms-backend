// src/routes/notifications.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate, validateParams, validateQuery } = require('../middlewares/validation.middleware');
const {
  createNotificationSchema,
  sendToAllSchema,
  sendToMembersSchema,
  notificationFilterSchema,
  notificationParamsSchema
} = require('../validators/notification.validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - title
 *         - message
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Notification title
 *         message:
 *           type: string
 *           maxLength: 1000
 *           description: Notification message
 *         type:
 *           type: string
 *           enum: [General, Event, Payment, Membership, Reminder]
 *           description: Type of notification
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High, Urgent]
 *           default: Medium
 *         targetMembers:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of member IDs (empty array means all members)
 *         status:
 *           type: string
 *           enum: [Draft, Scheduled, Sent, Failed]
 *           default: Sent
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a new notification (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/',
  authenticate,
  authorize('Admin'),
  validate(createNotificationSchema),
  NotificationController.createNotification
);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [General, Event, Payment, Membership, Reminder]
 *         description: Filter by notification type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Draft, Scheduled, Sent, Failed]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/',
  authenticate,
  authorize('Admin'),
  validateQuery(notificationFilterSchema),
  NotificationController.getAllNotifications
);

/**
 * @swagger
 * /notifications/my:
 *   get:
 *     summary: Get my notifications (Member only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Show only unread notifications
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Your notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member profile not found
 */
router.get('/my',
  authenticate,
  authorize('Member'),
  validateQuery(notificationFilterSchema),
  NotificationController.getMyNotifications
);

/**
 * @swagger
 * /notifications/send-all:
 *   post:
 *     summary: Send notification to all members (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *               type:
 *                 type: string
 *                 enum: [General, Event, Payment, Membership, Reminder]
 *                 default: General
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Urgent]
 *                 default: Medium
 *     responses:
 *       201:
 *         description: Notification sent to all members
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/send-all',
  authenticate,
  authorize('Admin'),
  validate(sendToAllSchema),
  NotificationController.sendToAllMembers
);

/**
 * @swagger
 * /notifications/send-members:
 *   post:
 *     summary: Send notification to specific members (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - targetMembers
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *               type:
 *                 type: string
 *                 enum: [General, Event, Payment, Membership, Reminder]
 *                 default: General
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Urgent]
 *                 default: Medium
 *               targetMembers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of member IDs
 *     responses:
 *       201:
 *         description: Notification sent to selected members
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/send-members',
  authenticate,
  authorize('Admin'),
  validate(sendToMembersSchema),
  NotificationController.sendToMembers
);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.get('/:id',
  authenticate,
  authorize('Admin', 'Member'),
  validateParams(notificationParamsSchema),
  NotificationController.getNotificationById
);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete notification (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Notification not found
 */
router.delete('/:id',
  authenticate,
  authorize('Admin'),
  validateParams(notificationParamsSchema),
  NotificationController.deleteNotification
);

module.exports = router;