const aiService = require('../services/aiService');
const geminiService = require('../services/geminiService');
const AISuggestion = require('../models/AISuggestion');
const { Op } = require('sequelize');

exports.getDailySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let suggestions = await AISuggestion.findAll({
      where: {
        userId: req.user.id,
        generatedAt: {
          [Op.gte]: today
        }
      },
      order: [['priority', 'DESC']]
    });

    if (suggestions.length === 0) {
      suggestions = await aiService.generateDailySummary(req.user.id);
    }

    res.json(suggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.generateWorkoutPlan = async (req, res) => {
  try {
    const { duration, frequency, goal } = req.body;
    const plan = await aiService.createWorkoutPlan(req.user.id, { duration, frequency, goal });
    res.status(201).json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.generateMealPlan = async (req, res) => {
  try {
    const options = {
      duration: req.body.duration || 7,
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
};

exports.getMealPlans = async (req, res) => {
  try {
    const { MealPlan } = require('../models/Nutrition');

    const now = new Date();
    await MealPlan.update(
      { isActive: false },
      {
        where: {
          userId: req.user.id,
          isActive: true,
          endDate: {
            [Op.lt]: now
          }
        }
      }
    );

    const mealPlans = await MealPlan.findAll({
      where: {
        userId: req.user.id,
        isActive: true
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
};

exports.getMealPlanById = async (req, res) => {
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
};

exports.deleteMealPlan = async (req, res) => {
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
};

exports.chat = async (req, res) => {
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
};
