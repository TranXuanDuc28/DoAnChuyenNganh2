const express = require('express');
const { auth } = require('../middleware/auth');
const { 
  validate, 
  loginSchema, 
  registerSchema, 
  changePasswordSchema 
} = require('../middleware/validator');
const authController = require('../controllers/authController');
const router = express.Router();

// Register
router.post('/register', validate(registerSchema), authController.register);

// Login
router.post('/login', validate(loginSchema), authController.login);

// Get current user
router.get('/me', auth, authController.me);

// Update profile
router.put('/profile', auth, authController.updateProfile);

// Complete onboarding
router.put('/onboarding', auth, authController.completeOnboarding);

// Change password
router.put('/password', auth, validate(changePasswordSchema), authController.changePassword);

// Create admin account (only if no admin exists)
router.post('/create-admin', validate(registerSchema), authController.createAdmin);

// Create admin account with secret key
router.post('/create-admin-secure', validate(registerSchema), authController.createAdminSecure);

module.exports = router;
