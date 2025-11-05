const express = require('express');
const router = express.Router();
const { evaluatePose, getHistory } = require('../services/poseService');

// POST /api/pose/evaluate
router.post('/evaluate', async (req, res) => {
  try {
    const { userId, exerciseName, keypoints, imageBase64 } = req.body;
    
    // Log request details for debugging
    console.log('[PoseRoute] Received evaluate request:', {
      hasUserId: !!userId,
      exerciseName,
      hasKeypoints: !!keypoints,
      keypointsCount: keypoints ? (Array.isArray(keypoints) ? keypoints.length : 'not array') : 0,
      hasImageBase64: !!imageBase64,
      imageBase64Length: imageBase64 ? imageBase64.length : 0,
      imageBase64Prefix: imageBase64 ? imageBase64.substring(0, 50) : null,
      requestBodySize: JSON.stringify(req.body).length,
    });

    // Validate required fields
    if (!exerciseName) {
      return res.status(400).json({ 
        success: false, 
        message: 'exerciseName is required' 
      });
    }

    if (!keypoints && !imageBase64) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either keypoints or imageBase64 must be provided' 
      });
    }

    if (imageBase64 && typeof imageBase64 !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'imageBase64 must be a string' 
      });
    }

    const result = await evaluatePose({ userId, exerciseName, keypoints, imageBase64 });
    console.log('[PoseRoute] Evaluation successful:', {
      isCorrect: result.isCorrect,
      score: result.score,
      keypointsCount: result.keypoints ? result.keypoints.length : 0,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[PoseRoute] Error evaluating pose:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to evaluate pose',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/pose/history?userId=&limit=
router.get('/history', async (req, res) => {
  try {
    const { userId, limit } = req.query;
    const items = await getHistory(userId, Number(limit) || 50);
    res.json({ success: true, items });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;


