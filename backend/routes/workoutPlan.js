const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const workoutPlanController = require('../controllers/workoutPlanController');

// POST /api/workout-plans/generate
router.post('/generate', auth, workoutPlanController.generate);

// GET /api/workout-plans/history
router.get('/history', auth, workoutPlanController.getHistory);

// GET /api/workout-plans/today-calories
router.get('/today-calories', auth, workoutPlanController.getTodayCalories);

// GET /api/workout-plans/active
router.get('/active', auth, workoutPlanController.getActivePlan);

// GET /api/workout-plans
router.get('/', auth, workoutPlanController.getUserPlans);

// GET /api/workout-plans/day/:dayId
router.get('/day/:dayId', auth, workoutPlanController.getDayDetails);

// POST /api/workout-plans/day/:dayId/complete
router.post('/day/:dayId/complete', auth, workoutPlanController.completeDay);

// POST /api/workout-plans/exercise/:exerciseId/complete
router.post('/exercise/:exerciseId/complete', auth, workoutPlanController.completeExercise);

// PUT /api/workout-plans/:planId/deactivate
router.put('/:planId/deactivate', auth, workoutPlanController.deactivatePlan);

module.exports = router;
