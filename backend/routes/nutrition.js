const express = require('express');
const { auth } = require('../middleware/auth');
const nutritionController = require('../controllers/nutritionController');
const router = express.Router();

// Get food database
router.get('/foods', auth, nutritionController.getFoods);

// Search foods
router.get('/foods/search', auth, nutritionController.searchFoods);

// Get single food
router.get('/foods/:id', auth, nutritionController.getFoodById);

// Create custom food
router.post('/foods', auth, nutritionController.createFood);

// Get nutrition entries
router.get('/entries', auth, nutritionController.getEntries);

// Add nutrition entry
router.post('/entries', auth, nutritionController.addEntry);

// Update nutrition entry
router.put('/entries/:id', auth, nutritionController.updateEntry);

// Delete nutrition entry
router.delete('/entries/:id', auth, nutritionController.deleteEntry);

// Get nutrition goals
router.get('/goals', auth, nutritionController.getGoals);

// Update nutrition goals
router.put('/goals', auth, nutritionController.updateGoals);

// Get water intake
router.get('/water', auth, nutritionController.getWaterIntake);

// Add water intake
router.post('/water', auth, nutritionController.addWaterIntake);

// Get all meal plans
router.get('/meal-plans', auth, nutritionController.getMealPlans);

// Get active meal plan
router.get('/meal-plans/active', auth, nutritionController.getActiveMealPlan);

// Generate AI meal plan
router.post('/meal-plans/generate', auth, nutritionController.generateMealPlan);

// Deactivate meal plan
router.put('/meal-plans/:id/deactivate', auth, nutritionController.deactivateMealPlan);

// Food Log (Nutrition Diary)
router.post('/food-log', auth, nutritionController.addFoodLog);
router.get('/food-log', auth, nutritionController.getFoodLogs);
router.delete('/food-log/:id', auth, nutritionController.deleteFoodLog);
router.put('/food-log/:id', auth, nutritionController.updateFoodLog);

// Meal Completion
router.post('/meal-completions', auth, nutritionController.markMealCompletion);
router.get('/meal-completions', auth, nutritionController.getMealCompletions);
router.delete('/meal-completions/:mealPlanId/:mealId', auth, nutritionController.deleteMealCompletion);

module.exports = router;
