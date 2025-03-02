// src/routes/pandit.routes.js
const express = require('express');
const router = express.Router();
const panditController = require('../controllers/pandit.controller');
const { auth } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/profiles'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'pandit-' + uniqueSuffix + ext);
    }
});

// File filter for image uploads
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    },
    fileFilter: fileFilter
});

// Public routes
router.get('/', panditController.getPandits);
router.get('/nearby', panditController.getNearbyPandits);
router.get('/:id', panditController.getPanditById);
router.post('/:id/rate', panditController.ratePandit);

// Protected routes (require authentication)
router.post('/', auth, upload.single('profileImage'), panditController.createPandit);
router.put('/:id', auth, upload.single('profileImage'), panditController.updatePandit);
router.delete('/:id', auth, panditController.deletePandit);

module.exports = router;