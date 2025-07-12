const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate, validateParams, validateQuery } = require('../middlewares/validation.middleware');
const { upload,validateFileContent } = require('../middlewares/upload.middleware');
const {
  createPaymentSchema,
  updatePaymentSchema,
  paymentFilterSchema,
  paymentParamsSchema
} = require('../validators/payment.validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - memberId
 *         - amount
 *         - paymentType
 *         - paymentMethod
 *       properties:
 *         memberId:
 *           type: string
 *           description: Reference to Member ID
 *         amount:
 *           type: number
 *           minimum: 0
 *           description: Payment amount
 *         paymentType:
 *           type: string
 *           enum: [Membership Fee, Event Registration, Late Fee, Other]
 *           description: Type of payment
 *         paymentMethod:
 *           type: string
 *           enum: [Cash, Credit Card, Debit Card, Bank Transfer, Online, Cheque]
 *           description: Payment method used
 *         status:
 *           type: string
 *           enum: [Pending, Completed, Failed, Refunded]
 *           default: Pending
 *         transactionId:
 *           type: string
 *           description: Transaction reference ID
 *         description:
 *           type: string
 *           description: Payment description
 *         eventId:
 *           type: string
 *           description: Reference to Event ID (for event payments)
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: Payment created successfully
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
  validate(createPaymentSchema),
  PaymentController.createPayment
);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments with filtering (Admin only)
 *     tags: [Payments]
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
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filter by event ID
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
 *         description: Payments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/',
  authenticate,
  authorize('Admin'),
  validateQuery(paymentFilterSchema),
  PaymentController.getAllPayments
);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get('/:id',
  authenticate,
  authorize('Admin', 'Member'),
  validateParams(paymentParamsSchema),
  PaymentController.getPaymentById
);

/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update payment (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Completed, Failed, Refunded]
 *               transactionId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Payment not found
 */
router.put('/:id',
  authenticate,
  authorize('Admin'),
  validateParams(paymentParamsSchema),
  validate(updatePaymentSchema),
  PaymentController.updatePayment
);

/**
 * @swagger
 * /payments/member/{memberId}:
 *   get:
 *     summary: Get payments by member ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member payments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
router.get('/member/:memberId',
  authenticate,
  authorize('Admin', 'Member'),
  PaymentController.getPaymentsByMember
);

/**
 * @swagger
 * /payments/event/{eventId}:
 *   get:
 *     summary: Get payments by event ID (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event payments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Event not found
 */
router.get('/event/:eventId',
  authenticate,
  authorize('Admin'),
  PaymentController.getEventPayments
);

/**
 * @swagger
 * /payments/{id}/receipt:
 *   post:
 *     summary: Upload payment receipt (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               receipt:
 *                 type: string
 *                 format: binary
 *                 description: Receipt file
 *     responses:
 *       200:
 *         description: Receipt uploaded successfully
 *       400:
 *         description: File is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Payment not found
 */
router.post('/:id/receipt',
  authenticate,
  authorize('Admin'),
 
  validateParams(paymentParamsSchema),
   upload.single('receipt'),   
  
  validateFileContent, 
  PaymentController.uploadReceipt
);

module.exports = router;