const mongoose = require('mongoose');

/**
 * Mongoose schema for notifications sent to members.
 * Supports various types, priority levels, and tracks delivery status.
 */
const notificationSchema = new mongoose.Schema({
  /** Notification title (max 200 chars) */
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },

  /** Main content/body of the notification (max 1000 chars) */
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxLength: [1000, 'Message cannot exceed 1000 characters']
  },

  /** Type/category of the notification */
  type: {
    type: String,
    enum: ['General', 'Event', 'Payment', 'Membership', 'Reminder'],
    required: [true, 'Notification type is required']
  },

  /** Priority level of the notification */
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },

  /** Array of member IDs who are the intended recipients */
  targetMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  }],

  /** User ID of the sender */
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  /** Timestamp when the notification was sent */
  sentAt: {
    type: Date,
    default: Date.now
  },

  /** Current status of the notification */
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Sent', 'Failed'],
    default: 'Sent'
  },

  /** Whether the notification has been read */
  isRead: {
    type: Boolean,
    default: false
  },

  /** Soft delete flag */
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Indexes to optimize query performance
notificationSchema.index({ targetMembers: 1, createdAt: -1 });
notificationSchema.index({ sentBy: 1 });
notificationSchema.index({ status: 1, priority: 1 });

/** Mongoose model for Notification */
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
