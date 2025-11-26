const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const { 
  uploadToCloudinary, 
  deleteFromCloudinary, 
  createUploadMiddleware,
  extractPublicId 
} = require('../utils/cloudinary');
const router = express.Router();

// Create multer upload middleware
const upload = createUploadMiddleware({ maxSize: 5 * 1024 * 1024 });

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    // The user object (without password) is already attached by the auth middleware
    res.json(req.user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Exclude fields that should not be updated directly this way
    const { password, email, ...updateData } = req.body;
    
    const updatedUser = await user.update(updateData);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile image
router.post('/profile/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile image from Cloudinary if exists
    if (user.profileImage) {
      const oldPublicId = extractPublicId(user.profileImage);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    }

    // Upload new image to Cloudinary
    const folder = `fitness-app/users/${user.id}`;
    const result = await uploadToCloudinary(req.file.buffer, folder);

    // Update user profile image
    await user.update({ profileImage: result.url });

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: result.url
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete profile image
router.delete('/profile/image', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete image from Cloudinary if exists
    if (user.profileImage) {
      const publicId = extractPublicId(user.profileImage);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Remove image URL from user profile
    await user.update({ profileImage: null });

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.id },
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${q}%` } },
          { lastName: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } }
        ]
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
      limit: 10
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Friend routes need to be adapted for Sequelize JSON fields ---
// This is a simplified version. A proper implementation would use a separate Friends table.

// Get friends
router.get('/friends', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['friends']
    });
    // Assuming 'friends' is a JSON array of user IDs
    if (!user.friends || user.friends.length === 0) {
      return res.json([]);
    }
    const friendDetails = await User.findAll({
      where: { id: { [Op.in]: user.friends } },
      attributes: ['id', 'firstName', 'lastName', 'profileImage']
    });
    res.json(friendDetails);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Note: The logic for friend requests would need significant changes
// to work with Sequelize's JSON fields and would be complex.
// The following are placeholders and may need a better data structure.

module.exports = router;
