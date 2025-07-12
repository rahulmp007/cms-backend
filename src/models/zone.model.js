const mongoose = require('mongoose');

/**
 * Zone Schema
 * Represents a geographic or administrative area to which members can be assigned.
 */
const zoneSchema = mongoose.Schema({

  /** Name of the zone (must be unique and non-empty) */
  name: {
    type: String,
    required: [true, 'Zone name is required'],
    unique: true,
    trim: true
  },

  /** Optional description of the zone */
  description: {
    type: String,
    trim: true
  },

  /** Indicates whether the zone is currently active */
  isActive: {
    type: Boolean,
    default: true
  }

}, { 
  timestamps: true 
});

/** Mongoose model for Zone */
const Zone = mongoose.model('Zone', zoneSchema);

module.exports = Zone;
