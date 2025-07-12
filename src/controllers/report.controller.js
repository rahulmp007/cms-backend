const ReportService = require("../services/report.service");
const { formatResponse } = require("../utils/helpers");
const { HTTP_STATUS } = require("../config/constants");

class ReportController {
  /**
   * @route GET /reports/member-stats
   * @desc Fetch basic statistics about members
   * @access Private (Admin)
   */
  async getMemberStatistics(req, res, next) {
    try {
      const stats = await ReportService.getMemberStatistics();
      res.status(HTTP_STATUS.OK).json(
        formatResponse(true, "Member statistics retrieved successfully", {
          stats,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /reports/dashboard
   * @desc Overview of key dashboard metrics
   * @access Private (Admin)
   */
  async getDashboardOverview(req, res, next) {
    try {
      const overview = await ReportService.getDashboardOverview();
      res.status(HTTP_STATUS.OK).json(
        formatResponse(true, "Dashboard overview retrieved successfully", {
          overview,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /reports/members
   * @desc Get detailed filtered list of members
   * @access Private (Admin)
   */
  async getDetailedMemberReport(req, res, next) {
    try {
      const filters = req.query;
      const { members, total } =
        await ReportService.getDetailedMemberReport(filters);

      res.status(HTTP_STATUS.OK).json(
        formatResponse(true, "Detailed member report retrieved successfully", {
          members,
          total,
          filters,
        })
      );
    } catch (error) {
      next(error);
    }
    // const { zone, membershipType, status, dateFrom, dateTo } = req.query;
    // const query = { isActive: true };

    // if (zone) query.zone = zone;
    // if (membershipType) query.membershipType = membershipType;
    // if (status) query.status = status;
    // if (dateFrom || dateTo) {
    //   query.createdAt = {};
    //   if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    //   if (dateTo) query.createdAt.$lte = new Date(dateTo);
    // }

    // const Member = require("../models/member.model");
    // const members = await Member.find(query)
    //   .populate("zone", "name")
    //   .populate("user", "name email")
    //   .select(
    //     "name memberId phone membershipType status joinDate renewalDate"
    //   )
    //   .sort({ joinDate: -1 });

    // const total = await Member.countDocuments(query);

    // res.status(HTTP_STATUS.OK).json(
    //   formatResponse(true, "Detailed member report retrieved successfully", {
    //     members,
    //     total,
    //     filters: { zone, membershipType, status, dateFrom, dateTo },
    //   })
    // );
    // } catch (error) {
    //   next(error);
    // }
  }

  /**
   * @route GET /reports/payments
   * @desc Get detailed payment transactions with filters
   * @access Private (Admin)
   */
  async getDetailedPaymentReport(req, res, next) {
    try {
      const filters = req.query;
      const { payments, pagination } =
        await ReportService.getDetailedPaymentReport(filters);

      res.status(HTTP_STATUS.OK).json(
        formatResponse(true, "Detailed payment report retrieved successfully", {
          payments,
          pagination,
          filters,
        })
      );
    } catch (error) {
      next(error);
    }

    // try {
    //   const {
    //     memberId,
    //     paymentType,
    //     status,
    //     paymentMethod,
    //     dateFrom,
    //     dateTo,
    //     page = 1,
    //     limit = 50,
    //   } = req.query;

    //   const query = { isActive: true };

    //   if (memberId) query.member = memberId;
    //   if (paymentType) query.paymentType = paymentType;
    //   if (status) query.status = status;
    //   if (paymentMethod) query.paymentMethod = paymentMethod;
    //   if (dateFrom || dateTo) {
    //     query.paymentDate = {};
    //     if (dateFrom) query.paymentDate.$gte = new Date(dateFrom);
    //     if (dateTo) query.paymentDate.$lte = new Date(dateTo);
    //   }

    //   const skip = (page - 1) * limit;
    //   const Payment = require("../models/payment.model");

    //   const [payments, total] = await Promise.all([
    //     Payment.find(query)
    //       .populate("member", "name memberId phone")
    //       .populate("event", "title eventDate")
    //       .populate("processedBy", "name email")
    //       .sort({ paymentDate: -1 })
    //       .skip(skip)
    //       .limit(parseInt(limit)),
    //     Payment.countDocuments(query),
    //   ]);

    //   res.status(HTTP_STATUS.OK).json(
    //     formatResponse(true, "Detailed payment report retrieved successfully", {
    //       payments,
    //       pagination: {
    //         currentPage: parseInt(page),
    //         totalPages: Math.ceil(total / limit),
    //         totalPayments: total,
    //         hasNext: page * limit < total,
    //         hasPrev: page > 1,
    //       },
    //       filters: {
    //         memberId,
    //         paymentType,
    //         status,
    //         paymentMethod,
    //         dateFrom,
    //         dateTo,
    //       },
    //     })
    //   );
    // } catch (error) {
    //   next(error);
    // }
  }

  /**
   * @route GET /reports/events
   * @desc Get detailed event report with attendance stats
   * @access Private (Admin)
   */
  async getDetailedEventReport(req, res, next) {
    // try {
    //   const { status, dateFrom, dateTo } = req.query;
    //   const query = { isActive: true };

    //   if (status) query.status = status;
    //   if (dateFrom || dateTo) {
    //     query.eventDate = {};
    //     if (dateFrom) query.eventDate.$gte = new Date(dateFrom);
    //     if (dateTo) query.eventDate.$lte = new Date(dateTo);
    //   }

    //   const Event = require("../models/event.model");
    //   const events = await Event.find(query)
    //     .populate("createdBy", "name email")
    //     .populate("attendees.member", "name memberId")
    //     .sort({ eventDate: -1 });

    //   const eventsWithStats = events.map((event) => {
    //     const totalRegistrations = event.attendees.length;
    //     const attended = event.attendees.filter(
    //       (a) => a.attendanceStatus === "Attended"
    //     ).length;
    //     const noShow = event.attendees.filter(
    //       (a) => a.attendanceStatus === "No Show"
    //     ).length;
    //     const registered = event.attendees.filter(
    //       (a) => a.attendanceStatus === "Registered"
    //     ).length;

    //     return {
    //       ...event.toObject(),
    //       statistics: {
    //         totalRegistrations,
    //         attended,
    //         noShow,
    //         registered,
    //         attendanceRate:
    //           totalRegistrations > 0
    //             ? Math.round((attended / totalRegistrations) * 100)
    //             : 0,
    //       },
    //     };
    //   });

    //   res.status(HTTP_STATUS.OK).json(
    //     formatResponse(true, "Detailed event report retrieved successfully", {
    //       events: eventsWithStats,
    //       total: events.length,
    //       filters: { status, dateFrom, dateTo },
    //     })
    //   );
    // } catch (error) {
    //   next(error);
    // }

    try {
      const filters = req.query;
      const { eventsWithStats, total } =
        await ReportService.getDetailedEventReport(filters);

      res.status(HTTP_STATUS.OK).json(
        formatResponse(true, "Detailed event report retrieved successfully", {
          events: eventsWithStats,
          total,
          filters,
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
