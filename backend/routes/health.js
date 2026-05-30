const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/health/activity
 * @desc    Get user activity records (mock data for now)
 * @access  Private
 */
router.get('/activity', auth, async (req, res) => {
  try {
    // For now, return mock data to satisfy the frontend request
    // In a real app, this would fetch from a HealthActivity model
    const mockActivities = [
      {
        id: 1,
        date: '2026-05-11',
        steps: 8450,
        caloriesBurned: 320,
        distance: 5.2,
        activeMinutes: 45
      },
      {
        id: 2,
        date: '2026-05-10',
        steps: 10200,
        caloriesBurned: 410,
        distance: 6.5,
        activeMinutes: 60
      },
      {
        id: 3,
        date: '2026-05-09',
        steps: 7100,
        caloriesBurned: 280,
        distance: 4.1,
        activeMinutes: 35
      }
    ];

    res.json({
      success: true,
      data: mockActivities
    });
  } catch (error) {
    console.error('Get Activity Records Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity records'
    });
  }
});

module.exports = router;
