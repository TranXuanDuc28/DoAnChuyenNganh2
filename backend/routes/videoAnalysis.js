const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { auth, authOrToken } = require('../middleware/auth');
const videoAnalysisController = require('../controllers/videoAnalysisController');
const router = express.Router();

const fsMkdir = promisify(fs.mkdir);

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
    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = `${userId}_${timestamp}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files (mp4, mov, avi, webm) are allowed.'), false);
  }
};

const MAX_UPLOAD_MB = parseInt(process.env.VIDEO_UPLOAD_MAX_MB, 10) || 500;
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_MB * 1024 * 1024
  }
});

// POST /api/video-analysis/process
router.post('/process', auth, upload.single('video'), videoAnalysisController.process);

// GET /api/video-analysis/:id
router.get('/:id', auth, videoAnalysisController.getAnalysis);

// GET /api/video-analysis
router.get('/', auth, videoAnalysisController.getAnalyses);

// GET /api/video-analysis/:id/video
router.get('/:id/video', authOrToken, videoAnalysisController.streamVideo);

// DELETE /api/video-analysis/:id
router.delete('/:id', auth, videoAnalysisController.deleteAnalysis);

// Multer / upload error handler
router.use((err, req, res, next) => {
  try {
    if (!err) return next();
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum allowed size is ${MAX_UPLOAD_MB} MB`
      });
    }

    if (err && err.name === 'MulterError') {
      return res.status(400).json({ success: false, message: err.message });
    }

    return next(err);
  } catch (handlerError) {
    console.error('[VideoAnalysis] Error in multer error handler:', handlerError);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
