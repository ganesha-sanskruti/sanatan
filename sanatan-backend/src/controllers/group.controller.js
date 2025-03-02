const Group = require('../models/group.model');

exports.createGroup = async (req, res) => {
    try {
        const { name, description, type, location, privacy } = req.body;
        const admin = req.user._id;

        const group = new Group({
            name,
            description,
            type,
            location,
            privacy,
            admin,
            members: [{ user: admin, role: 'admin' }],
            totalMembers: 1
        });

        await group.save();

        res.status(201).json({
            success: true,
            data: group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllGroups = async (req, res) => {
    try {
        const { type, search } = req.query;
        let query = {};

        // Apply filters
        if (type && type !== 'All') {
            query.type = type;
        }

        if (search) {
            query.$text = { $search: search };
        }

        // For non-private groups or groups where user is a member
        query.$or = [
            { privacy: 'public' },
            { 'members.user': req.user._id }
        ];

        const groups = await Group.find(query)
            .populate('admin', 'username profilePicture')
            .select('name description type location privacy totalMembers coverImage')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: groups
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.joinGroup = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is already a member
        const isMember = group.members.some(member => 
            member.user.toString() === userId.toString()
        );

        if (isMember) {
            return res.status(400).json({
                success: false,
                message: 'Already a member of this group'
            });
        }

        // Add member and update count
        group.members.push({ user: userId, role: 'member' });
        group.totalMembers += 1;
        await group.save();

        res.json({
            success: true,
            message: 'Successfully joined group'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.leaveGroup = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is admin
        if (group.admin.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Admin cannot leave the group'
            });
        }

        // Remove member and update count
        const memberIndex = group.members.findIndex(member => 
            member.user.toString() === userId.toString()
        );

        if (memberIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'Not a member of this group'
            });
        }

        group.members.splice(memberIndex, 1);
        group.totalMembers -= 1;
        await group.save();

        res.json({
            success: true,
            message: 'Successfully left group'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { search } = req.query;

        const group = await Group.findById(groupId)
            .populate('members.user', 'username email profilePicture')
            .populate('admin', 'username email profilePicture');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        let members = group.members;

        // Apply search filter if provided
        if (search) {
            members = members.filter(member => 
                member.user.username.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json({
            success: true,
            data: {
                admin: group.admin,
                members: members
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateMemberRole = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const { role } = req.body;

        if (!['admin', 'moderator', 'member'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if requester is admin
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can update member roles'
            });
        }

        // Find and update member role
        const memberIndex = group.members.findIndex(
            member => member.user.toString() === memberId
        );

        if (memberIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Member not found in group'
            });
        }

        // Cannot change role of group admin
        if (group.admin.toString() === memberId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change role of group admin'
            });
        }

        group.members[memberIndex].role = role;
        await group.save();

        res.json({
            success: true,
            message: 'Member role updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if requester is admin
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can remove members'
            });
        }

        // Cannot remove group admin
        if (group.admin.toString() === memberId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove group admin'
            });
        }

        // Find and remove member
        const memberIndex = group.members.findIndex(
            member => member.user.toString() === memberId
        );

        if (memberIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Member not found in group'
            });
        }

        group.members.splice(memberIndex, 1);
        group.totalMembers -= 1;
        await group.save();

        res.json({
            success: true,
            message: 'Member removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get group rules
exports.getGroupRules = async (req, res) => {
    try {
        const { groupId } = req.params;
        
        const group = await Group.findById(groupId)
            .select('rules')
            .populate('rules.createdBy', 'username');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        res.json({
            success: true,
            data: group.rules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add new rule
exports.addRule = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { title, description } = req.body;
        
        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is admin
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can add rules'
            });
        }

        group.rules.push({
            title,
            description,
            createdBy: req.user._id
        });

        await group.save();

        res.status(201).json({
            success: true,
            data: group.rules[group.rules.length - 1]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update rule
exports.updateRule = async (req, res) => {
    try {
        const { groupId, ruleId } = req.params;
        const { title, description } = req.body;

        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is admin
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can update rules'
            });
        }

        const rule = group.rules.id(ruleId);
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Rule not found'
            });
        }

        rule.title = title;
        rule.description = description;
        await group.save();

        res.json({
            success: true,
            data: rule
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete rule
exports.deleteRule = async (req, res) => {
    try {
        const { groupId, ruleId } = req.params;

        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is admin
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can delete rules'
            });
        }

        group.rules.pull(ruleId);
        await group.save();

        res.json({
            success: true,
            message: 'Rule deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get Join Requests
exports.getJoinRequests = async (req, res) => {
    try {
        const { groupId } = req.params;
        
        const group = await Group.findById(groupId)
            .populate('pendingRequests.user', 'username email profilePicture');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is admin
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can view join requests'
            });
        }

        res.json({
            success: true,
            data: group.pendingRequests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Send Join Request
exports.sendJoinRequest = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if group is private
        if (group.privacy !== 'private') {
            return res.status(400).json({
                success: false,
                message: 'This group is public, you can join directly'
            });
        }

        // Check if already a member
        const isMember = group.members.some(member => 
            member.user.toString() === userId.toString()
        );

        if (isMember) {
            return res.status(400).json({
                success: false,
                message: 'Already a member of this group'
            });
        }

        // Check if request already exists
        const requestExists = group.pendingRequests.some(request => 
            request.user.toString() === userId.toString()
        );

        if (requestExists) {
            return res.status(400).json({
                success: false,
                message: 'Join request already sent'
            });
        }

        group.pendingRequests.push({ user: userId });
        await group.save();

        res.json({
            success: true,
            message: 'Join request sent successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Accept Join Request
exports.acceptJoinRequest = async (req, res) => {
    try {
        const { groupId, requestId } = req.params;
        
        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is admin
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can accept join requests'
            });
        }

        // Find the request
        const request = group.pendingRequests.id(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Join request not found'
            });
        }

        // Add user as member
        group.members.push({
            user: request.user,
            role: 'member'
        });
        group.totalMembers += 1;

        // Remove request
        group.pendingRequests.pull(requestId);
        
        await group.save();

        res.json({
            success: true,
            message: 'Join request accepted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Decline Join Request
exports.declineJoinRequest = async (req, res) => {
    try {
        const { groupId, requestId } = req.params;
        
        const group = await Group.findById(groupId);
        
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is admin
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can decline join requests'
            });
        }

        // Find and remove request
        group.pendingRequests.pull(requestId);
        await group.save();

        res.json({
            success: true,
            message: 'Join request declined'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};