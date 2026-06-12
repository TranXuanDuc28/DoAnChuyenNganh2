const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const bodyMetricsController = require('../controllers/bodyMetricsController');

// Get user's body metrics history
router.get('/history', auth, bodyMetricsController.getHistory);

// Get latest body metrics
router.get('/latest', auth, bodyMetricsController.getLatest);

// Add new body metrics entry
router.post('/add', auth, bodyMetricsController.addMetrics);

// Update body metrics entry
router.put('/:id', auth, bodyMetricsController.updateMetrics);

// Delete body metrics entry
router.delete('/:id', auth, bodyMetricsController.deleteMetrics);

// Get metrics statistics (e.g., weight change over time)
router.get('/stats', auth, bodyMetricsController.getStats);

// Get weight progress toward target
router.get('/progress', auth, bodyMetricsController.getProgress);

module.exports = router;
