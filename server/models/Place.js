const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Religious', 'Nature', 'Heritage', 'Leisure'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  distanceFromBase: {
    type: Number, // in km
    required: true
  },
  openingHours: {
    type: String
  },
  entranceFee: {
    LKR: { type: Number, default: 0 },
    note: String
  },
  travelTips: [String],
  safetyWarnings: [String],
  bestVisitTime: String,
  photos: [String],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Create a 2dsphere index on the coordinates field
placeSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Place', placeSchema);
