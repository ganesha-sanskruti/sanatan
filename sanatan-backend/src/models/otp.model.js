const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // OTP expires after 5 minutes
    }
});

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;