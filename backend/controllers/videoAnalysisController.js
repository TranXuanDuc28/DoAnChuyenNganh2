const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const VideoAnalysis = require('../models/VideoAnalysis');
const poseRACService = require('../services/poseRACService');

const fsAccess = promisify(fs.access);
const fsStat = promisify(fs.stat);
const fsReadFile = promisify(fs.readFile);
const fsUnlink = promisify(fs.unlink);

exports.process = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

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

    const {
      enter_threshold = 0.78,
      exit_threshold = 0.4,
      momentum = 0.4,
      useCPU = false
    } = req.body;

    console.log(`[VideoAnalysis] Processing video for user ${userId}: ${videoPath}`);

    if (!userId || isNaN(userId)) {
      console.error('[VideoAnalysis] Invalid userId:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    console.log(`[VideoAnalysis] Creating analysis record for user ${userId}`);

    let analysis;
    try {
      analysis = await VideoAnalysis.create({
        userId: parseInt(userId),
        exerciseName: 'unknown',
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
        videoPath: videoPath
      });
      throw createError;
    }

    // Process in the background
    processVideoAsync(analysis.id, videoPath, {
      enter_threshold: parseFloat(enter_threshold),
      exit_threshold: parseFloat(exit_threshold),
      momentum: parseFloat(momentum),
      useCPU: useCPU === true || useCPU === 'true'
    }).catch(error => {
      console.error(`[VideoAnalysis] Error processing video ${analysis.id}:`, error);
    });

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
};

exports.getAnalysis = async (req, res) => {
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
};

exports.getAnalyses = async (req, res) => {
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
};

exports.streamVideo = async (req, res) => {
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

    try {
      await fsAccess(videoPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found'
      });
    }

    const stat = await fsStat(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
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
};

exports.deleteAnalysis = async (req, res) => {
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

    // Delete files
    try {
      if (analysis.inputVideoPath) {
        await fsUnlink(analysis.inputVideoPath).catch(() => {});
      }
      if (analysis.outputVideoPath && analysis.outputVideoPath !== analysis.inputVideoPath) {
        await fsUnlink(analysis.outputVideoPath).catch(() => {});
      }
    } catch (error) {
      console.warn(`[VideoAnalysis] Failed to delete video files: ${error.message}`);
    }

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
};

async function processVideoAsync(analysisId, videoPath, options) {
  const startTime = Date.now();

  try {
    const analysis = await VideoAnalysis.findByPk(analysisId);
    if (!analysis) {
      throw new Error('Analysis record not found');
    }

    const result = await poseRACService.processVideo(videoPath, null, options);
    const processingTime = (Date.now() - startTime) / 1000;
    const outputPath = result.output_video;

    await analysis.update({
      exerciseName: result.action_type,
      repetitionCount: result.repetition_count,
      outputVideoPath: outputPath,
      status: 'completed',
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
