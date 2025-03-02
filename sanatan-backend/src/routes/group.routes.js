const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const auth = require('../middleware/auth.middleware');

// Core group routes
router.post('/', auth, groupController.createGroup);
router.get('/', auth, groupController.getAllGroups);
router.post('/:groupId/join', auth, groupController.joinGroup);
router.post('/:groupId/leave', auth, groupController.leaveGroup);
// Member management routes
router.get('/:groupId/members', auth, groupController.getGroupMembers);
router.put('/:groupId/members/:memberId/role', auth, groupController.updateMemberRole);
router.delete('/:groupId/members/:memberId', auth, groupController.removeMember);
// Group rules routes
router.get('/:groupId/rules', auth, groupController.getGroupRules);
router.post('/:groupId/rules', auth, groupController.addRule);
router.put('/:groupId/rules/:ruleId', auth, groupController.updateRule);
router.delete('/:groupId/rules/:ruleId', auth, groupController.deleteRule);
// Join request routes
router.get('/:groupId/requests', auth, groupController.getJoinRequests);
router.post('/:groupId/request', auth, groupController.sendJoinRequest);
router.post('/:groupId/requests/:requestId/accept', auth, groupController.acceptJoinRequest);
router.post('/:groupId/requests/:requestId/decline', auth, groupController.declineJoinRequest);

module.exports = router;