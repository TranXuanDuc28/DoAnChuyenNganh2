const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const bodyMetricsService = require('../services/bodyMetricsService');

// Get user's body metrics history
router.get('/history', auth, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const metrics = await bodyMetricsService.getMetricsHistory(req.user.id, parseInt(limit));
    res.json(metrics);
  } catch (error) {
    console.error('Get metrics history error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics history' });
  }
});

// Get latest body metrics
router.get('/latest', auth, async (req, res) => {
  try {
    const latestMetric = await bodyMetricsService.getLatestMetrics(req.user.id);

    if (!latestMetric) {
      return res.status(404).json({ error: 'No metrics found' });
    }

    res.json(latestMetric);
  } catch (error) {
    console.error('Get latest metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch latest metrics' });
  }
});

// Add new body metrics entry
router.post('/add', auth, async (req, res) => {
  try {
    const metrics = await bodyMetricsService.addBodyMetrics(req.user.id, req.body);
    res.json(metrics);
  } catch (error) {
    console.error('Add metrics error:', error);
    const statusCode = error.message === 'Weight is required' ? 400 : 500;
    res.status(statusCode).json({ error: error.message || 'Failed to add metrics' });
  }
});

// Update body metrics entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const metrics = await bodyMetricsService.updateMetrics(req.user.id, id, req.body);
    res.json(metrics);
  } catch (error) {
    console.error('Update metrics error:', error);
    const statusCode = error.message === 'Metrics entry not found' ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Failed to update metrics' });
  }
});

// Delete body metrics entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await bodyMetricsService.deleteMetrics(req.user.id, id);
    res.json({ message: 'Metrics entry deleted successfully' });
  } catch (error) {
    console.error('Delete metrics error:', error);
    const statusCode = error.message === 'Metrics entry not found' ? 404 : 500;
    res.status(statusCode).json({ error: error.message || 'Failed to delete metrics' });
  }
});

// Get metrics statistics (e.g., weight change over time)
router.get('/stats', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const stats = await bodyMetricsService.getMetricsStats(req.user.id, parseInt(days));
    res.json(stats);
  } catch (error) {
    console.error('Get metrics stats error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics statistics' });
  }
});

// Get weight progress toward target
router.get('/progress', auth, async (req, res) => {
  try {
    const progress = await bodyMetricsService.getWeightProgress(req.user.id);

    if (!progress) {
      return res.status(404).json({ error: 'No target weight set or no metrics available' });
    }

    res.json(progress);
  } catch (error) {
    console.error('Get weight progress error:', error);
    res.status(500).json({ error: 'Failed to fetch weight progress' });
  }
});

module.exports = router;

