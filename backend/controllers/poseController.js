const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { spawn } = require('child_process');
const { evaluatePose, getHistory, getImageHistory, deleteImageEvaluation, saveImageEvaluation } = require('../services/poseService');
const { saveImageToDisk } = require('../services/imageStorage');
const PoseExercise = require('../models/PoseExercise');

exports.evaluate = async (req, res) => {
  try {
    const { user_id, exerciseName, keypoints, imageBase64 } = req.body;
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `./tmp/frame_${Date.now()}.jpg`;
      fs.writeFileSync(filename, buffer);
      console.log(`[PoseSocket] Saved image to ${filename}`);
    }

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
};

exports.evaluatePose = async (req, res) => {
  const startTime = Date.now();

  try {
    const { imageBase64 } = req.body || {};
    const user_id = req.user?.id;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, message: 'imageBase64 is required' });
    }

    const m = /^data:(?:[^;]+);base64,(.*)$/.exec(imageBase64);
    const b64 = m ? m[1] : imageBase64;
    const buffer = Buffer.from(b64, 'base64');

    const tmpDir = path.join(__dirname, '../../tmp');
    await fsPromises.mkdir(tmpDir, { recursive: true });
    const tmpFile = path.join(tmpDir, `pose_in_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`);
    await fsPromises.writeFile(tmpFile, buffer);

    const scriptPath = path.resolve(__dirname, '../../Yoga-Posture-Detection-using-Mediapipe/server/main_auto.py');
    try {
      await fsPromises.access(scriptPath);
    } catch (err) {
      await fsPromises.unlink(tmpFile).catch(() => { });
      return res.status(500).json({ success: false, message: 'Python scoring script not found', detail: scriptPath });
    }

    const pythonCmd = process.env.PYTHON_BINARY || 'python';
    const args = [scriptPath, tmpFile];

    const child = spawn(pythonCmd, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    const timeoutMs = parseInt(process.env.POSE_PY_TIMEOUT_MS || '60000', 10);
    const killTimer = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch (e) { }
    }, timeoutMs);

    child.on('close', async (code) => {
      clearTimeout(killTimer);
      await fsPromises.unlink(tmpFile).catch(() => { });

      if (code !== 0) {
        return res.status(500).json({ success: false, message: 'Python scoring failed', code, stderr: stderr.slice(0, 2000) });
      }

      try {
        const result = JSON.parse(stdout);
        const processingTime = (Date.now() - startTime) / 1000;

        let inputImagePath = null;
        let resultImagePath = null;
        let referenceImagePath = null;
        let comparisonImagePath = null;

        if (user_id && result.success) {
          const exerciseName = result.pose_name || 'unknown';

          if (imageBase64) {
            inputImagePath = saveImageToDisk(imageBase64, 'input', user_id, exerciseName);
          }

          if (result.result_image) {
            resultImagePath = saveImageToDisk(result.result_image, 'result', user_id, exerciseName);
          }

          if (result.reference_image) {
            referenceImagePath = saveImageToDisk(result.reference_image, 'reference', user_id, exerciseName);
          }

          if (result.comparison_image) {
            comparisonImagePath = saveImageToDisk(result.comparison_image, 'comparison', user_id, exerciseName);
          }

          try {
            await saveImageEvaluation({
              userId: user_id,
              exerciseName: result.pose_name,
              score: result.score || 0,
              isCorrect: result.isCorrect || false,
              feedback: result.feedback || [],
              keypoints: result.keypoints,
              angles: result.angles,
              detectedPose: result.detected_pose,
              confidence: result.confidence,
              processingTime,
              inputImagePath,
              resultImagePath,
              referenceImagePath,
              comparisonImagePath,
              metadata: {
                pythonVersion: result.version,
                modelType: result.model_type
              }
            });
            console.log('[PoseScoring] Saved evaluation to database');
          } catch (dbError) {
            console.error('[PoseScoring] Failed to save to database:', dbError);
          }
        }

        return res.json({ success: true, result });
      } catch (parseErr) {
        console.warn('[poseScoring] failed to parse python stdout as JSON', parseErr);
        return res.json({ success: true, raw: stdout, stderr: stderr.slice(0, 2000) });
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Internal error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { user_id, limit, type = 'all', exerciseName } = req.query;
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (type === 'image' || type === 'all') {
      const items = await getImageHistory(user_id, exerciseName, Number(limit) || 50);

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
        inputImageUrl: item.inputImagePath ? `${baseUrl}${item.inputImagePath}` : null,
        resultImageUrl: item.resultImagePath ? `${baseUrl}${item.resultImagePath}` : null,
        referenceImageUrl: item.referenceImagePath ? `${baseUrl}${item.referenceImagePath}` : null,
        comparisonImageUrl: item.comparisonImagePath ? `${baseUrl}${item.comparisonImagePath}` : null
      }));

      if (type === 'image') {
        return res.json({ success: true, items: formattedItems });
      }

      const VideoAnalysis = require('../models/VideoAnalysis');
      const videoWhere = user_id ? { userId: user_id } : {};
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
        score: null,
        isCorrect: null,
        repCount: item.repetitionCount,
        createdAt: item.createdAt,
        status: item.status,
        videoUrl: item.videoUrl,
        duration: item.duration
      }));

      const allItems = [...formattedItems, ...formattedVideoItems]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, Number(limit) || 50);

      return res.json({ success: true, items: allItems });
    }

    if (type === 'video') {
      const VideoAnalysis = require('../models/VideoAnalysis');
      const where = user_id ? { userId: user_id } : {};
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
};

exports.deleteImageEvaluation = async (req, res) => {
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
};

exports.getExercises = async (req, res) => {
  try {
    const exercises = await PoseExercise.getActiveExercises();

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
};

exports.getExerciseById = async (req, res) => {
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
};
