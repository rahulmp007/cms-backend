const Event = require("../models/event.model");
const Member = require("../models/member.model");

class EventService {
  /**
   * Creates a new event and links the creator.
   */
  async createEvent(eventData, createdBy) {
    const event = new Event({
      ...eventData,
      createdBy,
    });
    await event.save();
    await event.populate("createdBy", "name email"); // ✅ Safe populate

    return event;
  }

  /**
   * Retrieves all active events with filtering, pagination, and sorting.
   */
  async getAllEvents(filters = {}) {
    const {
      status,
      dateFrom,
      dateTo,
      search,
      page = 1,
      limit = 10,
      sortBy = "eventDate",
      sortOrder = "asc",
    } = filters;

    const query = { isActive: true };

    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.eventDate = {};
      if (dateFrom) query.eventDate.$gte = new Date(dateFrom);
      if (dateTo) query.eventDate.$lte = new Date(dateTo);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate("createdBy", "name email") // ✅ Safe populate
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query),
    ]);

    return {
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Retrieves a single event by ID with creator and attendee info.
   */
  async getEventById(eventId) {
    const event = await Event.findById(eventId)
      .populate("createdBy", "name email") // ✅ Safe populate
      .populate("attendees.member", "name memberId phone"); // ✅ Safe populate

    if (!event || !event.isActive) {
      throw new Error("Event not found");
    }

    return event;
  }

  /**
   * Updates an existing event by ID.
   */
  async updateEvent(eventId, updateData) {
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      throw new Error("Event not found");
    }

    Object.assign(event, updateData);
    await event.save();
    await event.populate("createdBy", "name email"); // ✅ Safe populate

    return event;
  }

  /**
   * Soft-deletes an event (sets isActive to false).
   */
  async deleteEvent(eventId) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    event.isActive = false;
    await event.save();

    return event;
  }

  /**
   * Registers a member for a given event.
   */
  async registerMemberForEvent(eventId, memberId) {
    const [event, member] = await Promise.all([
      Event.findById(eventId),
      Member.findById(memberId),
    ]);

    if (!event || !event.isActive) {
      throw new Error("Event not found");
    }

    if (!member || !member.isActive) {
      throw new Error("Member not found");
    }

    if (event.status !== "Upcoming") {
      throw new Error("Event is not accepting registrations");
    }

    const existingAttendee = event.attendees.find(
      (attendee) => attendee.member.toString() === memberId
    );
    if (existingAttendee) {
      throw new Error("Member is already registered for this event");
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      throw new Error("Event is at maximum capacity");
    }

    event.attendees.push({
      member: memberId,
      attendanceStatus: "Registered",
      paymentStatus: event.registrationFee > 0 ? "Pending" : "Paid",
    });

    await event.save();
    await event.populate("attendees.member", "name memberId phone"); // ✅ Safe populate

    return event;
  }

  /**
   * Updates attendance status for a registered member.
   */
  async recordAttendance(eventId, memberId, attendanceStatus) {
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      throw new Error("Event not found");
    }

    const attendeeIndex = event.attendees.findIndex(
      (attendee) => attendee.member.toString() === memberId
    );
    if (attendeeIndex === -1) {
      throw new Error("Member is not registered for this event");
    }

    event.attendees[attendeeIndex].attendanceStatus = attendanceStatus;
    await event.save();
    await event.populate("attendees.member", "name memberId phone"); // ✅ Safe populate

    return event;
  }

  /**
   * Returns event attendees with a summary breakdown.
   */
  async getEventAttendees(eventId) {
    const event = await Event.findById(eventId).populate(
      "attendees.member",
      "name memberId phone email membershipType"
    ); // ✅ Safe populate

    if (!event || !event.isActive) {
      throw new Error("Event not found");
    }

    return {
      eventTitle: event.title,
      eventDate: event.eventDate,
      attendees: event.attendees,
      summary: {
        totalRegistered: event.attendees.length,
        attended: event.attendees.filter(
          (a) => a.attendanceStatus === "Attended"
        ).length,
        noShow: event.attendees.filter((a) => a.attendanceStatus === "No Show")
          .length,
        pending: event.attendees.filter(
          (a) => a.attendanceStatus === "Registered"
        ).length,
      },
    };
  }
}

module.exports = new EventService();
