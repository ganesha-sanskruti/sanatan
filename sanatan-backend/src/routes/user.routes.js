const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    },
    limits: {
        fileSize: 1024 * 1024 * 2 // 2MB max
    }
});

// User profile routes
router.get('/me', auth, userController.getCurrentUser);
// Update user profile
router.put('/me', auth, userController.updateProfile);
// Get user profile
router.get('/profile', auth, userController.getProfile);
// Update profile picture
router.post('/me/profile-picture', auth, upload.single('profilePicture'), userController.updateProfilePicture);

module.exports = router;