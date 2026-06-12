const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const pushController = require('../controllers/pushController');

// Save or update push token for the authenticated user
router.post('/register', auth, pushController.registerToken);

module.exports = router;
