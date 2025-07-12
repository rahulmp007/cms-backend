

const Member = require("../models/member.model");
const Payment = require("../models/payment.model");
const Event = require("../models/event.model");
const Notification = require("../models/notification.model");
const Zone = require("../models/zone.model");

class ReportService {
  /**
   * Generates member-related statistics including counts by status, type, zone,
   * recent registrations, and upcoming expirations.
   *
   * @returns {Promise<Object>} Aggregated statistics about members.
   */
  async getMemberStatistics() {
    const totalMembers = await Member.countDocuments({ isActive: true });

    const membersByStatus = await Member.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const membersByType = await Member.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$membershipType", count: { $sum: 1 } } },
    ]);

    const membersByZone = await Member.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "zones",
          localField: "zone",
          foreignField: "_id",
          as: "zoneInfo",
        },
      },
      { $unwind: "$zoneInfo" },
      { $group: { _id: "$zoneInfo.name", count: { $sum: 1 } } },
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await Member.countDocuments({
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringMemberships = await Member.countDocuments({
      isActive: true,
      renewalDate: {
        $gte: new Date(),
        $lte: thirtyDaysFromNow,
      },
    });

    return {
      totalMembers,
      recentRegistrations,
      expiringMemberships,
      membersByStatus: this.formatGroupedData(membersByStatus),
      membersByType: this.formatGroupedData(membersByType),
      membersByZone: this.formatGroupedData(membersByZone),
    };
  }

  /**
   * Provides high-level dashboard metrics for members, payments, events, and notifications.
   *
   * @returns {Promise<Object>} Dashboard-ready stats.
   */
  async getDashboardOverview() {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const totalMembers = await Member.countDocuments({ isActive: true });
    const activeMembers = await Member.countDocuments({
      isActive: true,
      status: "Active",
    });

    const newMembersThisMonth = await Member.countDocuments({
      isActive: true,
      createdAt: { $gte: thisMonth },
    });

    const totalPaymentsThisMonth = await Payment.aggregate([
      {
        $match: {
          isActive: true,
          paymentDate: { $gte: thisMonth, $lte: thisMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    const totalPaymentsLastMonth = await Payment.aggregate([
      {
        $match: {
          isActive: true,
          paymentDate: { $gte: lastMonth, $lt: thisMonth },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    const upcomingEvents = await Event.countDocuments({
      isActive: true,
      status: "Upcoming",
      eventDate: { $gte: today },
    });

    const eventsThisMonth = await Event.countDocuments({
      isActive: true,
      eventDate: { $gte: thisMonth, $lte: thisMonthEnd },
    });

    const notificationsThisMonth = await Notification.countDocuments({
      isActive: true,
      sentAt: { $gte: thisMonth },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPayments = await Payment.countDocuments({
      isActive: true,
      paymentDate: { $gte: sevenDaysAgo },
    });

    const recentMembers = await Member.countDocuments({
      isActive: true,
      createdAt: { $gte: sevenDaysAgo },
    });

    const thisMonthPayments = totalPaymentsThisMonth[0] || {
      count: 0,
      amount: 0,
    };
    const lastMonthPayments = totalPaymentsLastMonth[0] || {
      count: 0,
      amount: 0,
    };

    return {
      members: {
        total: totalMembers,
        active: activeMembers,
        newThisMonth: newMembersThisMonth,
        recentlyJoined: recentMembers,
      },
      payments: {
        thisMonth: thisMonthPayments,
        lastMonth: lastMonthPayments,
        recent: recentPayments,
      },
      events: {
        upcoming: upcomingEvents,
        thisMonth: eventsThisMonth,
      },
      notifications: {
        thisMonth: notificationsThisMonth,
      },
    };
  }

  /**
   * Get detailed list of members with filters
   *
   * @returns {Promise<{members: Array, total: number}>}
   */
  async getDetailedMemberReport({
    zone,
    membershipType,
    status,
    dateFrom,
    dateTo,
  }) {
    const query = { isActive: true };

    if (zone) query.zone = zone;
    if (membershipType) query.membershipType = membershipType;
    if (status) query.status = status;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const members = await Member.find(query)
      .populate("zone", "name")
      .populate("user", "name email")
      .select("name memberId phone membershipType status joinDate renewalDate")
      .sort({ joinDate: -1 });

    const total = await Member.countDocuments(query);

    return { members, total };
  }

  /**
   * Get detailed list of payments with filters and pagination
   *
   * @returns {Promise<{payments: Array, pagination: Object}>}
   */
  async getDetailedPaymentReport({
    memberId,
    paymentType,
    status,
    paymentMethod,
    dateFrom,
    dateTo,
    page = 1,
    limit = 50,
  }) {
    const query = { isActive: true };

    if (memberId) query.member = memberId;
    if (paymentType) query.paymentType = paymentType;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (dateFrom || dateTo) {
      query.paymentDate = {};
      if (dateFrom) query.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) query.paymentDate.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("member", "name memberId phone")
        .populate("event", "title eventDate")
        .populate("processedBy", "name email")
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(query),
    ]);

    return {
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPayments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get detailed list of events with attendance statistics
   *
   * @returns {Promise<{eventsWithStats: Array, total: number}>}
   */
  async getDetailedEventReport({ status, dateFrom, dateTo }) {
    const query = { isActive: true };

    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.eventDate = {};
      if (dateFrom) query.eventDate.$gte = new Date(dateFrom);
      if (dateTo) query.eventDate.$lte = new Date(dateTo);
    }

    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .populate("attendees.member", "name memberId")
      .sort({ eventDate: -1 });

    const eventsWithStats = events.map((event) => {
      const totalRegistrations = event.attendees.length;
      const attended = event.attendees.filter(
        (a) => a.attendanceStatus === "Attended"
      ).length;
      const noShow = event.attendees.filter(
        (a) => a.attendanceStatus === "No Show"
      ).length;
      const registered = event.attendees.filter(
        (a) => a.attendanceStatus === "Registered"
      ).length;

      return {
        ...event.toObject(),
        statistics: {
          totalRegistrations,
          attended,
          noShow,
          registered,
          attendanceRate:
            totalRegistrations > 0
              ? Math.round((attended / totalRegistrations) * 100)
              : 0,
        },
      };
    });

    return { eventsWithStats, total: events.length };
  }

  /**
   * Formats MongoDB group aggregation data into object map.
   * @param {Array} data - Array of grouped data with `_id` and `count`.
   * @returns {Object} Key-value map.
   */
  formatGroupedData(data) {
    const result = {};
    data.forEach((item) => {
      result[item._id || "Unknown"] = item.count;
    });
    return result;
  }
}

module.exports = new ReportService();
