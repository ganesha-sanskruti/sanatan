// src/models/pandit.model.js
const mongoose = require('mongoose');

const panditSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    specializations: {
        type: [String],
        required: true
    },
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    servicesOffered: [{
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        duration: {
            type: String
        },
        price: {
            type: String
        }
    }],
    profileImage: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    isAvailableOnline: {
        type: Boolean,
        default: false
    },
    isAvailableForTravel: {
        type: Boolean,
        default: false
    },
    isVerified: {
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

// Create a geospatial index for location-based queries
panditSchema.index({ location: '2dsphere' });

const Pandit = mongoose.model('Pandit', panditSchema);
module.exports = Pandit;