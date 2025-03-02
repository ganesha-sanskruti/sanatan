const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
    try {
        console.log('Auth Header:', req.header('Authorization')); // Debug line
        
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Extracted Token:', token); // Debug line
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded); // Debug line

        const user = await User.findById(decoded.userId);
        console.log('Found User:', user ? 'Yes' : 'No'); // Debug line

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth Error:', error); // Debug line
        res.status(401).json({ message: 'Invalid token, authentication failed' });
    }
};

module.exports = auth;