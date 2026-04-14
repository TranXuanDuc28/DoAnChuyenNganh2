const express = require('express');
const router = express.Router();
const { evaluatePose, getHistory, getImageHistory, deleteImageEvaluation } = require('../services/poseService');
const PoseExercise = require('../models/PoseExercise');
const fs = require('fs');
// POST /api/pose/evaluate
router.post('/evaluate', async (req, res) => {
  try {
    const { user_id, exerciseName, keypoints, imageBase64 } = req.body;
    if (imageBase64) {
      // Tách base64 (loại bỏ "data:image/jpeg;base64,")
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Lưu ra file tạm
      const filename = `./tmp/frame_${Date.now()}.jpg`;
      fs.writeFileSync(filename, buffer);
      console.log(`[PoseSocket] Saved image to ${filename}`);
    }

    // Log request details for debugging
    console.log('[PoseRoute] Received evaluate request:', {
      hasuser_id: !!user_id,
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

    const result = await evaluatePose({ user_id, exerciseName, keypoints, imageBase64 });
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

// GET /api/pose/history?user_id=&limit=&type=image|video|all&exerciseName=
router.get('/history', async (req, res) => {
  try {
    const { user_id, limit, type = 'all', exerciseName } = req.query;
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (type === 'image' || type === 'all') {
      // Get image detection history from ImageEvaluation table
      const items = await getImageHistory(user_id, exerciseName, Number(limit) || 50);

      // Format items with type field and full image URLs
      const formattedItems = items.map(item => ({
        id: item.id,
        type: 'image',
        userId: item.userId,
        exerciseName: item.exerciseName,
        score: item.score,
        isCorrect: item.isCorrect,
        feedback: item.feedback,
        detectedPose: item.detectedPose,
        confidence: item.confidence,
        createdAt: item.createdAt,
        // Image URLs
        inputImageUrl: item.inputImagePath ? `${baseUrl}${item.inputImagePath}` : null,
        resultImageUrl: item.resultImagePath ? `${baseUrl}${item.resultImagePath}` : null,
        referenceImageUrl: item.referenceImagePath ? `${baseUrl}${item.referenceImagePath}` : null,
        comparisonImageUrl: item.comparisonImagePath ? `${baseUrl}${item.comparisonImagePath}` : null
      }));

      if (type === 'image') {
        return res.json({ success: true, items: formattedItems });
      }

      // If type === 'all', continue to merge with video history
      const VideoAnalysis = require('../models/VideoAnalysis');
      const videoWhere = {};
      if (user_id) videoWhere.userId = user_id;
      if (exerciseName) videoWhere.exerciseName = exerciseName;

      const videoItems = await VideoAnalysis.findAll({
        where: videoWhere,
        order: [['createdAt', 'DESC']],
        limit: Number(limit) || 50
      });

      const formattedVideoItems = videoItems.map(item => ({
        id: item.id,
        type: 'video',
        userId: item.userId,
        exerciseName: item.exerciseName,
        score: null, // Videos don't have score
        isCorrect: null,
        repCount: item.repetitionCount,
        createdAt: item.createdAt,
        // Additional video-specific fields
        status: item.status,
        videoUrl: item.videoUrl,
        duration: item.duration
      }));

      // Merge and sort by createdAt
      const allItems = [...formattedItems, ...formattedVideoItems]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, Number(limit) || 50);

      return res.json({ success: true, items: allItems });
    }

    if (type === 'video') {
      // Get video analysis history
      const VideoAnalysis = require('../models/VideoAnalysis');
      const where = {};
      if (user_id) where.userId = user_id;
      if (exerciseName) where.exerciseName = exerciseName;

      const items = await VideoAnalysis.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: Number(limit) || 50
      });

      const formattedItems = items.map(item => ({
        id: item.id,
        type: 'video',
        userId: item.userId,
        exerciseName: item.exerciseName,
        score: null,
        isCorrect: null,
        repCount: item.repetitionCount,
        createdAt: item.createdAt,
        status: item.status,
        videoUrl: item.videoUrl,
        duration: item.duration
      }));

      return res.json({ success: true, items: formattedItems });
    }

    res.status(400).json({ success: false, message: 'Invalid type parameter. Use: image, video, or all' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/pose/image/:id - Delete image evaluation
router.delete('/image/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    const deleted = await deleteImageEvaluation(id, user_id);

    if (deleted) {
      return res.json({ success: true, message: 'Image evaluation deleted successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'Image evaluation not found' });
    }
  } catch (error) {
    console.error('Delete image evaluation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/pose/exercises - Get all active exercises for mobile app
router.get('/exercises', async (req, res) => {
  try {
    const exercises = await PoseExercise.getActiveExercises();

    // Transform to match mobile app format
    const formattedExercises = exercises.map(ex => ({
      id: ex.exercise_id,
      name: ex.name,
      description: ex.description,
      icon: ex.icon,
      color: ex.color,
      gradient: [ex.gradient_start, ex.gradient_end],
      mode: ex.mode
    }));

    res.json({ success: true, exercises: formattedExercises });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/pose/exercises/:id - Get single exercise by ID
router.get('/exercises/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await PoseExercise.getExerciseById(id);

    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    const formattedExercise = {
      id: exercise.exercise_id,
      name: exercise.name,
      description: exercise.description,
      icon: exercise.icon,
      color: exercise.color,
      gradient: [exercise.gradient_start, exercise.gradient_end],
      mode: exercise.mode
    };

    res.json({ success: true, exercise: formattedExercise });
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
