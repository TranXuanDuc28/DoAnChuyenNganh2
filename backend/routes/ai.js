const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const aiService = require('../services/aiService');
const AISuggestion = require('../models/AISuggestion');

// @route   GET api/ai/daily-summary
// @desc    Get daily AI-generated suggestions for the logged-in user
// @access  Private
router.get('/daily-summary', auth, async (req, res) => {
  try {
    // Check if suggestions for today already exist
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let suggestions = await AISuggestion.findAll({
      where: {
        user_id: req.user.id,
        generatedAt: {
          [require('sequelize').Op.gte]: today
        }
      },
      order: [['priority', 'DESC']]
    });

    // If no suggestions for today, generate them
    if (suggestions.length === 0) {
      suggestions = await aiService.generateDailySummary(req.user.id);
    }

    res.json(suggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/ai/generate-workout-plan
// @desc    Generate a new workout plan for the user
// @access  Private
router.post('/generate-workout-plan', auth, async (req, res) => {
  try {
    const { duration, frequency, goal } = req.body;
    const plan = await aiService.createWorkoutPlan(req.user.id, { duration, frequency, goal });
    res.status(201).json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/ai/generate-meal-plan
// @desc    Generate a new meal plan for the user
// @access  Private
router.post('/generate-meal-plan', auth, async (req, res) => {
  try {
    const plan = await aiService.createMealPlan(req.user.id);
    res.status(201).json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

