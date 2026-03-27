const { evaluatePose } = require('../services/poseService');
const realtimePoseRACService = require('../services/realtimePoseRACService');

/**
 * WebSocket handler for real-time pose detection streaming
 * Handles continuous frame streaming from client (camera/video)
 * Supports both traditional pose evaluation and Python-based PoseRAC evaluation
 */
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[PoseSocket] Client connected: ${socket.id}`);

    // Track active processing sessions
    const activeSessions = new Map();

    const repCounter = require('../services/repCounter');

    // Handle pose evaluation stream
    socket.on('pose:evaluate', async (data) => {
      try {
        const { user_id, exerciseName, imageBase64, frameId } = data;
        //console.log(`[PoseSocket] Received pose:evaluate frame!!! ${frameId} for exercise ${exerciseName} from user ${user_id}`);
        //console.log('user_id -------------------', user_id);

        // console.log(`[PoseSocket] Received pose:evaluate:`, {
        //   socketId: socket.id,
        //   frameId,
        //   exerciseName,
        //   hasImageBase64: !!imageBase64,
        //   imageBase64Length: imageBase64 ? imageBase64.length : 0,
        //   hasKeypoints: !!keypoints,
        //   keypointsCount: keypoints ? keypoints.length : 0,
        // });

        // Validate required fields
        if (!exerciseName) {
          //console.error(`[PoseSocket] Missing exerciseName for frame ${frameId}`);
          socket.emit('pose:error', {
            frameId,
            error: 'exerciseName is required'
          });
          return;
        }

        if (!imageBase64) {
          //console.error(`[PoseSocket] Missing both keypoints and imageBase64 for frame ${frameId}`);
          socket.emit('pose:error', {
            frameId,
            error: 'Either keypoints or imageBase64 must be provided'
          });
          return;
        }

        // Check if there's a newer frame being processed (skip old frames)
        const sessionKey = `${socket.id}:${exerciseName}`;
        const currentFrameId = activeSessions.get(sessionKey);

        if (currentFrameId && frameId && frameId < currentFrameId) {
          //console.log(`[PoseSocket] Skipping old frame ${frameId} (current: ${currentFrameId})`);
          return;
        }

        // Update current frame ID
        if (frameId) {
          activeSessions.set(sessionKey, frameId);
        }

        let result;

        if (imageBase64) {
          // Use Python-based PoseRAC evaluation
          let traditionalResult = null;
          const sessionKey = `${socket.id}:${exerciseName}`;
          traditionalResult = await evaluatePose({
            user_id,
            exerciseName,
            imageBase64,
            sessionKey
          });
          //console.log("Duc", traditionalResult);

          // Combine results; if backend provided repCount include it


          // console.log(`[PoseSocket] Python evaluation completed for frame ${frameId}:`, {
          //   best_action: pythonResult.best_action,
          //   best_score: pythonResult.best_score,
          //   phase: pythonResult.phase,
          //   repCount: repState.repCount
          // });
          console.log(`[PoseSocket] Evaluation completed for frame ${frameId}:`, {
            isCorrect: traditionalResult.isCorrect,
            score: traditionalResult.score,
            phase: traditionalResult.phase,
            repCount: traditionalResult.repCount || 0
          });

          // Send result back to client
          socket.emit('pose:result', {
            frameId,
            success: true,
            keypoints: traditionalResult.keypoints,
            angles: traditionalResult.angles,
            isCorrect: traditionalResult.isCorrect,
            score: traditionalResult.score,
            phase: traditionalResult.phase,
            repCount: typeof traditionalResult?.repCount === 'number' ? traditionalResult.repCount : 0
          });

          //console.log(`[PoseSocket] Sent pose:result for frame ${frameId}`);

          // Clean up old session after 5 seconds of inactivity
          if (frameId) {
            setTimeout(() => {
              const latestFrameId = activeSessions.get(sessionKey);
              if (latestFrameId === frameId) {
                activeSessions.delete(sessionKey);
              }
            }, 5000);
          }
        }

      } catch (error) {
        console.error('[PoseSocket] Error evaluating pose:', error);
        socket.emit('pose:error', {
          frameId: data?.frameId,
          error: error.message || 'Failed to evaluate pose',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    });

    // Handle session start
    socket.on('pose:start', (data) => {
      const { exerciseName } = data;
      const sessionKey = `${socket.id}:${exerciseName}`;
      activeSessions.set(sessionKey, 0);
      try {
        repCounter.resetSession(sessionKey);
      } catch (e) {
        console.warn('[PoseSocket] repCounter.resetSession failed:', e.message);
      }
      console.log(`[PoseSocket] Started pose session: ${sessionKey}`);
      socket.emit('pose:started', { exerciseName });
    });

    // Handle session stop
    socket.on('pose:stop', (data) => {
      const { exerciseName } = data;
      const sessionKey = `${socket.id}:${exerciseName}`;
      activeSessions.delete(sessionKey);
      try {
        repCounter.deleteSession(sessionKey);
      } catch (e) {
        console.warn('[PoseSocket] repCounter.deleteSession failed:', e.message);
      }
      console.log(`[PoseSocket] Stopped pose session: ${sessionKey}`);
      socket.emit('pose:stopped', { exerciseName });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // Clean up all sessions for this socket
      for (const [key, _] of activeSessions.entries()) {
        if (key.startsWith(socket.id)) {
          activeSessions.delete(key);
        }
      }
      // Clean up rep states
      try {
        // remove any repCounter sessions for this socket
        for (const key of Array.from(repCounter ? [] : [])) {
          // no-op: repCounter does not currently expose iteration; rely on delete by key pattern if needed
        }
      } catch (e) {
        // ignore
      }
      console.log(`[PoseSocket] Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[PoseSocket] Socket error for ${socket.id}:`, error);
    });
  });

  console.log('[PoseSocket] WebSocket handler initialized');
};

