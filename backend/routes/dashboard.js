const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stats - Get today's dashboard statistics
router.get('/stats', auth, dashboardController.getStats);

// GET /api/dashboard/weekly-progress - Get weekly progress data
router.get('/weekly-progress', auth, dashboardController.getWeeklyProgress);

// GET /api/dashboard/recommendations - Get AI recommendations
router.get('/recommendations', auth, dashboardController.getRecommendations);

module.exports = router;
