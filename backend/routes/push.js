const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Save or update push token for the authenticated user
router.post('/register', auth, async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken) return res.status(400).json({ message: 'pushToken is required' });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.pushToken = pushToken;
    await user.save();

    res.json({ message: 'Push token saved' });
  } catch (err) {
    console.error('Failed to register push token:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
