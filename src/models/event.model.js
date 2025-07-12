const mongoose = require('mongoose');

/**
 * Mongoose schema for representing an event.
 * Includes metadata such as title, description, schedule, location, capacity,
 * pricing, and attendee tracking.
 */
const eventSchema = new mongoose.Schema({
  /** Title of the event */
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },

  /** Description of the event */
  description: {
    type: String,
    required: [true, 'Event description is required']
  },

  /** Scheduled date and time of the event */
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },

  /** Location where the event is held */
  location: {
    type: String,
    required: [true, 'Event location is required']
  },

  /** Maximum number of attendees allowed */
  maxAttendees: {
    type: Number,
    min: [1, 'Maximum attendees must be at least 1']
  },

  /** Fee required to register for the event */
  registrationFee: {
    type: Number,
    min: [0, 'Registration fee cannot be negative'],
    default: 0
  },

  /** Current status of the event */
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },

  /** List of registered attendees */
  attendees: [{
    /** Reference to a Member document */
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true
    },

    /** Date the member registered for the event */
    registrationDate: {
      type: Date,
      default: Date.now
    },

    /** Status indicating if the member attended */
    attendanceStatus: {
      type: String,
      enum: ['Registered', 'Attended', 'No Show'],
      default: 'Registered'
    },

    /** Payment status of the registration */
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending'
    }
  }],

  /** User who created the event */
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  /** Flag to determine if the event is active */
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Indexes for performance optimization
eventSchema.index({ eventDate: 1 });
eventSchema.index({ status: 1 });

/** Event model based on the eventSchema */
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
