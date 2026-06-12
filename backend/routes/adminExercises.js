const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/admin');
const adminExercisesController = require('../controllers/adminExercisesController');

// GET /api/admin/exercises - Get all exercises (including inactive)
router.get('/exercises', adminAuth, adminExercisesController.getAllExercises);

// GET /api/admin/exercises/:id - Get single exercise
router.get('/exercises/:id', adminAuth, adminExercisesController.getExerciseById);

// POST /api/admin/exercises - Create new exercise
router.post('/exercises', adminAuth, adminExercisesController.createExercise);

// PUT /api/admin/exercises/:id - Update exercise
router.put('/exercises/:id', adminAuth, adminExercisesController.updateExercise);

// DELETE /api/admin/exercises/:id - Delete exercise
router.delete('/exercises/:id', adminAuth, adminExercisesController.deleteExercise);

// PUT /api/admin/exercises/reorder - Bulk update display order
router.put('/exercises/reorder', adminAuth, adminExercisesController.reorderExercises);

module.exports = router;
