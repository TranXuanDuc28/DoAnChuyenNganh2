const express = require('express');
const { adminAuth } = require('../middleware/admin');
const { createUploadMiddleware } = require('../utils/cloudinary');
const adminController = require('../controllers/adminController');
const router = express.Router();

const upload = createUploadMiddleware({ maxSize: 5 * 1024 * 1024 });

// ==================== USER MANAGEMENT ====================
router.get('/users', adminAuth, adminController.getUsers);
router.get('/users/:id', adminAuth, adminController.getUserById);
router.post('/users', adminAuth, adminController.createUser);
router.put('/users/:id', adminAuth, adminController.updateUser);
router.delete('/users/:id', adminAuth, adminController.deleteUser);
router.patch('/users/:id/toggle-active', adminAuth, adminController.toggleUserActive);

// ==================== CONTENT MANAGEMENT - EXERCISE CATEGORIES ====================
router.get('/exercise-categories', adminAuth, adminController.getExerciseCategories);
router.get('/exercise-categories/:id', adminAuth, adminController.getExerciseCategoryById);
router.post('/exercise-categories', adminAuth, upload.single('image'), adminController.createExerciseCategory);
router.put('/exercise-categories/:id', adminAuth, upload.single('image'), adminController.updateExerciseCategory);
router.delete('/exercise-categories/:id', adminAuth, adminController.deleteExerciseCategory);

// ==================== CONTENT MANAGEMENT - EXERCISES ====================
router.get('/exercises', adminAuth, adminController.getExercises);
router.get('/exercises/:id', adminAuth, adminController.getExerciseById);
router.post('/exercises', adminAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'videoUrl', maxCount: 1 }
]), adminController.createExercise);
router.put('/exercises/:id', adminAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'videoUrl', maxCount: 1 }
]), adminController.updateExercise);
router.delete('/exercises/:id', adminAuth, adminController.deleteExercise);

// ==================== CONTENT MANAGEMENT - WORKOUTS ====================
router.get('/workouts', adminAuth, adminController.getWorkouts);
router.get('/workouts/:id', adminAuth, adminController.getWorkoutById);
router.post('/workouts', adminAuth, adminController.createWorkout);
router.put('/workouts/:id', adminAuth, adminController.updateWorkout);
router.delete('/workouts/:id', adminAuth, adminController.deleteWorkout);

// ==================== CONTENT MANAGEMENT - WORKOUT PLANS ====================
router.get('/workout-plans', adminAuth, adminController.getWorkoutPlans);
router.get('/workout-plans/:id', adminAuth, adminController.getWorkoutPlanById);
router.delete('/workout-plans/:id', adminAuth, adminController.deleteWorkoutPlan);

// ==================== GOOGLE SHEETS IMPORT ====================
router.post('/exercises/import/validate', adminAuth, adminController.validateImportSheet);
router.post('/exercises/import', adminAuth, adminController.importExercises);
router.get('/exercises/import/template', adminAuth, adminController.getImportTemplate);

// ==================== SYSTEM STATISTICS ====================
router.get('/stats', adminAuth, adminController.getStats);

module.exports = router;
