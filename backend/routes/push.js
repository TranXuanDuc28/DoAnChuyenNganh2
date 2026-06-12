const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate, registerPushTokenSchema } = require('../middleware/validator');
const pushController = require('../controllers/pushController');

// Save or update push token for the authenticated user
router.post('/register', auth, validate(registerPushTokenSchema), pushController.registerToken);

module.exports = router;
