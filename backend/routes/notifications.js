const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET api/notifications
// @desc    Get all notifications for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/notifications/mark-read
// @desc    Mark specific notifications as read
// @access  Private
router.post('/mark-read', auth, async (req, res) => {
  try {
    const { notificationIds } = req.body; // Expects an array of IDs

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ msg: 'Please provide an array of notification IDs.' });
    }

    await Notification.update(
      { isRead: true },
      {
        where: {
          id: notificationIds,
          userId: req.user.id
        }
      }
    );

    res.json({ msg: 'Notifications marked as read.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
