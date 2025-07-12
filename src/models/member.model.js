const mongoose = require('mongoose');

/**
 * Mongoose schema for Member profiles.
 * Represents an individual member with related user, zone, membership type, and other metadata.
 */
const memberSchema = new mongoose.Schema({
  /** Reference to associated user account */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },

  /** Unique member ID string (e.g., "MEM001") */
  memberId: {
    type: String,
    required: [true, 'Member ID is required'],
    unique: true,
    uppercase: true
  },

  /** Full name of the member */
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true
  },

  /** Phone number with validation for international formats */
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },

  /** Address details (optional) */
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  /** Reference to the member's zone */
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: [true, 'Zone is required']
  },

  /** Type of membership the member holds */
  membershipType: {
    type: String,
    enum: ['Basic', 'Premium', 'VIP'],
    required: [true, 'Membership type is required']
  },

  /** Current status of the membership */
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Expired'],
    default: 'Active'
  },

  /** Member's date of birth (optional) */
  dateOfBirth: {
    type: Date
  },

  /** Date when the member joined */
  joinDate: {
    type: Date,
    default: Date.now
  },

  /** Date by which membership needs to be renewed */
  renewalDate: {
    type: Date,
    required: [true, 'Renewal date is required']
  },

  /** Optional QR code associated with the member's ID card */
  qrCode: {
    type: String
  },

  /** URL or path to profile image */
  profileImage: {
    type: String
  },

  /** Flag to indicate soft deletion or logical status */
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Indexes to speed up query performance on commonly filtered fields
memberSchema.index({ user: 1 });
memberSchema.index({ memberId: 1 });
memberSchema.index({ email: 1 }); // Note: email is not defined in schema; ensure it's needed
memberSchema.index({ zone: 1, status: 1, membershipType: 1 });

/** Mongoose model for Member schema */
const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
