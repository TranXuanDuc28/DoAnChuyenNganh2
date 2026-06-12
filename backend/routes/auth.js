const express = require('express');
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');
const router = express.Router();

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get current user
router.get('/me', auth, authController.me);

// Update profile
router.put('/profile', auth, authController.updateProfile);

// Complete onboarding
router.put('/onboarding', auth, authController.completeOnboarding);

// Change password
router.put('/password', auth, authController.changePassword);

// Create admin account (only if no admin exists)
router.post('/create-admin', authController.createAdmin);

// Create admin account with secret key
router.post('/create-admin-secure', authController.createAdminSecure);

module.exports = router;
