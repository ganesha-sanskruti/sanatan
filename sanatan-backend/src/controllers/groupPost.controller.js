const GroupPost = require('../models/groupPost.model');
const Group = require('../models/group.model');

exports.createPost = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        // Check if user is member of the group
        const group = await Group.findOne({
            _id: groupId,
            'members.user': userId
        });

        if (!group) {
            return res.status(403).json({
                success: false,
                message: 'Only group members can create posts'
            });
        }

        const post = new GroupPost({
            group: groupId,
            author: userId,
            content
        });

        await post.save();

        await post.populate('author', 'username profilePicture');

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getGroupPosts = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const posts = await GroupPost.find({ group: groupId })
            .populate('author', 'username profilePicture')
            .populate('comments.author', 'username profilePicture')
            .populate('comments.replies.author', 'username profilePicture')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await GroupPost.countDocuments({ group: groupId });

        res.json({
            success: true,
            data: {
                posts,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await GroupPost.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
            post.likesCount -= 1;
        } else {
            // Like
            post.likes.push(userId);
            post.likesCount += 1;
        }

        await post.save();

        res.json({
            success: true,
            data: {
                liked: likeIndex === -1,
                likesCount: post.likesCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        const post = await GroupPost.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        post.comments.push({
            author: userId,
            text
        });

        await post.save();
        await post.populate('comments.author', 'username profilePicture');

        res.status(201).json({
            success: true,
            data: post.comments[post.comments.length - 1]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.addReply = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        const post = await GroupPost.findById(postId);
        
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

        comment.replies.push({
            author: userId,
            text
        });

        await post.save();
        await post.populate('comments.replies.author', 'username profilePicture');

        res.status(201).json({
            success: true,
            data: comment.replies[comment.replies.length - 1]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};