const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  console.log('Registration request body:', req.body);
  try {
    const { email, password, profile, healthMetrics, nutritionPreferences } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Parse nutrition preferences if they are strings
    let foodPreferences = [];
    let foodAllergies = [];

    if (nutritionPreferences) {
      if (typeof nutritionPreferences.foodPreferences === 'string' && nutritionPreferences.foodPreferences.trim()) {
        foodPreferences = nutritionPreferences.foodPreferences.split(',').map(item => item.trim()).filter(item => item);
      } else if (Array.isArray(nutritionPreferences.foodPreferences)) {
        foodPreferences = nutritionPreferences.foodPreferences;
      }

      if (typeof nutritionPreferences.foodAllergies === 'string' && nutritionPreferences.foodAllergies.trim()) {
        foodAllergies = nutritionPreferences.foodAllergies.split(',').map(item => item.trim()).filter(item => item);
      } else if (Array.isArray(nutritionPreferences.foodAllergies)) {
        foodAllergies = nutritionPreferences.foodAllergies;
      }
    }

    // Create new user from nested profile, healthMetrics, and nutritionPreferences objects
    const user = await User.create({
      email,
      password,
      firstName: profile.firstName,
      lastName: profile.lastName,
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      fitnessLevel: profile.fitnessLevel,
      fitnessGoals: profile.fitnessGoals,
      activityLevel: profile.activityLevel,
      workoutDuration: profile.workoutDuration || null,
      targetWeight: healthMetrics ? healthMetrics.targetWeight : null,
      waistCircumference: healthMetrics ? healthMetrics.waistCircumference : null,
      hipCircumference: healthMetrics ? healthMetrics.hipCircumference : null,
      bodyFatPercentage: healthMetrics ? healthMetrics.bodyFatPercentage : null,
      dailyMeals: nutritionPreferences ? nutritionPreferences.dailyMeals : 3,
      budgetLevel: nutritionPreferences ? nutritionPreferences.budgetLevel : 'medium',
      foodPreferences: foodPreferences,
      foodAllergies: foodAllergies,
      onboardingCompleted: true,
      lastLogin: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`Login attempt failed: User not found for email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log(`Login attempt failed: User ${email} is inactive`);
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Login attempt failed: Invalid password for email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.me = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await user.update(req.body);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

exports.completeOnboarding = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedBody = { ...req.body, onboardingCompleted: true };
    const updatedUser = await user.update(updatedBody);

    res.json({
      message: 'Onboarding completed successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ message: 'Server error during onboarding completion' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    await user.update({ password: newPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: 'Email, password, firstName, and lastName are required'
      });
    }

    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (existingAdmin) {
      return res.status(403).json({
        message: 'Admin account already exists. Please use admin authentication to create additional admins.'
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const admin = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
      isActive: true,
      onboardingCompleted: true,
      lastLogin: new Date()
    });

    const token = jwt.sign(
      { userId: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const adminResponse = admin.toJSON();
    delete adminResponse.password;

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      user: adminResponse
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error during admin creation', error: error.message });
  }
};

exports.createAdminSecure = async (req, res) => {
  try {
    const { email, password, firstName, lastName, secretKey } = req.body;

    if (!email || !password || !firstName || !lastName || !secretKey) {
      return res.status(400).json({
        message: 'Email, password, firstName, lastName, and secretKey are required'
      });
    }

    const validSecretKey = process.env.ADMIN_SECRET_KEY || 'change-this-secret-key-in-production';
    if (secretKey !== validSecretKey) {
      return res.status(403).json({ message: 'Invalid secret key' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const admin = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
      isActive: true,
      onboardingCompleted: true,
      lastLogin: new Date()
    });

    const token = jwt.sign(
      { userId: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const adminResponse = admin.toJSON();
    delete adminResponse.password;

    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      user: adminResponse
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error during admin creation', error: error.message });
  }
};
