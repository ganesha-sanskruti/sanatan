
const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const auth = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.get('/test-logging', (req, res) => {
    console.log('TEST LOGGING ROUTE HIT');
    console.log('Current time:', new Date().toISOString());
    res.json({ success: true, message: 'Check your server logs' });
  });

// Ensure uploads directory exists
const uploadDir = 'uploads/posts/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for temporary local storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `post-${uniqueSuffix}${path.extname(file.originalname)}`);
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
        fileSize: 1024 * 1024 * 5 // 5MB max
    }
});

// Debug middleware to log request info
const logRequest = (req, res, next) => {
    console.log('POST request body:', req.body);
    console.log('POST request file:', req.file);
    next();
};

// Routes
router.post('/', auth, upload.single('image'), logRequest, postController.createPost);
router.get('/feed', auth, postController.getFeedPosts);
router.post('/:postId/like', auth, postController.toggleLike);
router.post('/:postId/comment', auth, postController.addComment);
router.post('/:postId/comments/:commentId/replies', auth, postController.addReply);

// Add delete and update routes
router.delete('/:postId', auth, postController.deletePost);
router.put('/:postId', auth, upload.single('image'), postController.updatePost);

module.exports = router;



// OLD Code

// const express = require('express');
// const router = express.Router();
// const postController = require('../controllers/post.controller');
// const auth = require('../middleware/auth.middleware');
// const multer = require('multer');
// const path = require('path');

// // Configure multer for post image uploads
// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'uploads/posts/');
//     },
//     filename: function(req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, `post-${uniqueSuffix}${path.extname(file.originalname)}`);
//     }
// });

// const upload = multer({ 
//     storage: storage,
//     fileFilter: function(req, file, cb) {
//         const filetypes = /jpeg|jpg|png/;
//         const mimetype = filetypes.test(file.mimetype);
//         const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
//         if (mimetype && extname) {
//             return cb(null, true);
//         }
//         cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
//     },
//     limits: {
//         fileSize: 1024 * 1024 * 5 // 5MB max
//     }
// });

// // Debug middleware to log request info
// const logRequest = (req, res, next) => {
//     console.log('POST request body:', req.body);
//     console.log('POST request file:', req.file);
//     next();
// };

// // Routes
// router.post('/', auth, upload.single('image'), logRequest, postController.createPost);
// router.get('/feed', auth, postController.getFeedPosts);
// router.post('/:postId/like', auth, postController.toggleLike);
// router.post('/:postId/comment', auth, postController.addComment);
// router.post('/:postId/comments/:commentId/replies', auth, postController.addReply);

// module.exports = router;