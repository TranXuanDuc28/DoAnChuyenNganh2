const workoutPlanService = require('../services/workoutPlanService');

exports.generate = async (req, res) => {
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

    if (error.message && error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        message: 'Workout plan generation timed out. The AI is taking longer than expected. Please try again with simpler preferences or fewer weeks.',
        error: 'TIMEOUT'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate workout plan'
    });
  }
};

exports.getHistory = async (req, res) => {
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
};

exports.getTodayCalories = async (req, res) => {
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
};

exports.getActivePlan = async (req, res) => {
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
};

exports.getUserPlans = async (req, res) => {
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
};

exports.getDayDetails = async (req, res) => {
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
};

exports.completeDay = async (req, res) => {
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
};

exports.completeExercise = async (req, res) => {
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
};

exports.deactivatePlan = async (req, res) => {
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
};
