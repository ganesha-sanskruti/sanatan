const express = require('express');
const router = express.Router();
const templeController = require('../controllers/temple.controller');
const auth = require('../middleware/auth.middleware');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temples');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split('.').pop();
    cb(null, `temple-${uniqueSuffix}.${extension}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// PUBLIC ROUTES

// Get all temples
router.get('/', templeController.getAllTemples);

// Get nearby temples
router.get('/nearby', templeController.getNearbyTemples);
// Search temples
router.get('/search', templeController.searchTemples);


// Get a specific temple by ID
router.get('/:id', templeController.getTempleById);

// PROTECTED ROUTES (require authentication)

// Create a new temple
router.post(
  '/',
  auth,
  upload.array('images', 5), // Allow up to 5 images
  templeController.createTemple
);

// Update a temple
router.put(
  '/:id',
  auth,
  upload.array('images', 5),
  templeController.updateTemple
);

// Delete a temple
router.delete('/:id', auth, templeController.deleteTemple);

// Rate a temple
router.post('/:id/rate', auth, templeController.rateTemple);

module.exports = router;