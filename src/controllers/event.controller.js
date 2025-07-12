const EventService = require("../services/event.service");
const { formatResponse } = require("../utils/helpers");
const { HTTP_STATUS } = require("../config/constants");

/**
 * Controller for event-related endpoints.
 */
class EventController {
  /**
   * @route POST /events
   * @desc Create a new event
   * @access Private (Admin or authorized users)
   */
  async createEvent(req, res, next) {
    try {
      const event = await EventService.createEvent(req.body, req.user.id);
      res
        .status(HTTP_STATUS.CREATED)
        .json(formatResponse(true, "Event created successfully", { event }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /events
   * @desc Retrieve all events with optional filtering/pagination
   * @access Public or Authenticated
   */
  async getAllEvents(req, res, next) {
    try {
      const result = await EventService.getAllEvents(req.query);
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(
            true,
            "Events retrieved successfully",
            result.events,
            result.pagination
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /events/:id
   * @desc Get event details by ID
   * @access Public or Authenticated
   */
  async getEventById(req, res, next) {
    try {
      const event = await EventService.getEventById(req.params.id);
      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Event retrieved successfully", { event }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /events/:id
   * @desc Update an event
   * @access Private (Event owner or admin)
   */
  async updateEvent(req, res, next) {
    try {
      const event = await EventService.updateEvent(req.params.id, req.body);
      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Event updated successfully", { event }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route DELETE /events/:id
   * @desc Delete an event
   * @access Private (Event owner or admin)
   */
  async deleteEvent(req, res, next) {
    try {
      await EventService.deleteEvent(req.params.id);
      res
        .status(HTTP_STATUS.OK)
        .json(formatResponse(true, "Event deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /events/:id/register
   * @desc Register a member for an event
   * @access Private (Organizer or self-register)
   */
  async registerForEvent(req, res, next) {
    try {
      const { memberId } = req.body;
      const event = await EventService.registerMemberForEvent(
        req.params.id,
        memberId
      );
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Member registered for event successfully", {
            event,
          })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /events/:id/attendance
   * @desc Record member attendance
   * @access Private (Admin or organizer)
   */
  async recordAttendance(req, res, next) {
    try {
      const { memberId, attendanceStatus } = req.body;
      const event = await EventService.recordAttendance(
        req.params.id,
        memberId,
        attendanceStatus
      );
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(true, "Attendance recorded successfully", { event })
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /events/:id/attendees
   * @desc Get attendance data for an event
   * @access Private (Admin or organizer)
   */
  async getEventAttendees(req, res, next) {
    try {
      const attendanceData = await EventService.getEventAttendees(
        req.params.id
      );
      res
        .status(HTTP_STATUS.OK)
        .json(
          formatResponse(
            true,
            "Event attendees retrieved successfully",
            attendanceData
          )
        );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventController();
