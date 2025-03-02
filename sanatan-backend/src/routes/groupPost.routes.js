const express = require('express');
const router = express.Router();
const groupPostController = require('../controllers/groupPost.controller');
const auth = require('../middleware/auth.middleware');

// Group post routes
router.post('/groups/:groupId/posts', auth, groupPostController.createPost);
router.get('/groups/:groupId/posts', auth, groupPostController.getGroupPosts);
router.post('/posts/:postId/like', auth, groupPostController.toggleLike);
router.post('/posts/:postId/comments', auth, groupPostController.addComment);
router.post('/posts/:postId/comments/:commentId/replies', auth, groupPostController.addReply);

module.exports = router;