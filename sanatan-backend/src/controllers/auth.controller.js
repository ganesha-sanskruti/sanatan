const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Helper function to generate token
const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        throw new Error('Server configuration error');
    }

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
    SENDER_ID: process.env.MSG91_SENDER_ID || 'SANAT',
    ROUTE: process.env.MSG91_ROUTE || '4',
    COUNTRY: process.env.MSG91_COUNTRY || '91'
};

// Function to send OTP via MSG91
const sendOTP = async (phoneNumber, otp) => {
    try {
        // Check if we're in development mode - don't actually send SMS
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV MODE] Would send OTP: ${otp} to phone: ${phoneNumber}`);
            return true;
        }

        // No API key configured - can't send SMS
        if (!MSG91_CONFIG.API_KEY) {
            console.warn('MSG91_API_KEY not configured, SMS delivery disabled');
            return false;
        }

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
        console.log('Registration attempt:', req.body);
        const { name, phoneNumber } = req.body;

        if (!name || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone number are required'
            });
        }

        // Validate phone number
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit phone number'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ phoneNumber });
        if (user) {
            // If user exists but isn't verified, we can continue the registration process
            if (!user.isVerified) {
                console.log(`Continuing registration for unverified user: ${phoneNumber}`);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already registered'
                });
            }
        } else {
            // Create new user
            user = await User.create({
                name,
                phoneNumber
            });
            console.log(`New user created: ${user._id}`);
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
            message: error.message || 'Registration failed'
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Check if user exists
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register first.'
            });
        }

        // Delete any existing OTPs
        await OTP.deleteMany({ phoneNumber });

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
            message: error.message || 'Login failed'
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        console.log(`Verifying OTP: ${otp} for phone: ${phoneNumber}`);

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required'
            });
        }

        // TEST MODE: Accept "1234" as valid OTP for any user (works in any environment)
        if (otp === '1234') {
            console.log('TEST MODE: Accepting test OTP 1234');
            
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
            
            return res.status(200).json({
                success: true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    isVerified: user.isVerified
                }
            });
        }

        // Find the latest OTP for this phone number
        const otpDoc = await OTP.findOne({
            phoneNumber,
            otp
        }).sort({ createdAt: -1 });

        console.log('OTP document found:', otpDoc ? 'Yes' : 'No');

        if (!otpDoc) {
            // Get all OTPs for this number for debugging
            const allOtps = await OTP.find({ phoneNumber }).sort({ createdAt: -1 });
            console.log(`All OTPs for ${phoneNumber}:`, allOtps.map(o => o.otp));
            
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

        console.log(`User ${user._id} successfully verified`);

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
            message: error.message || 'OTP verification failed'
        });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        console.log('Resend OTP request:', req.body);
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

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

        // Send OTP via SMS
        const smsSent = await sendOTP(phoneNumber, otp);
        
        // Log new OTP
        console.log(`New OTP for ${phoneNumber}: ${otp}`);

        res.status(200).json({
            success: true,
            message: 'OTP resent successfully'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to resend OTP'
        });
    }
};

// For future: Validate token endpoint
exports.validateToken = async (req, res) => {
    // The auth middleware already checked if token is valid
    // and attached the user to the request
    return res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: {
            id: req.user._id,
            name: req.user.name,
            phoneNumber: req.user.phoneNumber,
            isVerified: req.user.isVerified
        }
    });
};