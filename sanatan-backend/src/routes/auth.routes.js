const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    verifyOTP, 
    resendOTP 
} = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Add token validation endpoint
router.get('/validate-token', auth, (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Token is valid' 
    });
});

module.exports = router;