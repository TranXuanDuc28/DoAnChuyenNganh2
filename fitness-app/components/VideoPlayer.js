import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { poseAPI } from '../services/api';
import PoseVisualization from './PoseVisualization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_CAPTURE_INTERVAL = 500; // Capture frame every 500ms (0.5 seconds)

/**
 * Accuracy/Score thresholds for rep counting
 * 
 * Điều kiện để đếm 1 lần tập (rep):
 * 1. requireCorrectForm = true: Yêu cầu form đúng (isCorrect = true)
 *    - Backend tính isCorrect dựa trên góc: squat cần góc đầu gối 70-130°
 * 2. minScore: Ngưỡng điểm tối thiểu (0-1), 0 = không yêu cầu điểm
 *    - Score được tính dựa trên độ gần với góc lý tưởng (90° cho squats)
 *    - Score càng cao = form càng tốt (gần góc 90°)
 * 3. requirePhaseTransition = true: Yêu cầu chuyển động từ down -> up
 * 
 * Ví dụ:
 * - minScore: 0.5 = yêu cầu form tốt (score >= 0.5)
 * - minScore: 0 = chỉ cần isCorrect = true (không yêu cầu điểm cao)
 */
const REP_COUNTING_CONFIG = {
  squats: {
    requireCorrectForm: true,  // Yêu cầu form đúng (góc đầu gối 70-130°)
    minScore: 0,              // Không yêu cầu điểm tối thiểu (chỉ cần isCorrect)
    requirePhaseTransition: true, // Yêu cầu chuyển động down -> up
  },
  'push-ups': {
    requireCorrectForm: true,
    minScore: 0,
    requirePhaseTransition: true,
  }
};

const VideoPlayer = ({ 
  videoUri, 
  exerciseName, 
  userId, 
  onRepCountUpdate,
  onClose 
}) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState('idle');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });
  const [repCount, setRepCount] = useState(0);
  const frameIntervalRef = useRef(null);
  const repStateRef = useRef({
    lastPhase: null,
    lastCorrectState: false,
    consecutiveCorrectFrames: 0,
  });
  const lastCaptureTimeRef = useRef(0);
  const [videoViewDimensions, setVideoViewDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, []);

  // Debug: Log when important states change
  useEffect(() => {
    console.log('[VideoPlayer] State update:', {
      detectionStatus,
      repCount,
      hasCurrentResult: !!currentResult,
      hasKeypoints: !!(currentResult?.keypoints?.length),
      videoViewDimensions,
      shouldShowStatus: detectionStatus !== 'idle',
      shouldShowRep: repCount > 0,
      shouldShowVisualization: !!(currentResult?.keypoints?.length && videoViewDimensions.width > 0),
    });
  }, [detectionStatus, repCount, currentResult, videoViewDimensions]);

  const captureFrame = async () => {
    try {
      // Check if positionMillis is null or undefined (but allow 0 which is valid at start of video)
      if (!videoRef.current || (status.positionMillis == null) || isProcessing) {
        if (!videoRef.current) console.log('[VideoPlayer] captureFrame skipped: no videoRef');
        if (status.positionMillis == null) console.log('[VideoPlayer] captureFrame skipped: no positionMillis (null/undefined)');
        if (isProcessing) console.log('[VideoPlayer] captureFrame skipped: already processing');
        return;
      }
      
      const now = Date.now();
      if (now - lastCaptureTimeRef.current < FRAME_CAPTURE_INTERVAL) return;
      lastCaptureTimeRef.current = now;

      console.log('[VideoPlayer] Starting frame capture at', status.positionMillis, 'ms');
      setIsProcessing(true);
      setDetectionStatus('scanning');

      // Get current time position in seconds
      const timeInSeconds = status.positionMillis / 1000;

      // Extract thumbnail at current position using expo-video-thumbnails
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: timeInSeconds,
        quality: 0.8,
      });
      
      if (!uri) {
        setDetectionStatus('idle');
        setIsProcessing(false);
        return;
      }

      // Resize and optimize image, convert to base64
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 640 } }], // Resize for faster processing
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!manipulatedImage.base64) {
        setDetectionStatus('idle');
        setIsProcessing(false);
        return;
      }

      const imageBase64 = `data:image/jpeg;base64,${manipulatedImage.base64}`;
      
      // Get image dimensions - these are the dimensions of the image sent to backend
      // and keypoints will be relative to these dimensions
      const capturedImageDimensions = {
        width: manipulatedImage.width,
        height: manipulatedImage.height,
      };
      setImageDimensions(capturedImageDimensions);
      // Store as original dimensions for keypoint scaling
      // Keypoints from backend are relative to this captured/resized image
      setOriginalImageDimensions(capturedImageDimensions);

      // Clean up temporary thumbnail file
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch (deleteError) {
        // Ignore deletion errors
      }

      // Send to API for evaluation
      try {
        // Validate required fields
        if (!userId || !exerciseName || !imageBase64) {
          console.warn('[VideoPlayer] Missing required fields:', { 
            userId: !!userId, 
            exerciseName: !!exerciseName, 
            imageBase64: !!imageBase64,
            imageBase64Length: imageBase64 ? imageBase64.length : 0 
          });
          setDetectionStatus('idle');
          setIsProcessing(false);
          return;
        }

        // Log request details for debugging
        console.log('[VideoPlayer] Sending pose evaluation request:', {
          userId,
          exerciseName,
          imageBase64Length: imageBase64.length,
          imageBase64Prefix: imageBase64.substring(0, 50),
        });

        const resp = await poseAPI.evaluate({
          userId,
          exerciseName,
          imageBase64,
        });

        if (resp.data && resp.data.success !== false) {
          if (resp.data.keypoints && resp.data.keypoints.length > 0) {
            if (resp.data.isCorrect) {
              setDetectionStatus('correct');
            } else {
              setDetectionStatus('incorrect');
            }
          } else {
            setDetectionStatus('detected');
          }
        } else {
          setDetectionStatus('no_person');
        }

        console.log('[VideoPlayer] Received pose evaluation result:', {
          hasKeypoints: !!(resp.data?.keypoints?.length),
          keypointCount: resp.data?.keypoints?.length || 0,
          isCorrect: resp.data?.isCorrect,
          hasAngles: !!resp.data?.angles,
          repCount: repCount,
        });
        
        setCurrentResult(resp.data);
        updateRepCount(resp.data);
        
        // Log what should be displayed
        console.log('[VideoPlayer] Setting states for display:', {
          detectionStatus: resp.data.keypoints?.length > 0 
            ? (resp.data.isCorrect ? 'correct' : 'incorrect') 
            : 'no_person',
          hasKeypoints: !!(resp.data.keypoints?.length),
          videoViewDimensions: videoViewDimensions,
          shouldShowVisualization: !!(resp.data.keypoints?.length && videoViewDimensions.width > 0),
          shouldShowStatus: true,
        });
      } catch (apiError) {
        console.error('API error:', apiError);
        // Log more details about the error
        if (apiError.response) {
          const status = apiError.response.status;
          const errorData = apiError.response.data;
          console.error('API error response:', {
            status,
            data: errorData,
            message: errorData?.message,
          });
          
          // Handle different error types
          if (status === 400) {
            // Bad request - validation error or processing error
            const message = errorData?.message || 'Invalid request';
            if (message.includes('keypoints') || message.includes('imageBase64')) {
              console.warn('[VideoPlayer] Image processing failed:', message);
              setDetectionStatus('no_person');
            } else {
              console.warn('[VideoPlayer] Validation error:', message);
              setDetectionStatus('idle');
            }
          } else if (status === 500) {
            // Server error
            console.error('[VideoPlayer] Server error:', errorData?.message);
            setDetectionStatus('idle');
          } else {
            setDetectionStatus('no_person');
          }
        } else if (apiError.request) {
          // Request was made but no response received (network/timeout)
          console.error('API error request:', apiError.request);
          console.error('[VideoPlayer] Network error or timeout - no response from server');
          setDetectionStatus('idle');
        } else {
          // Error setting up the request
          console.error('[VideoPlayer] Request setup error:', apiError.message);
          setDetectionStatus('idle');
        }
      }
      
    } catch (error) {
      console.error('Error capturing frame:', error);
      setDetectionStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  };



  const handlePlaybackStatusUpdate = (playbackStatus) => {
    setStatus(playbackStatus);
    
    if (playbackStatus.isPlaying !== isPlaying) {
      console.log('[VideoPlayer] Video playback status changed:', {
        isPlaying: playbackStatus.isPlaying,
        positionMillis: playbackStatus.positionMillis,
        durationMillis: playbackStatus.durationMillis,
      });
      
      setIsPlaying(playbackStatus.isPlaying);
      
      if (playbackStatus.isPlaying) {
        // Start capturing frames
        console.log('[VideoPlayer] Starting frame capture interval, positionMillis:', playbackStatus.positionMillis);
        // Capture immediately when video starts playing
        // Wait a bit to ensure video has actually started and state is updated
        setTimeout(() => {
          console.log('[VideoPlayer] Attempting immediate frame capture');
          captureFrame();
        }, 200);
        // Then set interval for regular captures
        frameIntervalRef.current = setInterval(() => {
          captureFrame();
        }, FRAME_CAPTURE_INTERVAL);
      } else {
        // Stop capturing frames
        console.log('[VideoPlayer] Stopping frame capture interval');
        if (frameIntervalRef.current) {
          clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
      }
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const updateRepCount = (result) => {
    if (!result || !result.angles) {
      if (!result) console.log('[VideoPlayer] updateRepCount: no result');
      if (!result?.angles) console.log('[VideoPlayer] updateRepCount: no angles in result');
      return;
    }

    const state = repStateRef.current;
    const angles = result.angles;
    let newPhase = null;

    // Determine current phase based on exercise type
    switch (exerciseName) {
      case 'squats':
      case 'squat': {
        const avgKnee = angles.avgKnee || (angles.leftKnee + angles.rightKnee) / 2;
        // Improved phase detection: use wider thresholds to catch more movements
        if (avgKnee < 110) {
          // Down position: knees bent (lower angle)
          newPhase = 'down';
        } else if (avgKnee > 140) {
          // Up position: knees extended (higher angle)
          newPhase = 'up';
        } else {
          // Middle transition - maintain last known phase
          newPhase = state.lastPhase || 'middle';
        }
        
        console.log('[VideoPlayer] Squat phase detection:', {
          avgKnee: avgKnee.toFixed(1),
          leftKnee: angles.leftKnee?.toFixed(1),
          rightKnee: angles.rightKnee?.toFixed(1),
          newPhase,
          lastPhase: state.lastPhase,
          isCorrect: result.isCorrect,
        });
        break;
      }
      case 'push-ups': {
        if (state.consecutiveCorrectFrames < 3) {
          state.consecutiveCorrectFrames++;
          return;
        }
        if (state.lastPhase === 'down' && result.isCorrect) {
          newPhase = 'up';
        } else if (!state.lastCorrectState && result.isCorrect) {
          newPhase = 'down';
        }
        break;
      }
      default:
        return;
    }

    // Count rep when transitioning from down -> up
    // Apply accuracy/score requirements based on exercise type
    const config = REP_COUNTING_CONFIG[exerciseName] || REP_COUNTING_CONFIG.squats;
    
    if (newPhase === 'up' && state.lastPhase === 'down') {
      // Check accuracy requirements
      let canCount = true;
      let reason = '';
      
      if (config.requireCorrectForm && !result.isCorrect) {
        canCount = false;
        reason = 'form không đúng (isCorrect = false)';
      }
      
      if (canCount && config.minScore > 0 && result.score !== undefined && result.score < config.minScore) {
        canCount = false;
        reason = `score quá thấp (${result.score.toFixed(2)} < ${config.minScore})`;
      }
      
      if (canCount && (state.consecutiveCorrectFrames > 0 || state.lastPhase === 'down')) {
        const newCount = repCount + 1;
        console.log('[VideoPlayer] ✓ Rep count updated:', newCount, '(from', repCount, '), phase transition:', state.lastPhase, '->', newPhase, ', isCorrect:', result.isCorrect, ', score:', result.score?.toFixed(2));
        setRepCount(newCount);
        if (onRepCountUpdate) {
          onRepCountUpdate(newCount);
        }
      } else if (!canCount) {
        console.log('[VideoPlayer] ✗ Rep NOT counted -', reason, ', isCorrect:', result.isCorrect, ', score:', result.score?.toFixed(2));
      }
      state.consecutiveCorrectFrames = 0;
    } else if (newPhase === 'down') {
      // Track consecutive down frames to ensure valid rep
      state.consecutiveCorrectFrames++;
      console.log('[VideoPlayer] Down phase detected, consecutive frames:', state.consecutiveCorrectFrames);
    } else if (newPhase !== state.lastPhase && newPhase !== null) {
      // Reset counter when phase changes (but not counting)
      state.consecutiveCorrectFrames = 0;
      console.log('[VideoPlayer] Phase changed:', state.lastPhase, '->', newPhase);
    }

    state.lastPhase = newPhase;
    state.lastCorrectState = result.isCorrect;
  };

  const getStatusInfo = () => {
    switch (detectionStatus) {
      case 'scanning':
        return { text: 'Đang quét...', color: '#FFA500', bgColor: 'rgba(255, 165, 0, 0.2)' };
      case 'correct':
        return { text: '✓ Đúng', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.2)' };
      case 'incorrect':
        return { text: '✗ Sai', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.2)' };
      case 'no_person':
        return { text: 'Không phát hiện', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.2)' };
      default:
        return { text: '', color: '#9CA3AF', bgColor: 'rgba(156, 163, 175, 0.1)' };
    }
  };

  const statusInfo = getStatusInfo();
  const progress = status.durationMillis 
    ? (status.positionMillis || 0) / status.durationMillis 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode="contain"
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onLoad={(loadStatus) => {
            // Video natural size - for reference only
            // We use captured image dimensions for keypoint scaling, not video natural size
            const naturalSize = loadStatus.naturalSize || {};
            console.log('[VideoPlayer] Video loaded, natural size:', naturalSize);
            // Don't override originalImageDimensions here - it's set from captured frame
          }}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (width > 0 && height > 0) {
              console.log('[VideoPlayer] Video layout changed:', { width, height });
              setVideoViewDimensions({ width, height });
              setImageDimensions({ width, height });
            }
          }}
        />
        
        {/* Detection Status Overlay */}
        {detectionStatus !== 'idle' && (
          <View 
            style={[styles.statusOverlay, { 
              backgroundColor: statusInfo.bgColor,
              borderColor: statusInfo.color 
            }]}
            collapsable={false}
          >
            <Icon 
              name={detectionStatus === 'scanning' ? 'scan-circle' : 
                    detectionStatus === 'correct' ? 'checkmark-circle' : 
                    detectionStatus === 'incorrect' ? 'close-circle' : 'person-outline'} 
              size={20} 
              color={statusInfo.color} 
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        )}
        
        {/* Debug: Always show if we have detection data */}
        {__DEV__ && currentResult && (
          <View style={[styles.statusOverlay, { top: 60, backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#fff' }]}>
            <Text style={[styles.statusText, { color: '#fff', fontSize: 10 }]}>
              DEBUG: hasResult={!!currentResult}, hasKeypoints={!!(currentResult?.keypoints?.length)}, 
              status={detectionStatus}, dims={videoViewDimensions.width}x{videoViewDimensions.height}
            </Text>
          </View>
        )}

        {/* Rep Counter Overlay - Always show to track progress */}
        <View style={styles.repOverlay}>
          <Text style={styles.repText}>Số lần tập: {repCount}</Text>
        </View>

        {/* Pose Visualization Overlay */}
        {currentResult && currentResult.keypoints && videoViewDimensions.width > 0 && (
          <View style={styles.visualizationOverlay} pointerEvents="none">
            <PoseVisualization
              imageWidth={videoViewDimensions.width}
              imageHeight={videoViewDimensions.height}
              originalWidth={originalImageDimensions.width}
              originalHeight={originalImageDimensions.height}
              detectedKeypoints={currentResult.keypoints}
              exerciseName={exerciseName}
              showStandard={true}
              showDetected={true}
            />
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
          <Icon 
            name={status.isPlaying ? 'pause' : 'play'} 
            size={32} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.controlButton} onPress={onClose}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Info Text */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Video sẽ tự động nhận diện tư thế khi đang phát
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  statusOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    zIndex: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  repOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(236, 72, 153, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 10,
  },
  repText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  visualizationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    pointerEvents: 'none',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 16,
    borderRadius: 8,
    gap: 8,
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default VideoPlayer;

