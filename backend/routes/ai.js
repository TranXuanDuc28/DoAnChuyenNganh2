const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// @route   GET api/ai/daily-summary
router.get('/daily-summary', auth, aiController.getDailySummary);

// @route   POST api/ai/generate-workout-plan
router.post('/generate-workout-plan', auth, aiController.generateWorkoutPlan);

// @route   POST api/ai/generate-meal-plan
router.post('/generate-meal-plan', auth, aiController.generateMealPlan);

// @route   GET api/ai/meal-plans
router.get('/meal-plans', auth, aiController.getMealPlans);

// @route   GET api/ai/meal-plans/:id
router.get('/meal-plans/:id', auth, aiController.getMealPlanById);

// @route   DELETE api/ai/meal-plans/:id
router.delete('/meal-plans/:id', auth, aiController.deleteMealPlan);

// @route   POST api/ai/chat
router.post('/chat', auth, aiController.chat);

module.exports = router;
