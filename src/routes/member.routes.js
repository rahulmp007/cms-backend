const express = require('express');
const router = express.Router();
const MemberController = require('../controllers/member.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate, validateParams, validateQuery } = require('../middlewares/validation.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');
const {
  createMemberSchema,
  updateMemberSchema,
  memberFilterSchema,
  memberParamsSchema,
  renewMembershipSchema
} = require('../validators/member.validator');


/**
 * @swagger
 * components:
 *   schemas:
 *     Member:
 *       type: object
 *       required:
 *         - userId
 *         - name
 *         - phone
 *         - zoneId
 *         - membershipType
 *         - renewalDate
 *       properties:
 *         userId:
 *           type: string
 *           description: Reference to User ID
 *         name:
 *           type: string
 *           description: Member's full name
 *         phone:
 *           type: string
 *           description: Member's phone number
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             country:
 *               type: string
 *         zoneId:
 *           type: string
 *           description: Reference to Zone ID
 *         membershipType:
 *           type: string
 *           enum: [Basic, Premium, VIP]
 *         status:
 *           type: string
 *           enum: [Active, Inactive, Suspended, Expired]
 *           default: Active
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         renewalDate:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /members:
 *   post:
 *     summary: Create a new member (Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Member'
 *     responses:
 *       201:
 *         description: Member created successfully
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
  validate(createMemberSchema),
  MemberController.createMember
);

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Get all members with filtering (Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: zone
 *         schema:
 *           type: string
 *         description: Filter by zone ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, Suspended, Expired]
 *         description: Filter by member status
 *       - in: query
 *         name: membershipType
 *         schema:
 *           type: string
 *           enum: [Basic, Premium, VIP]
 *         description: Filter by membership type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, memberId, phone
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
 *         description: Members retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/',
  authenticate,
  authorize('Admin'),
  validateQuery(memberFilterSchema),
  MemberController.getAllMembers
);

/**
 * @swagger
 * /members/search:
 *   get:
 *     summary: Search members (Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Search term is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/search',
  authenticate,
  authorize('Admin'),
  MemberController.searchMembers
);

/**
 * @swagger
 * /members/me:
 *   get:
 *     summary: Get my member profile (Member only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member profile not found
 */
router.get('/me',
  authenticate,
  authorize('Member'),
  MemberController.getMyProfile
);

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     summary: Get member by ID
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
router.get('/:id',
  authenticate,
  authorize('Admin', 'Member'),
  validateParams(memberParamsSchema),
  MemberController.getMemberById
);

/**
 * @swagger
 * /members/{id}:
 *   put:
 *     summary: Update member (Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Member'
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Member not found
 */
router.put('/:id',
  authenticate,
  authorize('Admin'),
  validateParams(memberParamsSchema),
  validate(updateMemberSchema),
  MemberController.updateMember
);

/**
 * @swagger
 * /members/{id}/disable:
 *   patch:
 *     summary: Disable member (Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member disabled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Member not found
 */
router.patch('/:id/disable',
  authenticate,
  authorize('Admin'),
  validateParams(memberParamsSchema),
  MemberController.disableMember
);

/**
 * @swagger
 * /members/{id}/qr-code:
 *   get:
 *     summary: Get member QR code
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     responses:
 *       200:
 *         description: QR code retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
router.get('/:id/qr-code',
  authenticate,
  authorize('Admin', 'Member'),
  validateParams(memberParamsSchema),
  MemberController.getMemberQRCode
);



/**
 * @swagger
 * /members/{id}/renew:
 *   post:
 *     summary: Renew member membership (Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - renewalPeriod
 *               - paymentAmount
 *             properties:
 *               renewalPeriod:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 60
 *                 description: Renewal period in months
 *               paymentAmount:
 *                 type: number
 *                 minimum: 0
 *                 description: Payment amount for renewal
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Credit Card, Debit Card, Bank Transfer, Online, Cheque]
 *                 description: Payment method used
 *               transactionId:
 *                 type: string
 *                 description: Transaction reference ID
 *     responses:
 *       200:
 *         description: Membership renewed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Member not found
 */
router.post('/:id/renew',
  authenticate,
  authorize('Admin'),
  validateParams(memberParamsSchema),
  validate(renewMembershipSchema),
  MemberController.renewMembership
);

/**
 * @swagger
 * /members/expiring-soon:
 *   get:
 *     summary: Get members with expiring memberships (Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Number of days to check for expiring memberships
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
 *         description: Expiring members retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/expiring-soon',
  authenticate,
  authorize('Admin'),
  MemberController.getExpiringMembers
);

/**
 * @swagger
 * /members/{id}/extend:
 *   put:
 *     summary: Extend member membership without payment (Admin only)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newRenewalDate
 *             properties:
 *               newRenewalDate:
 *                 type: string
 *                 format: date
 *                 description: New renewal date
 *               reason:
 *                 type: string
 *                 description: Reason for extension
 *     responses:
 *       200:
 *         description: Membership extended successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Member not found
 */
router.put('/:id/extend',
  authenticate,
  authorize('Admin'),
  validateParams(memberParamsSchema),
  MemberController.extendMembership
);

module.exports = router;
