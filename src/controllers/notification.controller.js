const NotificationService = require("../services/notification.service");
const { formatResponse } = require("../utils/helpers");
const { HTTP_STATUS } = require("../config/constants");
const Member = require("../models/member.model");

/**
 * Controller for handling notification operations
 */
class NotificationController {
  /**
   * @route POST /notifications
   * @desc Create a new notification
   * @access Private (Admin/Staff)
   */
  async createNotification(req, res, next) {
    try {
      const notification = await NotificationService.createNotification(
        req.body,
        req.user.id
      );
      res
        .status(HTTP_STATUS.CREATED)
        .json(
          formatResponse(true, "Notification created successfully", {
            notification,
          })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /notifications
   * @desc Get all notifications (paginated, optionally filtered)
   * @access Private (Admin/Staff)
   */
  async getAllNotifications(req, res, next) {
    try {
      const result = await NotificationService.getAllNotifications(req.query);
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(
            true,
            "Notifications retrieved successfully",
            result.notifications,
            result.pagination
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /notifications/:id
   * @desc Get a specific notification by ID
   * @access Private
   */
  async getNotificationById(req, res, next) {
    try {
      const notification = await NotificationService.getNotificationById(
        req.params.id
      );
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Notification retrieved successfully", {
            notification,
          })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /notifications/:id
   * @desc Delete a notification by ID
   * @access Private (Admin/Staff)
   */
  async deleteNotification(req, res, next) {
    try {
      await NotificationService.deleteNotification(req.params.id);
      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Notification deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /notifications/my
   * @desc Get notifications for the current authenticated member
   * @access Private (Member)
   */
  async getMyNotifications(req, res, next) {
    try {
      const member = await Member.findOne({ user: req.user.id });

      if (!member) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(formatResponse(false, "Member profile not found"));
      }

      const result = await NotificationService.getMemberNotifications(
        member._id,
        req.query
      );

      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(
            true,
            "Your notifications retrieved successfully",
            result.notifications,
            result.pagination
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /notifications/send/all
   * @desc Send a notification to all members
   * @access Private (Admin/Staff)
   */
  async sendToAllMembers(req, res, next) {
    try {
      const { title, message, type, priority } = req.body;
      const notification = await NotificationService.sendToAllMembers(
        title,
        message,
        type,
        priority,
        req.user.id
      );
      res
        .status(HTTP_STATUS.CREATED)
        .json(
          formatResponse(true, "Notification sent to all members", {
            notification,
          })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /notifications/send
   * @desc Send a notification to specific members
   * @access Private (Admin/Staff)
   */
  async sendToMembers(req, res, next) {
    try {
      const { targetMembers, title, message, type, priority } = req.body;
      const notification = await NotificationService.sendToMembers(
        targetMembers,
        title,
        message,
        type,
        priority,
        req.user.id
      );
      res
        .status(HTTP_STATUS.CREATED)
        .json(
          formatResponse(true, "Notification sent to selected members", {
            notification,
          })
        );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
