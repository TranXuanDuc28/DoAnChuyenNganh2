const express = require('express');
const { Workout, WorkoutSession, Exercise } = require('../models/Workout');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Get workout plans
router.get('/', auth, async (req, res) => {
  try {
    const { category, difficulty, limit = 10, page = 1 } = req.query;
    
    const where = { isPublic: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const workouts = await Workout.findAll({
      where,
      include: [{ model: Exercise, through: { attributes: [] } }],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });

    res.json(workouts);
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single workout
router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id, {
      include: [
        { model: Exercise, through: { attributes: [] } },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create workout
router.post('/', auth, async (req, res) => {
  try {
    const workoutData = {
      ...req.body,
      createdBy: req.user.id,
      isCustom: true
    };

    const workout = await Workout.create(workoutData);
    
    if (req.body.exercises && Array.isArray(req.body.exercises)) {
      await workout.setExercises(req.body.exercises.map(e => e.id));
    }

    res.status(201).json({
      message: 'Workout created successfully',
      workout
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start workout session
router.post('/:id/start', auth, async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const sessionData = {
      userId: req.user.id,
      workoutId: req.params.id,
      startTime: new Date(),
      exercises: workout.exercises.map(ex => ({
        exerciseId: ex.id,
        sets: Array(ex.sets || 1).fill({
          reps: ex.reps || 0,
          weight: ex.weight || 0,
          duration: ex.duration || 0,
          distance: ex.distance || 0,
          completed: false
        })
      }))
    };

    const session = await WorkoutSession.create(sessionData);

    res.status(201).json({
      message: 'Workout session started',
      session
    });
  } catch (error) {
    console.error('Start workout session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update workout session
router.put('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Workout session not found' });
    }

    await session.update(req.body);

    res.json({
      message: 'Workout session updated',
      session
    });
  } catch (error) {
    console.error('Update workout session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete workout session
router.post('/sessions/:id/complete', auth, async (req, res) => {
  try {
    const session = await WorkoutSession.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Workout session not found' });
    }

    const endTime = new Date();
    const duration = Math.round((endTime - session.startTime) / (1000 * 60));

    await session.update({
      endTime,
      duration,
      isCompleted: true,
      rating: req.body.rating,
      mood: req.body.mood,
      difficulty: req.body.difficulty,
      notes: req.body.notes
    });

    // Update workout completed count
    await Workout.increment('completedCount', {
      where: { id: session.workoutId }
    });

    res.json({
      message: 'Workout session completed',
      session
    });
  } catch (error) {
    console.error('Complete workout session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workout history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const sessions = await WorkoutSession.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Workout,
        attributes: ['name', 'category', 'duration']
      }],
      order: [['startTime', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get exercises
router.get('/exercises', auth, async (req, res) => {
  try {
    const { category, muscleGroup, difficulty, limit = 20 } = req.query;
    
    const where = {};
    if (category) where.category = category;
    if (muscleGroup) where.muscleGroups = { [Op.contains]: [muscleGroup] };
    if (difficulty) where.difficulty = difficulty;

    const exercises = await Exercise.findAll({
      where,
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });

    res.json(exercises);
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create exercise
router.post('/exercises', auth, async (req, res) => {
  try {
    const exerciseData = {
      ...req.body,
      createdBy: req.user.id,
      isCustom: true
    };

    const exercise = await Exercise.create(exerciseData);

    res.status(201).json({
      message: 'Exercise created successfully',
      exercise
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
