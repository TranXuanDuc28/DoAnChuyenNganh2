const express = require('express');
const { Workout, WorkoutSession, Exercise } = require('../models/Workout');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get workout plans
router.get('/', auth, async (req, res) => {
  try {
    const { category, difficulty, limit = 10, page = 1 } = req.query;
    
    const filter = { isPublic: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const workouts = await Workout.find(filter)
      .populate('exercises.exercise')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json(workouts);
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single workout
router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('exercises.exercise')
      .populate('createdBy', 'profile');

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
      createdBy: req.user._id,
      isCustom: true
    };

    const workout = new Workout(workoutData);
    await workout.save();

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
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const sessionData = {
      user: req.user._id,
      workout: req.params.id,
      startTime: new Date(),
      exercises: workout.exercises.map(ex => ({
        exercise: ex.exercise,
        sets: Array(ex.sets || 1).fill({
          reps: ex.reps || 0,
          weight: ex.weight || 0,
          duration: ex.duration || 0,
          distance: ex.distance || 0,
          completed: false
        })
      }))
    };

    const session = new WorkoutSession(sessionData);
    await session.save();

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
      _id: req.params.id,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Workout session not found' });
    }

    const updatedSession = await WorkoutSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: 'Workout session updated',
      session: updatedSession
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
      _id: req.params.id,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Workout session not found' });
    }

    session.endTime = new Date();
    session.duration = Math.round((session.endTime - session.startTime) / (1000 * 60));
    session.isCompleted = true;
    
    if (req.body.rating) session.rating = req.body.rating;
    if (req.body.mood) session.mood = req.body.mood;
    if (req.body.difficulty) session.difficulty = req.body.difficulty;
    if (req.body.notes) session.notes = req.body.notes;

    await session.save();

    // Update workout completed count
    await Workout.findByIdAndUpdate(session.workout, {
      $inc: { completedCount: 1 }
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

    const sessions = await WorkoutSession.find({ user: req.user._id })
      .populate('workout', 'name category duration')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
    
    const filter = {};
    if (category) filter.category = category;
    if (muscleGroup) filter.muscleGroups = { $in: [muscleGroup] };
    if (difficulty) filter.difficulty = difficulty;

    const exercises = await Exercise.find(filter)
      .limit(limit * 1)
      .sort({ name: 1 });

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
      createdBy: req.user._id,
      isCustom: true
    };

    const exercise = new Exercise(exerciseData);
    await exercise.save();

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
