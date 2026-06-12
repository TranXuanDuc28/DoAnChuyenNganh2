const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const poseController = require('../controllers/poseController');

// POST /api/pose/evaluate
router.post('/evaluate', poseController.evaluate);

// POST /api/pose/evaluate-pose (Python-based automated scoring)
router.post('/evaluate-pose', auth, poseController.evaluatePose);

// GET /api/pose/history
router.get('/history', poseController.getHistory);

// DELETE /api/pose/image/:id
router.delete('/image/:id', poseController.deleteImageEvaluation);

// GET /api/pose/exercises
router.get('/exercises', poseController.getExercises);

// GET /api/pose/exercises/:id
router.get('/exercises/:id', poseController.getExerciseById);

module.exports = router;
