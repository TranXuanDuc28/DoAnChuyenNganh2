const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate, markNotificationsReadSchema } = require('../middleware/validator');
const notificationsController = require('../controllers/notificationsController');

// @route   GET api/notifications
router.get('/', auth, notificationsController.getNotifications);

// @route   POST api/notifications/mark-read
router.post('/mark-read', auth, validate(markNotificationsReadSchema), notificationsController.markRead);

module.exports = router;
