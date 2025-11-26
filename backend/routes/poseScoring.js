const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const { auth } = require('../middleware/auth');
const { saveImageEvaluation } = require('../services/poseService');
const { saveImageToDisk } = require('../services/imageStorage');

const router = express.Router();

// POST /api/pose/evaluate-pose
// Body: { imageBase64: 'data:image/jpeg;base64,...', exerciseName: 'squat' }
router.post('/evaluate-pose', auth, async (req, res) => {
  const startTime = Date.now();

  try {
    const { imageBase64 } = req.body || {};
    const user_id = req.user?.id;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, message: 'imageBase64 is required' });
    }

    // Strip data URL prefix if present
    const m = /^data:(?:[^;]+);base64,(.*)$/.exec(imageBase64);
    const b64 = m ? m[1] : imageBase64;
    const buffer = Buffer.from(b64, 'base64');

    // Write to temporary file
    const tmpDir = path.join(__dirname, '../../tmp');
    await fs.mkdir(tmpDir, { recursive: true });
    const tmpFile = path.join(tmpDir, `pose_in_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`);
    await fs.writeFile(tmpFile, buffer);

    // Path to Python script - using auto-detection
    const scriptPath = path.resolve(__dirname, '../../Yoga-Posture-Detection-using-Mediapipe/server/main_auto.py');
    // Ensure script exists
    try {
      await fs.access(scriptPath);
    } catch (err) {
      await fs.unlink(tmpFile).catch(() => { });
      return res.status(500).json({ success: false, message: 'Python scoring script not found', detail: scriptPath });
    }

    // Spawn python process - no exerciseName needed, auto-detection!
    const pythonCmd = process.env.PYTHON_BINARY || 'python';
    const args = [scriptPath, tmpFile]; // Only image path, no exercise name

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
      // cleanup temp file
      await fs.unlink(tmpFile).catch(() => { });

      if (code !== 0) {
        return res.status(500).json({ success: false, message: 'Python scoring failed', code, stderr: stderr.slice(0, 2000) });
      }

      // Try to parse stdout as JSON
      try {
        const result = JSON.parse(stdout);
        const processingTime = (Date.now() - startTime) / 1000;

        // Save images to disk if available
        let inputImagePath = null;
        let resultImagePath = null;
        let referenceImagePath = null;
        let comparisonImagePath = null;

        if (user_id && result.success) {
          const exerciseName = result.pose_name || 'unknown';

          // Save input image
          if (imageBase64) {
            inputImagePath = saveImageToDisk(imageBase64, 'input', user_id, exerciseName);
          }

          // Save result image (with skeleton)
          if (result.result_image) {
            resultImagePath = saveImageToDisk(result.result_image, 'result', user_id, exerciseName);
          }

          // Save reference image
          if (result.reference_image) {
            referenceImagePath = saveImageToDisk(result.reference_image, 'reference', user_id, exerciseName);
          }

          // Save comparison image
          if (result.comparison_image) {
            comparisonImagePath = saveImageToDisk(result.comparison_image, 'comparison', user_id, exerciseName);
          }

          // Save evaluation to database
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
            // Don't fail the request if DB save fails
          }
        }

        return res.json({ success: true, result });
      } catch (parseErr) {
        console.warn('[poseScoring] failed to parse python stdout as JSON', parseErr);
        // Return raw stdout as fallback
        return res.json({ success: true, raw: stdout, stderr: stderr.slice(0, 2000) });
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Internal error' });
  }
});

module.exports = router;
