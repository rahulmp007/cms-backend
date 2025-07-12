const ZoneService = require("../services/zone.service");
const { formatResponse } = require("../utils/helpers");
const { HTTP_STATUS } = require("../config/constants");

class ZoneController {
  /**
   * @route POST /zones
   * @desc Create a new zone
   * @access Admin
   */
  async createZone(req, res, next) {
    try {
      const zone = await ZoneService.createZone(req.body);
      res
        .status(HTTP_STATUS.CREATED)
        .json(formatResponse(true, "Zone created successfully", { zone }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /zones/:id
   * @desc Update a zone
   * @access Admin
   */
  async updateZone(req, res, next) {
    try {
      const zone = await ZoneService.updateZone(req.params.id, req.body);
      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Zone updated successfully", { zone }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /zones/:id
   * @desc Delete a zone
   * @access Admin
   */
  async deleteZone(req, res, next) {
    try {
      await ZoneService.deleteZone(req.params.id);
      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Zone deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /zones/:id/members
   * @desc Get members in a zone
   * @access Private
   */
  async getZoneMembers(req, res, next) {
    try {
      const result = await ZoneService.getZoneMembers(req.params.id, req.query);
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Zone members retrieved successfully", result)
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /zones/search
   * @desc Search zones by name or description
   * @access Private
   */
  async searchZones(req, res, next) {
    try {
      const { search } = req.query;

      if (!search || search.trim() === "") {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(formatResponse(false, "Search term is required"));
      }

      const zones = await ZoneService.searchZones(search);
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Zone search completed successfully", { zones })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /zones/:id/statistics
   * @desc Get statistics for a specific zone
   * @access Private
   */
  async getZoneStatistics(req, res, next) {
    try {
      const zone = await ZoneService.getZoneById(req.params.id);

      const statistics = {
        name: zone.name,
        description: zone.description,
        memberCount: zone.memberCount,
        activeMemberCount: zone.activeMemberCount,
        membersByType: zone.membersByType,
        createdAt: zone.createdAt,
      };

      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Zone statistics retrieved successfully", {
            statistics,
          })
        );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ZoneController();
