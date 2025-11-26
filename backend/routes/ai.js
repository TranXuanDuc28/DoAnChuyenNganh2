const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const aiService = require('../services/aiService');
const geminiService = require('../services/geminiService');
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
        userId: req.user.id,
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
// @desc    Generate a new meal plan for the user using LLM (Gemini AI)
// @access  Private
router.post('/generate-meal-plan', auth, async (req, res) => {
  try {
    const options = {
      duration: req.body.duration || 7, // days
      mealsPerDay: req.body.mealsPerDay || 4,
      dietaryRestrictions: req.body.dietaryRestrictions || [],
      cuisinePreferences: req.body.cuisinePreferences || [],
      allergies: req.body.allergies || []
    };

    console.log('Generating meal plan with options:', options);

    const result = await aiService.createMealPlan(req.user.id, options);
    res.status(201).json(result);
  } catch (err) {
    console.error('Generate meal plan error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to generate meal plan'
    });
  }
});

// @route   GET api/ai/meal-plans
// @desc    Get all meal plans for the logged-in user
// @access  Private
router.get('/meal-plans', auth, async (req, res) => {
  try {
    const { MealPlan } = require('../models/Nutrition');
    const mealPlans = await MealPlan.findAll({
      where: {
        userId: req.user.id
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      mealPlans
    });
  } catch (err) {
    console.error('Get meal plans error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch meal plans'
    });
  }
});

// @route   GET api/ai/meal-plans/:id
// @desc    Get a specific meal plan by ID
// @access  Private
router.get('/meal-plans/:id', auth, async (req, res) => {
  try {
    const { MealPlan } = require('../models/Nutrition');
    const mealPlan = await MealPlan.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        error: 'Meal plan not found'
      });
    }

    res.json({
      success: true,
      mealPlan
    });
  } catch (err) {
    console.error('Get meal plan error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch meal plan'
    });
  }
});

// @route   DELETE api/ai/meal-plans/:id
// @desc    Delete a meal plan
// @access  Private
router.delete('/meal-plans/:id', auth, async (req, res) => {
  try {
    const { MealPlan } = require('../models/Nutrition');
    const mealPlan = await MealPlan.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        error: 'Meal plan not found'
      });
    }

    await mealPlan.destroy();

    res.json({
      success: true,
      message: 'Meal plan deleted successfully'
    });
  } catch (err) {
    console.error('Delete meal plan error:', err.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete meal plan'
    });
  }
});

// @route   POST api/ai/chat
// @desc    Chat with AI fitness assistant
// @access  Private
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log('Chat request from user:', req.user.id, 'Message:', message);

    const result = await geminiService.chatWithAssistant(message.trim());

    res.json({
      success: true,
      response: result.message
    });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to process chat message'
    });
  }
});

module.exports = router;

