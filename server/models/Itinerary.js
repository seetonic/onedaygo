const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  places: [{
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: true
    },
    sequenceIndex: {
      type: Number,
      required: true
    },
    estimatedTravelTime: {
      type: Number // in seconds
    }
  }],
  totalTravelTime: {
    type: Number // total travel time in seconds
  },
  startingPoint: {
    name: {
      type: String,
      default: "Deurumpitiya"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [80.3647, 6.8476] 
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
