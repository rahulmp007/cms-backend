const express = require('express');
const router = express.Router();
const EventController = require('../controllers/event.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate, validateParams, validateQuery } = require('../middlewares/validation.middleware');
const {
  createEventSchema,
  updateEventSchema,
  eventFilterSchema,
  attendanceSchema,
  eventParamsSchema
} = require('../validators/event.validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - eventDate
 *         - location
 *       properties:
 *         title:
 *           type: string
 *           description: Event title
 *         description:
 *           type: string
 *           description: Event description
 *         eventDate:
 *           type: string
 *           format: date-time
 *           description: Event date and time
 *         location:
 *           type: string
 *           description: Event location
 *         maxAttendees:
 *           type: integer
 *           minimum: 1
 *           description: Maximum number of attendees
 *         registrationFee:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Registration fee
 *         status:
 *           type: string
 *           enum: [Upcoming, Ongoing, Completed, Cancelled]
 *           default: Upcoming
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
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
  validate(createEventSchema),
  EventController.createEvent
);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events with filtering
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Upcoming, Ongoing, Completed, Cancelled]
 *         description: Filter by event status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events to this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, location
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  authenticate,
  authorize('Admin', 'Member'),
  validateQuery(eventFilterSchema),
  EventController.getAllEvents
);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
router.get('/:id',
  authenticate,
  authorize('Admin', 'Member'),
  validateParams(eventParamsSchema),
  EventController.getEventById
);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Event not found
 */
router.put('/:id',
  authenticate,
  authorize('Admin'),
  validateParams(eventParamsSchema),
  validate(updateEventSchema),
  EventController.updateEvent
);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Event not found
 */
router.delete('/:id',
  authenticate,
  authorize('Admin'),
  validateParams(eventParamsSchema),
  EventController.deleteEvent
);

/**
 * @swagger
 * /events/{id}/register:
 *   post:
 *     summary: Register member for event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId:
 *                 type: string
 *                 description: Member ID to register
 *     responses:
 *       200:
 *         description: Member registered for event successfully
 *       400:
 *         description: Validation error or member already registered
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Event or member not found
 */
router.post('/:id/register',
  authenticate,
  authorize('Admin'),
  validateParams(eventParamsSchema),
  EventController.registerForEvent
);

/**
 * @swagger
 * /events/{id}/attendance:
 *   patch:
 *     summary: Record event attendance (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AttendanceRecord'
 *     responses:
 *       200:
 *         description: Attendance recorded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Event or member not found
 */
router.patch('/:id/attendance',
  authenticate,
  authorize('Admin'),
  validateParams(eventParamsSchema),
  validate(attendanceSchema),
  EventController.recordAttendance
);

/**
 * @swagger
 * /events/{id}/attendees:
 *   get:
 *     summary: Get event attendees (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event attendees retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Event not found
 */
router.get('/:id/attendees',
  authenticate,
  authorize('Admin'),
  validateParams(eventParamsSchema),
  EventController.getEventAttendees
);

module.exports = router;
