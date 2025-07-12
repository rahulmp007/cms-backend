const mongoose = require('mongoose');

/**
 * Mongoose schema for storing member payments.
 * Handles various types of payments (membership, event, etc.)
 * and supports linking to events, members, and processing users.
 */
const paymentSchema = new mongoose.Schema({
  /** Unique payment identifier (e.g., for receipts or records) */
  paymentId: {
    type: String,
    required: [true, 'Payment ID is required'],
    unique: true,
    uppercase: true
  },

  /** Reference to the member who made the payment */
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member is required']
  },

  /** Payment amount (non-negative) */
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },

  /** Type/category of payment */
  paymentType: {
    type: String,
    enum: ['Membership Fee', 'Event Registration', 'Late Fee', 'Other'],
    required: [true, 'Payment type is required']
  },

  /** Method used to make the payment */
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Online', 'Cheque'],
    required: [true, 'Payment method is required']
  },

  /** Current status of the payment */
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },

  /** Optional external transaction ID (e.g., from payment gateway) */
  transactionId: {
    type: String,
    sparse: true
  },

  /** Optional description or notes related to the payment */
  description: {
    type: String,
    trim: true
  },

  /** Optional receipt file path or URL */
  receiptFile: {
    type: String
  },

  /** Reference to the related event (if payment is event-based) */
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },

  /** Date the payment was made */
  paymentDate: {
    type: Date,
    default: Date.now
  },

  /** User who processed or recorded the payment */
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  /** Soft delete flag */
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Indexes to support efficient querying
paymentSchema.index({ member: 1 });
paymentSchema.index({ paymentDate: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ event: 1 });

/** Mongoose model for Payment */
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
