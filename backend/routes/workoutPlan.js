const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const workoutPlanService = require('../services/workoutPlanService');

/**
 * @route   POST /api/workout-plans/generate
 * @desc    Generate AI workout plan for user
 * @access  Private
 */
router.post('/generate', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { duration, frequency, goal, focusAreas } = req.body;

    const preferences = {
      duration: duration || 4,
      frequency: frequency || 4,
      goal: goal || 'general_fitness',
      focusAreas: focusAreas || []
    };

    const result = await workoutPlanService.generateWorkoutPlan(userId, preferences);

    res.status(201).json({
      success: true,
      message: 'Workout plan generated successfully',
      data: result.workoutPlan
    });

  } catch (error) {
    console.error('Generate Workout Plan Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate workout plan'
    });
  }
});

/**
 * @route   GET /api/workout-plans/history
 * @desc    Get completed workout days history
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await workoutPlanService.getCompletedWorkoutDays(userId);

    res.json({
      success: true,
      data: result.history
    });

  } catch (error) {
    console.error('Get Workout History Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get workout history'
    });
  }
});

/**
 * @route   GET /api/workout-plans/today-calories
 * @desc    Get today's burned calories from completed exercises
 * @access  Private
 */
router.get('/today-calories', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await workoutPlanService.getTodayCalories(userId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get Today Calories Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get today calories'
    });
  }
});

/**
 * @route   GET /api/workout-plans/active
 * @desc    Get user's active workout plan
 * @access  Private
 */
router.get('/active', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await workoutPlanService.getActiveWorkoutPlan(userId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      data: result.workoutPlan
    });

  } catch (error) {
    console.error('Get Active Workout Plan Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get active workout plan'
    });
  }
});

/**
 * @route   GET /api/workout-plans
 * @desc    Get all workout plans for user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await workoutPlanService.getUserWorkoutPlans(userId);

    res.json({
      success: true,
      data: result.plans
    });

  } catch (error) {
    console.error('Get Workout Plans Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get workout plans'
    });
  }
});

/**
 * @route   GET /api/workout-plans/day/:dayId
 * @desc    Get workout plan day details with exercises
 * @access  Private
 */
router.get('/day/:dayId', auth, async (req, res) => {
  try {
    const { dayId } = req.params;
    const result = await workoutPlanService.getWorkoutPlanDayDetails(dayId);

    res.json({
      success: true,
      data: result.day
    });

  } catch (error) {
    console.error('Get Workout Day Details Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get workout day details'
    });
  }
});

/**
 * @route   POST /api/workout-plans/day/:dayId/complete
 * @desc    Mark workout day as completed
 * @access  Private
 */
router.post('/day/:dayId/complete', auth, async (req, res) => {
  try {
    const { dayId } = req.params;
    const userId = req.user.id;

    const result = await workoutPlanService.completeWorkoutDay(dayId, userId);

    res.json({
      success: true,
      message: 'Workout day completed!',
      data: result
    });

  } catch (error) {
    console.error('Complete Workout Day Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete workout day'
    });
  }
});

/**
 * @route   POST /api/workout-plans/exercise/:exerciseId/complete
 * @desc    Mark individual exercise as completed
 * @access  Private
 */
router.post('/exercise/:exerciseId/complete', auth, async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const userId = req.user.id;

    const result = await workoutPlanService.completeExercise(exerciseId, userId);

    res.json({
      success: true,
      message: 'Exercise completed!',
      data: result
    });

  } catch (error) {
    console.error('Complete Exercise Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete exercise'
    });
  }
});


/**
 * @route   PUT /api/workout-plans/:planId/deactivate
 * @desc    Deactivate workout plan
 * @access  Private
 */
router.put('/:planId/deactivate', auth, async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user.id;

    const result = await workoutPlanService.deactivateWorkoutPlan(planId, userId);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Deactivate Workout Plan Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to deactivate workout plan'
    });
  }
});

module.exports = router;

