// src/controllers/user.controller.js
const User = require('../models/user.model');

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    // The user should be attached to the request by the auth middleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    
    // Allow updates to these fields
    const allowedUpdates = ['name', 'email', 'username'];
    
    // Only add fields that were actually provided
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    // Update the user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    // Handle file upload - this assumes you're using multer middleware
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Update user with the file path
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profilePicture: req.file.path } },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};





// const User = require('../models/user.model');


// exports.getCurrentUser = async (req, res) => {
//   try {
//     // User should already be attached from auth middleware
//     const user = await User.findById(req.user._id).select('-password');
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }
    
//     res.json({
//       success: true,
//       user
//     });
//   } catch (error) {
//     console.error('Get current user error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get user profile
// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select('-password');
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     res.json({
//       success: true,
//       user
//     });
//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Update user profile
// exports.updateProfile = async (req, res) => {
//   try {
//     const { name, email, preferredTemple, notificationsEnabled } = req.body;
    
//     // Build update object with only provided fields
//     const updateData = {};
//     if (name) updateData.name = name;
//     if (email) updateData.email = email;
//     if (preferredTemple !== undefined) updateData.preferredTemple = preferredTemple;
//     if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;
    
//     // If profile picture was uploaded
//     if (req.file) {
//       updateData.profilePicture = req.file.path;
//     }

//     // Find and update the user
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       updateData,
//       { new: true, runValidators: true }
//     ).select('-password');

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Profile updated successfully',
//       user
//     });
//   } catch (error) {
//     console.error('Update profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };