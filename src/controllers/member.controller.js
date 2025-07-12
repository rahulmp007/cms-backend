const MemberService = require("../services/member.service");
const Member = require("../models/member.model");
const { formatResponse } = require("../utils/helpers");
const { HTTP_STATUS } = require("../config/constants");

/**
 * Controller for member-related operations.
 */
class MemberController {
  /**
   * @route POST /members
   * @desc Create a new member
   * @access Private (Admin or authorized staff)
   */
  async createMember(req, res, next) {
    try {
      const member = await MemberService.createMember(req.body);
      res
        .status(HTTP_STATUS.CREATED)
        .json(formatResponse(true, "Member created successfully", { member }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /members
   * @desc Retrieve all members with optional filters/pagination
   * @access Private (Admin or authorized staff)
   */
  async getAllMembers(req, res, next) {
    try {
      const result = await MemberService.getAllMembers(req.query);
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(
            true,
            "Members retrieved successfully",
            result.members,
            result.pagination
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /members/:id
   * @desc Get a single member by ID
   * @access Private
   */
  async getMemberById(req, res, next) {
    try {
      const member = await MemberService.getMemberById(req.params.id);
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Member retrieved successfully", { member })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /members/:id
   * @desc Update member details
   * @access Private
   */
  async updateMember(req, res, next) {
    try {
      const member = await MemberService.updateMember(req.params.id, req.body);
      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Member updated successfully", { member }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PATCH /members/:id/disable
   * @desc Soft-disable a member
   * @access Private (Admin only)
   */
  async disableMember(req, res, next) {
    try {
      const member = await MemberService.disableMember(req.params.id);
      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Member disabled successfully", { member }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /members/:id/qrcode
   * @desc Get member's QR code data
   * @access Private
   */
  async getMemberQRCode(req, res, next) {
    try {
      const qrData = await MemberService.getMemberQRCode(req.params.id);
      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "QR code retrieved successfully", qrData));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /members/search?search=term
   * @desc Search members by name, email, or phone
   * @access Private
   */
  async searchMembers(req, res, next) {
    try {
      const { search } = req.query;
      if (!search) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(formatResponse(false, "Search term is required"));
      }

      const members = await MemberService.searchMembers(search);
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Search completed successfully", { members })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /members/me
   * @desc Get the current user's member profile
   * @access Private
   */
  async getMyProfile(req, res, next) {
    try {
      const member = await Member.findOne({ user: req.user.id })
        .populate("zone", "name description")
        .populate("user", "name email role");

      if (!member) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(formatResponse(false, "Member profile not found"));
      }

      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Member profile retrieved successfully", {
            member,
          })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /members/:id/renew
   * @desc Renew a member's membership
   * @access Private (Admin or member)
   */
  async renewMembership(req, res, next) {
    try {
      const result = await MemberService.renewMembership(
        req.params.id,
        req.body,
        req.user.id
      );

      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Membership renewed successfully", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /members/expiring
   * @desc Get members with expiring memberships
   * @access Private
   */
  async getExpiringMembers(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const result = await MemberService.getExpiringMembers(
        parseInt(days),
        req.query
      );

      res.status(HTTP_STATUS.OK).json(
        formatResponse(
          true,
          "Expiring members retrieved successfully",
          result.members,
          {
            ...result.pagination,
            summary: result.summary,
          }
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /members/:id/extend
   * @desc Extend a member’s membership manually
   * @access Private (Admin only)
   */
  async extendMembership(req, res, next) {
    try {
      const result = await MemberService.extendMembership(
        req.params.id,
        req.body
      );

      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Membership extended successfully", result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PATCH /members/expire
   * @desc Update members who have expired memberships
   * @access Private (System task or Admin)
   */
  async updateExpiredMembers(req, res, next) {
    try {
      const result = await MemberService.updateExpiredMembers();
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, result.message, {
            updatedCount: result.updatedCount,
          })
        );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MemberController();
