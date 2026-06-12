const express = require('express');
const { auth } = require('../middleware/auth');
const { createUploadMiddleware } = require('../utils/cloudinary');
const { validate, completeWorkoutSessionSchema } = require('../middleware/validator');
const workoutController = require('../controllers/workoutController');
const router = express.Router();

const upload = createUploadMiddleware({ maxSize: 10 * 1024 * 1024 });

// Get workout plans
router.get('/', auth, workoutController.getWorkouts);

// Get exercise categories for client
router.get('/exercise-categories', auth, workoutController.getExerciseCategories);

// Get exercises
router.get('/exercises', auth, workoutController.getExercises);

// Get workout history
router.get('/history', auth, workoutController.getWorkoutHistory);

// Get single workout
router.get('/:id', auth, workoutController.getWorkoutById);

// Create workout
router.post('/', auth, upload.single('image'), workoutController.createWorkout);

// Start workout session
router.post('/:id/start', auth, workoutController.startWorkoutSession);

// Update workout session
router.put('/sessions/:id', auth, workoutController.updateWorkoutSession);

// Complete workout session
router.post('/sessions/:id/complete', auth, validate(completeWorkoutSessionSchema), workoutController.completeWorkoutSession);

// Create exercise
router.post('/exercises', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'videoUrl', maxCount: 1 }
]), workoutController.createExercise);

// Upload exercise image
router.post('/exercises/:id/image', auth, upload.single('image'), workoutController.uploadExerciseImage);

// Upload exercise video
router.post('/exercises/:id/video', auth, upload.single('video'), workoutController.uploadExerciseVideo);

// Delete exercise image
router.delete('/exercises/:id/image', auth, workoutController.deleteExerciseImage);

// Delete exercise video
router.delete('/exercises/:id/video', auth, workoutController.deleteExerciseVideo);

module.exports = router;
