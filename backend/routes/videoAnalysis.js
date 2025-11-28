const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { auth, authOrToken } = require('../middleware/auth');
const VideoAnalysis = require('../models/VideoAnalysis');
const poseRACService = require('../services/poseRACService');
const router = express.Router();

// Promisify fs methods
const fsAccess = promisify(fs.access);
const fsMkdir = promisify(fs.mkdir);
const fsStat = promisify(fs.stat);
const fsReadFile = promisify(fs.readFile);
const fsUnlink = promisify(fs.unlink);

// Cấu hình multer để lưu video
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/videos');
    try {
      await fsMkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: userId_timestamp_originalname
    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = `${userId}_${timestamp}${ext}`;
    cb(null, name);
  }
});

// Filter để chỉ chấp nhận video files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // .avi
    'video/webm'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files (mp4, mov, avi, webm) are allowed.'), false);
  }
};

// Make upload max size configurable via env var (MB). Default to 500MB.
const MAX_UPLOAD_MB = parseInt(process.env.VIDEO_UPLOAD_MAX_MB, 10) || 500;
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_MB * 1024 * 1024 // MB -> bytes
  }
});

/**
 * POST /api/video-analysis/process
 * Upload và xử lý video để đếm số lần lặp lại động tác
 */
router.post('/process', auth, upload.single('video'), async (req, res) => {
  //console.log('Day rồi');
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    // Validate user authentication
    if (!req.user || !req.user.id) {
      console.error('[VideoAnalysis] Missing user authentication:', {
        hasUser: !!req.user,
        userId: req.user?.id
      });
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const videoPath = req.file.path;
    const userId = req.user.id;

    // Lấy các tham số tùy chọn từ body
    const {
      enter_threshold = 0.78,
      exit_threshold = 0.4,
      momentum = 0.4,
      useCPU = false
    } = req.body;

    console.log(`[VideoAnalysis] Processing video for user ${userId}: ${videoPath}`);

    // Validate userId before creating record
    if (!userId || isNaN(userId)) {
      console.error('[VideoAnalysis] Invalid userId:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    console.log(`[VideoAnalysis] Creating analysis record for user ${userId}`);

    // Tạo record trong database với status 'processing'
    let analysis;
    try {
      analysis = await VideoAnalysis.create({
        userId: parseInt(userId), // Ensure it's an integer
        exerciseName: 'unknown', // Sẽ được cập nhật sau khi xử lý
        repetitionCount: 0,
        inputVideoPath: videoPath,
        status: 'processing'
      });
      console.log(`[VideoAnalysis] Analysis record created successfully: ${analysis.id}`);
    } catch (createError) {
      console.error('[VideoAnalysis] Error creating analysis record:', {
        error: createError.message,
        stack: createError.stack,
        userId: userId,
        userIdType: typeof userId,
        videoPath: videoPath
      });
      throw createError; // Re-throw to be caught by outer try-catch
    }

    // Xử lý video trong background (không block response)
    processVideoAsync(analysis.id, videoPath, {
      enter_threshold: parseFloat(enter_threshold),
      exit_threshold: parseFloat(exit_threshold),
      momentum: parseFloat(momentum),
      useCPU: useCPU === true || useCPU === 'true'
    }).catch(error => {
      console.error(`[VideoAnalysis] Error processing video ${analysis.id}:`, error);
    });

    // Trả về ngay với status processing
    res.status(202).json({
      success: true,
      message: 'Video is being processed',
      analysisId: analysis.id,
      status: 'processing'
    });

  } catch (error) {
    console.error('[VideoAnalysis] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process video'
    });
  }
});

/**
 * GET /api/video-analysis/:id
 * Lấy kết quả phân tích video theo ID
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const analysis = await VideoAnalysis.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Video analysis not found'
      });
    }

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('[VideoAnalysis] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get video analysis'
    });
  }
});

/**
 * GET /api/video-analysis
 * Lấy danh sách các video analysis của user
 */
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, page = 1, exerciseName, status } = req.query;

    const where = { userId: req.user.id };
    if (exerciseName) where.exerciseName = exerciseName;
    if (status) where.status = status;

    const analyses = await VideoAnalysis.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      analyses,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('[VideoAnalysis] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get video analyses'
    });
  }
});

/**
 * GET /api/video-analysis/:id/video
 * Stream video output về client
 * Supports authentication via header or query parameter
 */
router.get('/:id/video', authOrToken, async (req, res) => {
  try {
    const analysis = await VideoAnalysis.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Video analysis not found'
      });
    }

    if (analysis.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Video is still ${analysis.status}`
      });
    }

    const videoPath = analysis.outputVideoPath || analysis.inputVideoPath;

    // Kiểm tra file tồn tại
    try {
      await fsAccess(videoPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    // Set headers để stream video
    const stat = await fsStat(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Partial content support (cho video streaming)
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = await fsReadFile(videoPath);
      const chunk = file.slice(start, end + 1);

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'
      });
      res.end(chunk);
    } else {
      // Full video
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      });
      const file = await fsReadFile(videoPath);
      res.end(file);
    }

  } catch (error) {
    console.error('[VideoAnalysis] Error streaming video:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to stream video'
    });
  }
});

/**
 * DELETE /api/video-analysis/:id
 * Xóa video analysis và các file liên quan
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const analysis = await VideoAnalysis.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Video analysis not found'
      });
    }

    // Xóa các file video
    try {
      if (analysis.inputVideoPath) {
        await fsUnlink(analysis.inputVideoPath);
      }
      if (analysis.outputVideoPath && analysis.outputVideoPath !== analysis.inputVideoPath) {
        await fsUnlink(analysis.outputVideoPath);
      }
    } catch (error) {
      console.warn(`[VideoAnalysis] Failed to delete video files: ${error.message}`);
    }

    // Xóa record
    await analysis.destroy();

    res.json({
      success: true,
      message: 'Video analysis deleted successfully'
    });

  } catch (error) {
    console.error('[VideoAnalysis] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete video analysis'
    });
  }
});

/**
 * Hàm xử lý video bất đồng bộ
 */
async function processVideoAsync(analysisId, videoPath, options) {
  const startTime = Date.now();

  try {
    // Cập nhật status thành processing
    const analysis = await VideoAnalysis.findByPk(analysisId);
    if (!analysis) {
      throw new Error('Analysis record not found');
    }

    // Gọi Python script để xử lý video
    const result = await poseRACService.processVideo(videoPath, null, options);

    const processingTime = (Date.now() - startTime) / 1000;

    // Tạo output path
    const outputPath = result.output_video;

    // Cập nhật kết quả vào database
    await analysis.update({
      exerciseName: result.action_type,
      repetitionCount: result.repetition_count,
      outputVideoPath: outputPath,
      status: 'completed',
      // Lưu URL công khai (nếu server có thông tin host). Frontend vẫn có thể tạo URL bằng getVideoUrl().
      videoUrl: (() => {
        try {
          const host = process.env.PUBLIC_HOST || process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
          return `${host.replace(/\/$/, '')}/api/video-analysis/${analysisId}/video`;
        } catch (e) {
          return null;
        }
      })(),
      processingTime,
      metadata: {
        enter_threshold: options.enter_threshold,
        exit_threshold: options.exit_threshold,
        momentum: options.momentum,
        useCPU: options.useCPU
      }
    });

    console.log(`[VideoAnalysis] Completed processing ${analysisId}: ${result.action_type} - ${result.repetition_count} reps`);

  } catch (error) {
    console.error(`[VideoAnalysis] Error processing video ${analysisId}:`, error);

    // Cập nhật status thành failed
    try {
      const analysis = await VideoAnalysis.findByPk(analysisId);
      if (analysis) {
        await analysis.update({
          status: 'failed',
          errorMessage: error.message
        });
      }
    } catch (updateError) {
      console.error(`[VideoAnalysis] Failed to update error status:`, updateError);
    }
  }
}

module.exports = router;

// Multer / upload error handler (returns JSON) — placed after router to catch middleware errors
router.use((err, req, res, next) => {
  try {
    if (!err) return next();
    // Multer file too large
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum allowed size is ${MAX_UPLOAD_MB} MB`
      });
    }

    // Generic MulterError
    if (err && err.name === 'MulterError') {
      return res.status(400).json({ success: false, message: err.message });
    }

    // Fall through to next error handler
    return next(err);
  } catch (handlerError) {
    console.error('[VideoAnalysis] Error in multer error handler:', handlerError);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/video-analysis/:id - Delete video analysis
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Find the video analysis
    const analysis = await VideoAnalysis.findOne({
      where: { id, userId }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Video analysis not found'
      });
    }

    // Delete video file if exists
    if (analysis.videoPath) {
      const videoFilePath = path.join(__dirname, '../../', analysis.videoPath);
      try {
        await fsUnlink(videoFilePath);
      } catch (err) {
        console.warn('Could not delete video file:', err.message);
      }
    }

    // Delete the database record
    await analysis.destroy();

    return res.json({
      success: true,
      message: 'Video analysis deleted successfully'
    });
  } catch (error) {
    console.error('Delete video analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
