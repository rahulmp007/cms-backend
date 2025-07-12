const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Represents a system user, supporting authentication and role-based access.
 */
const userSchema = mongoose.Schema({
  /** Full name of the user */
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxLenth: [25, 'Name cannot exceed 100 characters'] // NOTE: Typo in `maxLenth`, should be `maxLength`
  },

  /** Unique email address used for login and communication */
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },

  /** Encrypted user password (min length: 6 characters) */
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },

  /** User role within the system (default: Member) */
  role: {
    type: String,
    enum: ['Admin', 'Member'],
    default: 'Member'
  },

  /** Flag indicating if the user is active (used for soft deletion or suspension) */
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Automatically includes createdAt and updatedAt
});

/**
 * Middleware to hash password before saving if modified
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/**
 * Instance method to compare raw password with hashed password
 * @param {string} candidatePassword - Raw password input by user
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/** Mongoose model for User */
const User = mongoose.model('User', userSchema);

module.exports = User;
