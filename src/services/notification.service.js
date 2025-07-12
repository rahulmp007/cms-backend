const Notification = require("../models/notification.model");
const Member = require("../models/member.model");

class NotificationService {
  /**
   * Creates a new notification.
   * @param {Object} notificationData - Data for the new notification.
   * @param {string} sentBy - ID of the user who is sending the notification.
   * @returns {Promise<Object>} The created notification with populated fields.
   * @throws {Error} If one or more target members are invalid.
   */
  async createNotification(notificationData, sentBy) {
    if (notificationData.targetMembers?.length > 0) {
      const members = await Member.find({
        _id: { $in: notificationData.targetMembers },
        isActive: true,
      });

      if (members.length !== notificationData.targetMembers.length) {
        throw new Error("One or more target members not found");
      }
    }

    const notification = new Notification({
      ...notificationData,
      sentBy,
    });

    await notification.save();

    await notification.populate([
      { path: "targetMembers", select: "name memberId phone" },
      { path: "sentBy", select: "name email role" },
    ]);

    return notification;
  }

  /**
   * Retrieves a paginated list of all active notifications with optional filters.
   * @param {Object} filters - Filters for the query (type, priority, status, pagination).
   * @returns {Promise<Object>} Notifications with pagination metadata.
   */
  async getAllNotifications(filters = {}) {
    const { type, priority, status, page = 1, limit = 10 } = filters;

    const query = { isActive: true };
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate({ path: "targetMembers", select: "name memberId phone" })
        .populate({ path: "sentBy", select: "name email role" })
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Retrieves a single notification by its ID.
   * @param {string} notificationId - The ID of the notification.
   * @returns {Promise<Object>} The notification document.
   * @throws {Error} If the notification is not found or inactive.
   */
  async getNotificationById(notificationId) {
    const notification = await Notification.findById(notificationId)
      .populate({ path: "targetMembers", select: "name memberId phone" })
      .populate({ path: "sentBy", select: "name email role" });

    if (!notification || !notification.isActive) {
      throw new Error("Notification not found");
    }

    return notification;
  }

  /**
   * Soft deletes a notification by marking it as inactive.
   * @param {string} notificationId - The ID of the notification to delete.
   * @returns {Promise<Object>} The updated notification document.
   * @throws {Error} If the notification is not found.
   */
  async deleteNotification(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    notification.isActive = false;
    await notification.save();

    return notification;
  }

  /**
   * Retrieves notifications for a specific member.
   * @param {string} memberId - The member's ID.
   * @param {Object} filters - Filters like pagination and unreadOnly.
   * @returns {Promise<Object>} Member-specific notifications with pagination.
   * @throws {Error} If the member is not found or inactive.
   */
  async getMemberNotifications(memberId, filters = {}) {
    const { page = 1, limit = 10, unreadOnly = false } = filters;

    const member = await Member.findById(memberId);
    if (!member || !member.isActive) {
      throw new Error("Member not found");
    }

    const query = {
      isActive: true,
      status: "Sent",
      $or: [{ targetMembers: memberId }, { targetMembers: { $size: 0 } }],
    };

    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate({ path: "sentBy", select: "name email role" })
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Sends a notification to all members (no specific targets).
   * @param {string} title - Notification title.
   * @param {string} message - Notification body.
   * @param {string} type - Notification type (default: 'General').
   * @param {string} priority - Notification priority (default: 'Medium').
   * @param {string} sentBy - ID of the sender.
   * @returns {Promise<Object>} The created notification.
   */
  async sendToAllMembers(
    title,
    message,
    type = "General",
    priority = "Medium",
    sentBy
  ) {
    return this.createNotification(
      {
        title,
        message,
        type,
        priority,
        targetMembers: [],
      },
      sentBy
    );
  }

  /**
   * Sends a notification to specific members.
   * @param {string[]} targetMembers - Array of member IDs.
   * @param {string} title - Notification title.
   * @param {string} message - Notification content.
   * @param {string} type - Notification type (default: 'General').
   * @param {string} priority - Notification priority (default: 'Medium').
   * @param {string} sentBy - ID of the sender.
   * @returns {Promise<Object>} The created notification.
   */
  async sendToMembers(
    targetMembers,
    title,
    message,
    type = "General",
    priority = "Medium",
    sentBy
  ) {
    return this.createNotification(
      {
        title,
        message,
        type,
        priority,
        targetMembers,
      },
      sentBy
    );
  }
}

module.exports = new NotificationService();
