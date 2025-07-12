const express = require('express');
const router = express.Router();
const ZoneController = require('../controllers/zone.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate, validateParams, validateQuery } = require('../middlewares/validation.middleware');
const {
  createZoneSchema,
  updateZoneSchema,
  zoneFilterSchema,
  zoneParamsSchema
} = require('../validators/zone.validators');

/**
 * @swagger
 * components:
 *   schemas:
 *     Zone:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Zone name
 *           minLength: 2
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: Zone description
 *           maxLength: 500
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the zone is active
 *         memberCount:
 *           type: integer
 *           description: Total number of members in this zone (read-only)
 *         activeMemberCount:
 *           type: integer
 *           description: Number of active members in this zone (read-only)
 */

/**
 * @swagger
 * /zones:
 *   post:
 *     summary: Create a new zone (Admin only)
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Downtown Area"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Central business district and surrounding areas"
 *     responses:
 *       201:
 *         description: Zone created successfully
 *       400:
 *         description: Validation error or zone name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/',
  authenticate,
  authorize('Admin'),
  validate(createZoneSchema),
  ZoneController.createZone
);



/**
 * @swagger
 * /zones/search:
 *   get:
 *     summary: Search zones (Quick search)
 *     tags: [Zones]
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
 */
router.get('/search',
  authenticate,
  authorize('Admin', 'Member'),
  ZoneController.searchZones
);



/**
 * @swagger
 * /zones/{id}:
 *   put:
 *     summary: Update zone (Admin only)
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Zone ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Zone updated successfully
 *       400:
 *         description: Validation error or zone name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Zone not found
 */
router.put('/:id',
  authenticate,
  authorize('Admin'),
  validateParams(zoneParamsSchema),
  validate(updateZoneSchema),
  ZoneController.updateZone
);

/**
 * @swagger
 * /zones/{id}:
 *   delete:
 *     summary: Delete zone (Admin only)
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Zone ID
 *     responses:
 *       200:
 *         description: Zone deleted successfully
 *       400:
 *         description: Cannot delete zone with active members
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Zone not found
 */
router.delete('/:id',
  authenticate,
  authorize('Admin'),
  validateParams(zoneParamsSchema),
  ZoneController.deleteZone
);

/**
 * @swagger
 * /zones/{id}/members:
 *   get:
 *     summary: Get all members in a zone (Admin only)
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Zone ID
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
 *         description: Zone members retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Zone not found
 */
router.get('/:id/members',
  authenticate,
  authorize('Admin'),
  validateParams(zoneParamsSchema),
  ZoneController.getZoneMembers
);

/**
 * @swagger
 * /zones/{id}/statistics:
 *   get:
 *     summary: Get zone statistics (Admin only)
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Zone ID
 *     responses:
 *       200:
 *         description: Zone statistics retrieved successfully
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
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         memberCount:
 *                           type: integer
 *                         activeMemberCount:
 *                           type: integer
 *                         membersByType:
 *                           type: object
 *                           properties:
 *                             basic:
 *                               type: integer
 *                             premium:
 *                               type: integer
 *                             vip:
 *                               type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Zone not found
 */
router.get('/:id/statistics',
  authenticate,
  authorize('Admin'),
  validateParams(zoneParamsSchema),
  ZoneController.getZoneStatistics
);

module.exports = router;