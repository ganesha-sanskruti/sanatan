const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const auth = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configure multer for post image uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/posts/');
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

module.exports = router;