const Post = require('../models/post.model');
const User = require('../models/user.model');

// Create a new post
// Create a new post - Fixed version with proper error handling
exports.createPost = async (req, res) => {
    try {
        const { content, visibility = 'public' } = req.body;
        
        const post = new Post({
            content,
            visibility,
            author: req.user._id, // Will be set by auth middleware
            image: req.file ? req.file.path : undefined // If image upload is implemented
        });

        await post.save();

        // Populate author details
        await post.populate('author', 'name isVerified');

        // Check if populate worked properly
        console.log('Post after populate:', JSON.stringify(post, null, 2));
        
        // Safely access author properties with optional chaining
        res.status(201).json({
            success: true,
            post: {
                id: post._id,
                content: post.content,
                author: post.author?.name || 'Unknown User',
                isVerified: post.author?.isVerified || false,
                likes: 0,
                comments: [],
                createdAt: post.createdAt
            }
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get feed posts
// Update the getFeedPosts function to include authorType
// exports.getFeedPosts = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         const posts = await Post
//             .find({ visibility: 'public' })
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limit)
//             .populate('author', 'name isVerified')
//             .populate('likes', '_id')
//             .lean();

//         // Transform posts for frontend
//         const transformedPosts = posts.map(post => ({
//             id: post._id,
//             author: post.author.name,
//             authorType: 'User', // You might want to add this field to your User model
//             isVerified: post.author.isVerified,
//             content: post.content,
//             image: post.image,
//             likes: post.likes.length,
//             isLiked: post.likes.some(like => like._id.toString() === req.user._id.toString()),
//             comments: post.comments.map(comment => ({
//                 id: comment._id,
//                 text: comment.text,
//                 author: comment.author.name,
//                 replies: comment.replies.map(reply => ({
//                     id: reply._id,
//                     text: reply.text,
//                     author: reply.author.name,
//                     createdAt: getTimeAgo(reply.createdAt)
//                 })),
//                 createdAt: getTimeAgo(comment.createdAt)
//             })),
//             timeAgo: getTimeAgo(post.createdAt)
//         }));

//         res.json({
//             success: true,
//             posts: transformedPosts,
//             hasMore: posts.length === limit
//         });
//     } catch (error) {
//         console.error('Get feed error:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// In post.controller.js, modify the getFeedPosts function

exports.getFeedPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post
            .find({ visibility: 'public' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name isVerified')
            .populate('likes', '_id')
            .lean();

        // Transform posts for frontend with null checks
        const transformedPosts = posts.map(post => ({
            id: post._id,
            author: post.author?.name || 'Unknown User', // Add null check here
            authorType: post.author ? 'User' : 'Unknown', // Add null check here
            isVerified: post.author?.isVerified || false, // Add null check here
            content: post.content,
            image: post.image,
            likes: post.likes?.length || 0,
            isLiked: post.likes?.some(like => like._id.toString() === req.user._id.toString()) || false,
            comments: (post.comments || []).map(comment => ({
                id: comment._id,
                text: comment.text,
                author: comment.author?.name || 'Unknown', // Add null check here
                replies: (comment.replies || []).map(reply => ({
                    id: reply._id,
                    text: reply.text,
                    author: reply.author?.name || 'Unknown', // Add null check here
                    createdAt: getTimeAgo(reply.createdAt)
                })),
                createdAt: getTimeAgo(comment.createdAt)
            })),
            timeAgo: getTimeAgo(post.createdAt)
        }));

        res.json({
            success: true,
            posts: transformedPosts,
            hasMore: posts.length === limit
        });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Toggle like on a post
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const userId = req.user._id;
        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();

        res.json({
            success: true,
            likes: post.likes.length,
            isLiked: likeIndex === -1
        });
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add comment to a post
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comment = {
            text,
            author: req.user._id,
            replies: []
        };

        post.comments.push(comment);
        await post.save();

        // Get the newly added comment
        const newComment = post.comments[post.comments.length - 1];

        res.status(201).json({
            success: true,
            comment: {
                id: newComment._id,
                text: newComment.text,
                author: req.user.name,
                replies: [],
                createdAt: newComment.createdAt
            }
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add reply to a comment
exports.addReply = async (req, res) => {
    try {
        const { text } = req.body;
        const { postId, commentId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const reply = {
            text,
            author: req.user._id,
            createdAt: new Date()
        };

        comment.replies.push(reply);
        await post.save();

        res.status(201).json({
            success: true,
            reply: {
                id: reply._id,
                text: reply.text,
                author: req.user.name,
                createdAt: reply.createdAt
            }
        });
    } catch (error) {
        console.error('Add reply error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to format time ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
  
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
}