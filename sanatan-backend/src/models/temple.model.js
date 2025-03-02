const mongoose = require('mongoose');

// Schema for temple locations
const templeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    trim: true,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  timings: {
    type: String,
    trim: true
  },
  contact: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  facilities: [{
    type: String,
    trim: true
  }],
  verified: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create a geospatial index on the location field
templeSchema.index({ location: '2dsphere' });

const Temple = mongoose.model('Temple', templeSchema);
module.exports = Temple;