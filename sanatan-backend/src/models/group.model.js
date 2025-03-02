const mongoose = require('mongoose');

// Rule Schema
const ruleSchema = new mongoose.Schema({
   title: {
       type: String,
       required: true,
       trim: true
   },
   description: {
       type: String,
       trim: true
   },
   createdBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User'
   }
}, {
   timestamps: true
});

// Member Schema 
const memberSchema = new mongoose.Schema({
   user: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User'
   },
   role: {
       type: String,
       enum: ['admin', 'moderator', 'member'],
       default: 'member'
   },
   joinedAt: {
       type: Date,
       default: Date.now
   }
});

// Main Group Schema
const groupSchema = new mongoose.Schema({
   name: {
       type: String,
       required: true,
       trim: true
   },
   description: {
       type: String,
       required: true
   },
   type: {
       type: String,
       enum: ['Community', 'Study', 'Temple', 'Meditation', 'Education'],
       default: 'Community'
   },
   location: {
       type: String,
       trim: true
   },
   privacy: {
       type: String,
       enum: ['public', 'private'],
       default: 'public'
   },
   admin: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
   },
   members: [memberSchema],
   rules: [ruleSchema],
   pendingRequests: [{
       user: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User'
       },
       requestedAt: {
           type: Date,
           default: Date.now
       }
   }],
   totalMembers: {
       type: Number,
       default: 1
   },
   coverImage: {
       type: String,
       default: ''
   }
}, {
   timestamps: true
});

// Add index for search
groupSchema.index({ name: 'text', description: 'text' });

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;