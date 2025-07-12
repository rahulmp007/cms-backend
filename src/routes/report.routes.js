// src/routes/reports.js
const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validateQuery } = require('../middlewares/validation.middleware');
const {
  paymentReportSchema,
  eventReportSchema,
  memberReportSchema
} = require('../validators/report.validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardOverview:
 *       type: object
 *       properties:
 *         members:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             active:
 *               type: integer
 *             newThisMonth:
 *               type: integer
 *             recentlyJoined:
 *               type: integer
 *         payments:
 *           type: object
 *           properties:
 *             thisMonth:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 amount:
 *                   type: number
 *             lastMonth:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 amount:
 *                   type: number
 *         events:
 *           type: object
 *           properties:
 *             upcoming:
 *               type: integer
 *             thisMonth:
 *               type: integer
 *     MemberStatistics:
 *       type: object
 *       properties:
 *         totalMembers:
 *           type: integer
 *         recentRegistrations:
 *           type: integer
 *         expiringMemberships:
 *           type: integer
 *         membersByStatus:
 *           type: object
 *         membersByType:
 *           type: object
 *         membersByZone:
 *           type: object
 *     PaymentSummary:
 *       type: object
 *       properties:
 *         totalPayments:
 *           type: integer
 *         totalAmount:
 *           type: number
 *         averageAmount:
 *           type: number
 *         paymentsByStatus:
 *           type: object
 *         paymentsByType:
 *           type: object
 *         monthlyTrends:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /reports/dashboard:
 *   get:
 *     summary: Get dashboard overview (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       $ref: '#/components/schemas/DashboardOverview'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/dashboard',
  authenticate,
  authorize('Admin'),
  ReportController.getDashboardOverview
);

/**
 * @swagger
 * /reports/members/statistics:
 *   get:
 *     summary: Get member statistics (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       $ref: '#/components/schemas/MemberStatistics'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/members/statistics',
  authenticate,
  authorize('Admin'),
  ReportController.getMemberStatistics
);

/**
 * @swagger
 * /reports/members/detailed:
 *   get:
 *     summary: Get detailed member report (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: zone
 *         schema:
 *           type: string
 *         description: Filter by zone ID
 *       - in: query
 *         name: membershipType
 *         schema:
 *           type: string
 *           enum: [Basic, Premium, VIP]
 *         description: Filter by membership type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, Suspended, Expired]
 *         description: Filter by member status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter members from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter members to this date
 *     responses:
 *       200:
 *         description: Detailed member report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/members/detailed',
  authenticate,
  authorize('Admin'),
  validateQuery(memberReportSchema),
  ReportController.getDetailedMemberReport
);

/**
 * @swagger
 * /reports/payments/summary:
 *   get:
 *     summary: Get payment summary (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments to this date
 *       - in: query
 *         name: paymentType
 *         schema:
 *           type: string
 *           enum: [Membership Fee, Event Registration, Late Fee, Other]
 *         description: Filter by payment type
 *     responses:
 *       200:
 *         description: Payment summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       $ref: '#/components/schemas/PaymentSummary'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/payments/summary',
  authenticate,
  authorize('Admin'),
  validateQuery(paymentReportSchema),
  ReportController.getPaymentSummary
);

/**
 * @swagger
 * /reports/payments/detailed:
 *   get:
 *     summary: Get detailed payment report (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *         description: Filter by member ID
 *       - in: query
 *         name: paymentType
 *         schema:
 *           type: string
 *           enum: [Membership Fee, Event Registration, Late Fee, Other]
 *         description: Filter by payment type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Completed, Failed, Refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [Cash, Credit Card, Debit Card, Bank Transfer, Online, Cheque]
 *         description: Filter by payment method
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments to this date
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
 *           maximum: 100
 *           default: 50
 *     responses:
 *       200:
 *         description: Detailed payment report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/payments/detailed',
  authenticate,
  authorize('Admin'),
  validateQuery(paymentReportSchema),
  ReportController.getDetailedPaymentReport
);

/**
 * @swagger
 * /reports/events/statistics:
 *   get:
 *     summary: Get event statistics (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Upcoming, Ongoing, Completed, Cancelled]
 *         description: Filter by event status
 *     responses:
 *       200:
 *         description: Event statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/events/statistics',
  authenticate,
  authorize('Admin'),
  validateQuery(eventReportSchema),
  ReportController.getEventStatistics
);

/**
 * @swagger
 * /reports/events/detailed:
 *   get:
 *     summary: Get detailed event report (Admin only)
 *     tags: [Reports]
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
 *     responses:
 *       200:
 *         description: Detailed event report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/events/detailed',
  authenticate,
  authorize('Admin'),
  validateQuery(eventReportSchema),
  ReportController.getDetailedEventReport
);

/**
 * @swagger
 * /reports/zones:
 *   get:
 *     summary: Get zone report (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Zone report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     zones:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           totalMembers:
 *                             type: integer
 *                           activeMembers:
 *                             type: integer
 *                           membersByType:
 *                             type: object
 *                             properties:
 *                               basic:
 *                                 type: integer
 *                               premium:
 *                                 type: integer
 *                               vip:
 *                                 type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/zones',
  authenticate,
  authorize('Admin'),
  ReportController.getZoneReport
);

module.exports = router;