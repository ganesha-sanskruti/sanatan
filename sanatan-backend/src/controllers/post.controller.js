const Post = require('../models/post.model');
const User = require('../models/user.model');
const { uploadToS3, deleteFromS3 } = require('../utils/aws');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content, visibility = 'public' } = req.body;
        
        // Upload image to S3 if exists
        let imageUrl = null;
        console.log('🔍 createPost called with:');
        console.log('- Content:', content);
        console.log('- Visibility:', visibility);
        console.log('- File received:', req.file ? 'YES' : 'NO');

        if (req.file) {
            console.log('📁 File details:', {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                path: req.file.path,
                size: req.file.size
            });
        }


        if (req.file) {
            console.log('☁️ Calling uploadToS3 function...');
            imageUrl = await uploadToS3(req.file, 'posts');
            console.log('☁️ uploadToS3 returned:', imageUrl);
        }
        
        const post = new Post({
            content,
            visibility,
            author: req.user._id,
            image: imageUrl
        });

        await post.save();

        // Populate author details
        await post.populate('author', 'name isVerified');
        
        // Safely access author properties with optional chaining
        res.status(201).json({
            success: true,
            post: {
                id: post._id,
                content: post.content,
                author: post.author?.name || 'Unknown User',
                isVerified: post.author?.isVerified || false,
                image: post.image,
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

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        // Check if the current user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post'
            });
        }
        
        // Delete image from S3 if exists
        if (post.image) {
            await deleteFromS3(post.image);
        }
        
        await Post.deleteOne({ _id: post._id });
        
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


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

// Update a post
exports.updatePost = async (req, res) => {
    try {
        const { content, visibility } = req.body;
        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        // Check if the current user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post'
            });
        }
        
        // Update fields
        if (content) post.content = content;
        if (visibility) post.visibility = visibility;
        
        // Handle image update
        if (req.file) {
            // Delete old image if exists
            if (post.image) {
                await deleteFromS3(post.image);
            }
            
            // Upload new image
            post.image = await uploadToS3(req.file, 'posts');
        }
        
        await post.save();
        
        res.json({
            success: true,
            message: 'Post updated successfully',
            post: {
                id: post._id,
                content: post.content,
                image: post.image,
                visibility: post.visibility
            }
        });
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



