const express = require('express');
const { auth } = require('../middleware/auth');
const { createUploadMiddleware } = require('../utils/cloudinary');
const userController = require('../controllers/userController');
const router = express.Router();

const upload = createUploadMiddleware({ maxSize: 5 * 1024 * 1024 });

// Get user profile
router.get('/profile', auth, userController.getProfile);

// Update user profile
router.put('/profile', auth, userController.updateProfile);

// Upload profile image
router.post('/profile/image', auth, upload.single('image'), userController.uploadProfileImage);

// Delete profile image
router.delete('/profile/image', auth, userController.deleteProfileImage);

// Search users
router.get('/search', auth, userController.searchUsers);

// Get friends
router.get('/friends', auth, userController.getFriends);

module.exports = router;
