const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const jwt = require('jsonwebtoken');
const axios = require('axios'); 

// Helper function to generate token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Helper function to generate OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// MSG91 configuration - use environment variables
const MSG91_CONFIG = {
    API_KEY: process.env.MSG91_API_KEY,
    SENDER_ID: process.env.MSG91_SENDER_ID || 'FLXELE',
    ROUTE: process.env.MSG91_ROUTE || '4',
    COUNTRY: process.env.MSG91_COUNTRY || '91'
};

// Function to send OTP via MSG91
const sendOTP = async (phoneNumber, otp) => {
    try {
        // Remove any '+' prefix if present
        const cleanPhoneNumber = phoneNumber.replace(/^\+/, '');
        
        // Construct the message
        const message = `Your OTP for Sanatan App is: ${otp}. This OTP is valid for 5 minutes.`;
        
        // MSG91 API endpoint
        const url = `https://api.msg91.com/api/sendhttp.php`;
        
        // Prepare the payload
        const params = new URLSearchParams({
            authkey: MSG91_CONFIG.API_KEY,
            mobiles: `${MSG91_CONFIG.COUNTRY}${cleanPhoneNumber}`,
            message: message,
            sender: MSG91_CONFIG.SENDER_ID,
            route: MSG91_CONFIG.ROUTE,
            country: MSG91_CONFIG.COUNTRY
        });
        
        // Send the request to MSG91
        const response = await axios.get(`${url}?${params.toString()}`);
        
        console.log('MSG91 API response:', response.data);
        return true;
    } catch (error) {
        console.error('Error sending OTP via MSG91:', error);
        return false;
    }
};


// Register
exports.register = async (req, res) => {
    try {
        const { name, phoneNumber } = req.body;

        // Check if user already exists
        let user = await User.findOne({ phoneNumber });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered'
            });
        }

        // Create new user
        user = await User.create({
            name,
            phoneNumber
        });

        // Generate and save OTP
        const otp = generateOTP();
        await OTP.create({
            phoneNumber,
            otp
        });

        // Send OTP via MSG91
        const smsSent = await sendOTP(phoneNumber, otp);
        
        // Log OTP for development/debugging
        console.log(`OTP for ${phoneNumber}: ${otp}`);

        res.status(201).json({
            success: true,
            message: smsSent ? 'OTP sent successfully' : 'User registered but SMS delivery failed',
            user: {
                id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Check if user exists
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate and save OTP
        const otp = generateOTP();
        await OTP.create({
            phoneNumber,
            otp
        });

        // Send OTP via MSG91
        const smsSent = await sendOTP(phoneNumber, otp);
        
        // Log OTP for development/debugging
        console.log(`OTP for ${phoneNumber}: ${otp}`);

        res.status(200).json({
            success: true,
            message: smsSent ? 'OTP sent successfully' : 'SMS delivery failed, but you can check the console log'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        // Find the latest OTP for this phone number
        const otpDoc = await OTP.findOne({
            phoneNumber,
            otp
        }).sort({ createdAt: -1 });

        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Find and update user
        const user = await User.findOneAndUpdate(
            { phoneNumber },
            { isVerified: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Delete all OTPs for this phone number
        await OTP.deleteMany({ phoneNumber });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Verify user exists
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete existing OTPs
        await OTP.deleteMany({ phoneNumber });

        // Generate new OTP
        const otp = generateOTP();
        await OTP.create({
            phoneNumber,
            otp
        });

        // In production, send OTP via SMS
        console.log(`New OTP for ${phoneNumber}: ${otp}`);

        res.status(200).json({
            success: true,
            message: 'OTP resent successfully'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

