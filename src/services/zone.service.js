const Zone = require("../models/zone.model");
const Member = require("../models/member.model");

/**
 * Service class to manage zone operations.
 * Provides methods to create, update, delete, retrieve members, and search zones.
 */
class ZoneService {
  /**
   * Creates a new zone if the name is unique (case-insensitive).
   *
   * @param {Object} zoneData - The data for the new zone.
   * @returns {Promise<Object>} - The created zone document.
   * @throws {Error} - If a zone with the same name already exists.
   */
  async createZone(zoneData) {
    const existingZone = await Zone.findOne({
      name: new RegExp(`^${zoneData.name}$`, "i"),
      isActive: true,
    });

    if (existingZone) {
      throw new Error("Zone with this name already exists");
    }

    const zone = new Zone(zoneData);
    await zone.save();
    return zone;
  }

  /**
   * Updates an existing zone with the provided data.
   * Validates uniqueness of the name (case-insensitive).
   *
   * @param {string} zoneId - The ID of the zone to update.
   * @param {Object} updateData - Data to update.
   * @returns {Promise<Object>} - The updated zone document.
   * @throws {Error} - If zone is not found or name is already taken.
   */
  async updateZone(zoneId, updateData) {
    const zone = await Zone.findOne({ _id: zoneId, isActive: true });
    if (!zone) {
      throw new Error("Zone not found");
    }

    if (updateData.name && updateData.name !== zone.name) {
      const existingZone = await Zone.findOne({
        name: new RegExp(`^${updateData.name}$`, "i"),
        _id: { $ne: zoneId },
        isActive: true,
      });

      if (existingZone) {
        throw new Error("Zone with this name already exists");
      }
    }

    Object.assign(zone, updateData);
    await zone.save();
    return zone;
  }

  /**
   * Soft deletes a zone by setting `isActive` to false.
   * Prevents deletion if zone has active members.
   *
   * @param {string} zoneId - The ID of the zone to delete.
   * @returns {Promise<Object>} - The soft-deleted zone.
   * @throws {Error} - If zone not found or has active members.
   */
  async deleteZone(zoneId) {
    const zone = await Zone.findOne({ _id: zoneId, isActive: true });
    if (!zone) {
      throw new Error("Zone not found");
    }

    const activeMemberCount = await Member.countDocuments({
      zone: zoneId,
      isActive: true,
    });

    if (activeMemberCount > 0) {
      throw new Error(
        `Cannot delete zone. It has ${activeMemberCount} active member(s). Please reassign or remove members first.`
      );
    }

    zone.isActive = false;
    await zone.save();

    return zone;
  }

  /**
   * Retrieves paginated and filtered members of a specific zone.
   * Populates limited user fields (name, email) to avoid exposing sensitive data.
   *
   * @param {string} zoneId - The ID of the zone.
   * @param {Object} filters - Filter and pagination options.
   * @param {string} [filters.status] - Optional member status filter.
   * @param {string} [filters.membershipType] - Optional membership type filter.
   * @param {number} [filters.page=1] - Page number.
   * @param {number} [filters.limit=10] - Number of results per page.
   *
   * @returns {Promise<Object>} - Zone info, members list, and pagination data.
   * @throws {Error} - If zone is not found.
   */
  async getZoneMembers(zoneId, filters = {}) {
    const zone = await Zone.findOne({ _id: zoneId, isActive: true });
    if (!zone) {
      throw new Error("Zone not found");
    }

    const { status, membershipType, page = 1, limit = 10 } = filters;

    const query = { zone: zoneId, isActive: true };
    if (status) query.status = status;
    if (membershipType) query.membershipType = membershipType;

    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      Member.find(query)
        .populate({
          path: "user",
          select: "name email", // 🔒 Limits exposure of user data
        })
        .select(
          "name memberId phone membershipType status joinDate renewalDate"
        ) // Avoids exposing internal fields
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Member.countDocuments(query),
    ]);

    return {
      zone: {
        _id: zone._id,
        name: zone.name,
        description: zone.description,
      },
      members,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMembers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Searches active zones by name or description.
   * Includes member count (only active members) via aggregation.
   *
   * @param {string} searchTerm - Search keyword.
   * @returns {Promise<Array>} - List of matching zones with member counts.
   */
  async searchZones(searchTerm) {
    const zones = await Zone.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { description: { $regex: searchTerm, $options: "i" } },
          ],
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "_id",
          foreignField: "zone",
          as: "members",
        },
      },
      {
        $addFields: {
          memberCount: {
            $size: {
              $filter: {
                input: "$members",
                cond: { $eq: ["$$this.isActive", true] },
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          memberCount: 1,
          createdAt: 1,
        },
      },
      { $sort: { name: 1 } },
      { $limit: 20 },
    ]);

    return zones;
  }
}

module.exports = new ZoneService();
