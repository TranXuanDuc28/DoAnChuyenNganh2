const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const notificationsController = require('../controllers/notificationsController');

// @route   GET api/notifications
router.get('/', auth, notificationsController.getNotifications);

// @route   POST api/notifications/mark-read
router.post('/mark-read', auth, notificationsController.markRead);

module.exports = router;
