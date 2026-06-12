import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { colors } from '../theme/colors';

const VideoPlayer = ({ videoUri, exerciseName, user_id, onRepCountUpdate, onClose, initialRepCount = 0 }) => {
  // Use expo-video's useVideoPlayer hook instead of expo-av's ref
  const player = useVideoPlayer(videoUri);

  // Configure player
  useEffect(() => {
    if (player) {
      player.loop = false;
    }
  }, [player]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [repCount, setRepCount] = useState(initialRepCount || 0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoError, setVideoError] = useState(null);
  const [containerSize, setContainerSize] = useState(Dimensions.get('window'));
  const lastVideoPositionRef = useRef(0);
  const lastSkipLogTimeRef = useRef(0);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeoutRef = useRef(null);

  const repStateRef = useRef({
    lastPhase: null,           // Track phase for rep counting (up -> down or down -> up = +1 rep)
    lastRepTime: Date.now(),   // Timestamp of last rep count (for debouncing) - initialize to current time
    lastCorrectState: null,    // Track isCorrect state for exercises like plank-to-downward-dog
    // Jumping jack specific state machine
    jumpingJackState: 'waiting_for_closed', // State machine: 'waiting_for_closed' -> 'closed' -> 'spread' -> 'closed' = 1 rep
    phaseStartTime: null,      // Timestamp when current phase started
    lastStablePhase: null,     // Last stable phase (not middle)
  });

  useEffect(() => {
    const dimensionListener = Dimensions.addEventListener('change', ({ window }) => {
      setContainerSize(window);
      setIsLandscape(window.width > window.height);
    });

    return () => {
      if (dimensionListener?.remove) {
        dimensionListener.remove();
      } else if (typeof dimensionListener === 'function') {
        dimensionListener();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => { });
    };
  }, []);

  const computeDisplayDimensions = useCallback((naturalWidth, naturalHeight, availableWidth, availableHeight) => {
    if (!naturalWidth || !naturalHeight || !availableWidth || !availableHeight) {
      return { width: availableWidth || 0, height: availableHeight || 0 };
    }

    const aspectRatio = naturalWidth / naturalHeight;
    let width = availableWidth;
    let height = width / aspectRatio;

    if (height > availableHeight) {
      height = availableHeight;
      width = height * aspectRatio;
    }

    return { width, height };
  }, []);

  useEffect(() => {
    if (originalImageDimensions.width > 0 && originalImageDimensions.height > 0) {
      const dims = computeDisplayDimensions(
        originalImageDimensions.width,
        originalImageDimensions.height,
        containerSize.width,
        containerSize.height
      );
      setImageDimensions(dims);
    }
  }, [containerSize, originalImageDimensions, computeDisplayDimensions]);

  // Auto-play video when ready (no WebSocket dependency)
  useEffect(() => {
    if (player && videoDuration > 0 && !isPlaying && player.duration > 0) {
      try {
        if (!player.playing) {
          console.log('[VideoPlayer] Auto-playing video');
          player.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.warn('[VideoPlayer] Auto-play error:', error);
      }
    }
  }, [videoDuration, isPlaying, player]);

  // const updateRepCount = (result) => {
  //   const state = repStateRef.current;
  //   const currentPhase = result.phase || 'middle';
  //   const previousPhase = state.lastPhase;

  //   console.log('[VideoPlayer] 🔄 Phase update:', {
  //     previousPhase: previousPhase || 'null',
  //     currentPhase,
  //     transition: previousPhase && previousPhase !== 'middle' && currentPhase !== 'middle' 
  //       ? `${previousPhase} → ${currentPhase}` 
  //       : 'N/A',
  //     isCorrect: result.isCorrect,
  //     score: result.score,
  //     angles: result.angles,
  //     avgElbow: result.angles?.avgElbow,
  //     repCount,
  //     exerciseName,
  //   });

  //   // Special handling for plank: no rep counting (isometric exercise - hold position)
  //   if (exerciseName === 'plank') {
  //     // Plank is a hold exercise, not a rep-based exercise
  //     // We don't count reps, just track correctness
  //     console.log('[VideoPlayer] 📊 Plank: Hold exercise (no rep counting)', {
  //       isCorrect: result.isCorrect,
  //       score: result.score,
  //     });
  //     return; // Early return - no rep counting for plank
  //   }

  //   // Special handling for plank-to-downward-dog: count transitions when pose becomes correct
  //   if (exerciseName === 'plank-to-downward-dog') {
  //     // Count rep when transitioning from incorrect to correct pose
  //     const now = Date.now();
  //     const timeSinceLastRep = now - state.lastRepTime;
  //     const REP_COOLDOWN_MS = 1000; // Minimum time between rep counts (1 second)

  //     if (state.lastCorrectState !== null && state.lastCorrectState !== result.isCorrect) {
  //       if (result.isCorrect && timeSinceLastRep >= REP_COOLDOWN_MS) {
  //         // Transition from incorrect to correct = completed rep
  //         setRepCount(prevCount => {
  //           const newCount = prevCount + 1;
  //           console.log('[VideoPlayer] ✅ Plank-to-Downward-Dog rep completed! Transition: incorrect → correct. New count:', newCount, {
  //             previousCorrect: state.lastCorrectState,
  //             currentCorrect: result.isCorrect,
  //             previousCount: prevCount,
  //             videoPosition: lastVideoPositionRef.current,
  //             timeSinceLastRep: `${timeSinceLastRep}ms`,
  //           });
  //           state.lastRepTime = now;
  //           if (onRepCountUpdate) {
  //             setTimeout(() => {
  //               onRepCountUpdate(newCount);
  //             }, 0);
  //           }
  //           return newCount;
  //         });
  //       }
  //     }

  //     state.lastCorrectState = result.isCorrect;
  //     return; // Early return for plank-to-downward-dog
  //   }

  //   // Special handling for jumping-jack (uses 'spread'/'closed' instead of 'up'/'down')
  //   if (exerciseName === 'jumping-jack') {
  //     const now = Date.now();
  //     const MIN_PHASE_HOLD_MS = 150; // Minimum time a phase must be held to be considered stable (150ms)
  //     const REP_COOLDOWN_MS = 600; // Minimum time between rep counts (600ms)
  //     const timeSinceLastRep = now - state.lastRepTime;

  //     // Track stable phase (ignore 'middle' transitions)
  //     let stablePhase = currentPhase;
  //     if (currentPhase === 'middle') {
  //       // If middle, keep last stable phase
  //       stablePhase = state.lastStablePhase;
  //     } else {
  //       // Update last stable phase when we have a non-middle phase
  //       state.lastStablePhase = currentPhase;
  //     }

  //     // State machine for jumping jack rep counting
  //     // Cycle: waiting_for_closed -> closed -> spread -> closed (count rep) -> waiting_for_closed
  //     if (stablePhase && stablePhase !== 'middle') {
  //       const phaseChanged = state.lastPhase !== stablePhase;
  //       const timeInCurrentPhase = state.phaseStartTime ? now - state.phaseStartTime : 0;

  //       // Update phase start time when phase changes
  //       if (phaseChanged) {
  //         state.phaseStartTime = now;
  //         console.log('[VideoPlayer] 📊 Jumping Jack phase changed:', {
  //           from: state.lastPhase || 'null',
  //           to: stablePhase,
  //           state: state.jumpingJackState,
  //         });
  //       }

  //       // Only process phase transitions if phase has been held for minimum time
  //       if (timeInCurrentPhase >= MIN_PHASE_HOLD_MS || !phaseChanged) {
  //         switch (state.jumpingJackState) {
  //           case 'waiting_for_closed':
  //             // Wait for closed position to start a rep
  //             if (stablePhase === 'closed') {
  //               state.jumpingJackState = 'closed';
  //               state.lastPhase = stablePhase;
  //               console.log('[VideoPlayer] 🟢 Jumping Jack: Starting rep (closed position detected)');
  //             }
  //             break;

  //           case 'closed':
  //             // From closed, wait for spread
  //             if (stablePhase === 'spread') {
  //               state.jumpingJackState = 'spread';
  //               state.lastPhase = stablePhase;
  //               console.log('[VideoPlayer] 📖 Jumping Jack: Spread position detected');
  //             }
  //             // If still closed, stay in closed state
  //             break;

  //           case 'spread':
  //             // From spread, wait for closed to complete the rep
  //             if (stablePhase === 'closed') {
  //               // Complete cycle: closed -> spread -> closed = 1 rep
  //               if (timeSinceLastRep >= REP_COOLDOWN_MS) {
  //                 setRepCount(prevCount => {
  //                   const newCount = prevCount + 1;
  //                   console.log('[VideoPlayer] ✅ Jumping Jack rep completed! Full cycle: closed → spread → closed. New count:', newCount, {
  //                     previousCount: prevCount,
  //                     videoPosition: lastVideoPositionRef.current,
  //                     timeSinceLastRep: `${timeSinceLastRep}ms`,
  //                   });
  //                   state.lastRepTime = now;
  //                   if (onRepCountUpdate) {
  //                     setTimeout(() => {
  //                       onRepCountUpdate(newCount);
  //                     }, 0);
  //                   }
  //                   return newCount;
  //                 });
  //               } else {
  //                 console.log('[VideoPlayer] ⏭️ Jumping Jack rep skipped (too soon):', {
  //                   timeSinceLastRep: `${timeSinceLastRep}ms`,
  //                   cooldown: `${REP_COOLDOWN_MS}ms`,
  //                 });
  //               }
  //               // Reset to waiting for next rep
  //               state.jumpingJackState = 'waiting_for_closed';
  //               state.lastPhase = stablePhase;
  //             }
  //             // If still spread, stay in spread state
  //             break;
  //         }
  //       }
  //     }

  //     // Update lastPhase for tracking
  //     if (stablePhase && stablePhase !== 'middle') {
  //       state.lastPhase = stablePhase;
  //     }

  //     return; // Early return for jumping-jack
  //   }

  //   // Default rep counting for other exercises: detect phase transition down -> up (completed rep)
  //   // Ignore 'middle' phase for state tracking
  //   if (currentPhase !== 'middle' && state.lastPhase !== null && state.lastPhase !== 'middle') {
  //     // Only count rep when transitioning from 'down' to 'up' (completing a rep)
  //     if (state.lastPhase === 'down' && currentPhase === 'up') {
  //       // Add debounce: only count if at least 300ms has passed since last rep count
  //       // Reduced to allow faster rep counting for quick consecutive reps
  //       const now = Date.now();
  //       const timeSinceLastRep = now - state.lastRepTime;
  //       const REP_COOLDOWN_MS = 300; // Minimum time between rep counts (300ms) - reduced to allow faster rep counting

  //       // Special case: if lastRepTime is very old (more than 5 seconds), reset it to allow first rep
  //       // This handles cases where video was restarted but lastRepTime wasn't properly reset
  //       if (timeSinceLastRep > 5000) {
  //         console.log('[VideoPlayer] 🔄 Resetting lastRepTime (too old):', {
  //           timeSinceLastRep: `${timeSinceLastRep}ms`,
  //           resettingTo: 'now',
  //         });
  //         state.lastRepTime = now - REP_COOLDOWN_MS; // Set to allow immediate counting
  //       }

  //       const adjustedTimeSinceLastRep = now - state.lastRepTime;

  //       // Only count if enough time has passed since last rep (debounce)
  //       if (adjustedTimeSinceLastRep >= REP_COOLDOWN_MS) {
  //         // Update lastRepTime FIRST before updating phase to prevent race conditions
  //         state.lastRepTime = now;
  //         // Update lastPhase immediately to prevent other frames from counting the same transition
  //         state.lastPhase = currentPhase;

  //         // Use functional update to avoid stale closure issue when multiple frames process async
  //         setRepCount(prevCount => {
  //           const newCount = prevCount + 1;
  //           console.log('[VideoPlayer] !!!!!✅ Rep completed! Transition: down → up. New count:', newCount, {
  //             previousPhase: previousPhase,
  //             currentPhase,
  //             previousCount: prevCount,
  //             videoPosition: lastVideoPositionRef.current,
  //             timeSinceLastRep: `${adjustedTimeSinceLastRep}ms`,
  //           });
  //           // Schedule callback after render to avoid React warning
  //           if (onRepCountUpdate) {
  //             setTimeout(() => {
  //               onRepCountUpdate(newCount);
  //             }, 0);
  //           }
  //           return newCount;
  //         });
  //       } else {
  //         console.log('[VideoPlayer] ⏭️ Rep skipped (too soon):', {
  //           timeSinceLastRep: `${adjustedTimeSinceLastRep}ms`,
  //           cooldown: `${REP_COOLDOWN_MS}ms`,
  //           previousPhase: state.lastPhase,
  //           currentPhase,
  //           videoPosition: lastVideoPositionRef.current,
  //         });
  //         // Still update phase to track state, but don't count rep
  //         // IMPORTANT: Update phase even when skipping to ensure we can detect next rep
  //         state.lastPhase = currentPhase;
  //       }
  //     } else if (state.lastPhase === 'up' && currentPhase === 'down') {
  //       // Transition from up to down: starting a new rep
  //       // Use functional form to get current repCount for logging
  //       setRepCount(currentCount => {
  //         console.log('[VideoPlayer] ⬇️ Starting rep: up → down', {
  //           repCount: currentCount,
  //           videoPosition: lastVideoPositionRef.current,
  //         });
  //         return currentCount; // Don't change count, just log
  //       });
  //       // Update phase immediately to track the new rep start
  //       state.lastPhase = currentPhase;
  //     } else {
  //       // For other transitions (up → up, down → down), just update phase
  //       // This ensures we always track the current phase state
  //       state.lastPhase = currentPhase;
  //     }
  //   } else {
  //     // Update lastPhase (ignore 'middle' for meaningful transitions)
  //     if (currentPhase !== 'middle') {
  //       if (previousPhase !== currentPhase) {
  //         console.log('[VideoPlayer] 📊 Phase state changed:', {
  //           from: previousPhase || 'null',
  //           to: currentPhase,
  //         });
  //       }
  //       // Always update phase when we have a meaningful phase
  //       state.lastPhase = currentPhase;
  //     } else {
  //       // Preserve meaningful phase when encountering middle
  //       // Only update if we don't have a meaningful phase yet
  //       if (state.lastPhase === null || state.lastPhase === 'middle') {
  //         state.lastPhase = currentPhase;
  //       }
  //     }
  //   }
  // };
  const handleReplay = async () => {
    try {
      if (player) {
        console.log('[VideoPlayer] 🔄 Replaying video from start');
        player.currentTime = 0;
        player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('[VideoPlayer] Replay error:', error);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (!player) return;

      // Show controls when user interacts
      setShowControls(true);
      resetHideControlsTimer();

      if (player.playing) {
        player.pause();
        setIsPlaying(false);
      } else {
        // If at end, restart
        const atEnd = player.duration && (player.currentTime >= player.duration - 0.05);
        if (atEnd) {
          player.currentTime = 0;
        }
        player.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('[VideoPlayer] togglePlayPause error:', e);
    }
  };

  // Auto-hide controls in landscape mode
  const resetHideControlsTimer = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    // Only auto-hide in landscape mode when playing
    if (isLandscape && isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hide after 3 seconds
    }
  };

  // Reset timer when playing state or landscape changes
  useEffect(() => {
    resetHideControlsTimer();
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [isPlaying, isLandscape]);

  const handleRotate = async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsLandscape(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsLandscape(true);
      }
    } catch (error) {
      console.warn('[VideoPlayer] Orientation lock error:', error);
    }
  };

  const handleBackToPortrait = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsLandscape(false);
    } catch (e) {
      console.warn('[VideoPlayer] Back to portrait error:', e);
    }
  };
  const handlePlayPause = async () => {
    try {
      if (!player) return;

      if (player.playing) {
        const positionMillis = (player.currentTime || 0) * 1000;
        const durationMillis = (player.duration || 0) * 1000;
        console.log('[VideoPlayer] 🎬 Video state: PAUSING', {
          positionMillis,
          durationMillis,
          progress: durationMillis > 0 ? (positionMillis / durationMillis * 100).toFixed(1) + '%' : 'N/A',
        });
        player.pause();
        setIsPlaying(false);
      } else {
        const positionMillis = (player.currentTime || 0) * 1000;
        const durationMillis = (player.duration || 0) * 1000;
        console.log('[VideoPlayer] ▶️ Video state: PLAYING', {
          positionMillis,
          durationMillis,
          progress: durationMillis > 0 ? (positionMillis / durationMillis * 100).toFixed(1) + '%' : 'N/A',
        });
        player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('[VideoPlayer] Play/pause error:', error);
    }
  };

  // Handle video load and metadata using useEffect to watch player state
  useEffect(() => {
    if (!player) return;

    // Watch for duration changes (indicates video loaded)
    if (player.duration && player.duration > 0) {
      const durationMillis = player.duration * 1000;

      console.log('[VideoPlayer] 📹 Video loaded:', {
        durationMillis,
        durationSeconds: (player.duration).toFixed(2) + 's',
        isPlaying: player.playing,
        currentTime: player.currentTime,
      });

      // Clear any previous errors when video loads successfully
      setVideoError(null);

      if (durationMillis && durationMillis !== videoDuration) {
        setVideoDuration(durationMillis);

        // Note: expo-video doesn't provide naturalSize directly
        // We'll need to get dimensions from the VideoView component
        // For now, we'll use container dimensions as fallback
        console.log('[VideoPlayer] 📐 Video duration set:', {
          duration: durationMillis + 'ms (' + (player.duration).toFixed(2) + 's)',
        });
      }

      // Auto-play video when loaded
      if (!player.playing) {
        try {
          console.log('[VideoPlayer] ▶️ Auto-playing video after load');
          player.play();
          setIsPlaying(true);
        } catch (error) {
          console.warn('[VideoPlayer] Auto-play failed:', error);
        }
      }
    }
  }, [player?.duration, player?.playing, videoDuration]);

  // Watch for playing state changes
  useEffect(() => {
    if (!player) return;
    setIsPlaying(player.playing);
  }, [player?.playing]);

  // Watch for position changes and handle video events (replaces onPlaybackStatusUpdate)
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      if (!player.duration || player.duration === 0) return;

      const currentPos = (player.currentTime || 0) * 1000; // Convert to milliseconds
      const durationMillis = (player.duration || 0) * 1000;
      const lastPos = lastVideoPositionRef.current;

      // Log position updates periodically (every 1 second)
      if (Math.abs(currentPos - lastPos) >= 1000 || lastPos === 0) {
        console.log('[VideoPlayer] 📍 Video position update:', {
          positionMillis: currentPos,
          durationMillis,
          progress: durationMillis > 0 ? ((currentPos / durationMillis) * 100).toFixed(1) + '%' : 'N/A',
          isPlaying: player.playing,
          repCount,
        });
      }

      // Reset rep state when video starts playing from beginning (position < 500ms)
      if (player.playing && !isPlaying && currentPos < 500) {
        const resetTime = Date.now();
        console.log('[VideoPlayer] 🔄 Video started from beginning, resetting rep state', {
          resetTime,
          previousLastRepTime: repStateRef.current.lastRepTime,
          timeSinceLastRep: resetTime - repStateRef.current.lastRepTime,
        });
        setRepCount(0);
        repStateRef.current = {
          lastPhase: null,
          lastRepTime: resetTime,
          lastCorrectState: null,
        };
        if (onRepCountUpdate) {
          onRepCountUpdate(0);
        }
      }

      // Check if video finished (reached end)
      if (durationMillis > 0 && currentPos >= durationMillis - 100) {
        console.log('[VideoPlayer] ⏹️ Video finished playing (auto-replay)', {
          finalPosition: currentPos,
          duration: durationMillis,
          totalReps: repCount,
        });
        // Auto-replay: restart from beginning
        try {
          handleReplay();
        } catch (e) {
          console.warn('[VideoPlayer] Auto-replay failed:', e);
          setIsPlaying(false);
        }
        lastVideoPositionRef.current = 0;
      }

      // Detect if video was seeked backwards (restart or seek to beginning)
      if (
        currentPos < 1000 &&
        lastPos > 2000 &&
        repCount > 0 &&
        Math.abs(currentPos - lastPos) > 1000 // Significant jump backwards
      ) {
        const resetTime = Date.now();
        console.log('[VideoPlayer] ⏪ Video seek/restart detected, resetting rep count:', {
          currentPos,
          lastPos,
          repCount,
          jumpBack: lastPos - currentPos,
          resetTime,
          previousLastRepTime: repStateRef.current.lastRepTime,
          timeSinceLastRep: resetTime - repStateRef.current.lastRepTime,
        });
        setRepCount(0);
        repStateRef.current = {
          lastPhase: null,
          lastRepTime: resetTime,
          lastCorrectState: null,
        };
        if (onRepCountUpdate) {
          onRepCountUpdate(0);
        }
      }

      lastVideoPositionRef.current = currentPos;
    }, 100); // Check every 100ms

    return () => clearInterval(interval);
  }, [player, isPlaying, repCount, onRepCountUpdate]);

  return (
    <View style={styles.container}>
      {/* Hide internal header when landscape to provide true fullscreen */}
      {!isLandscape && (
        <SafeAreaView style={styles.safeHeader}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Video Player</Text>
            <View style={styles.repContainer}>
              <Text style={styles.repText}>Reps: {repCount}</Text>
            </View>
          </View>
        </SafeAreaView>
      )}

      <View
        style={styles.videoContainer}
        onLayout={({ nativeEvent }) => {
          const { width, height } = nativeEvent.layout;
          if (width !== containerSize.width || height !== containerSize.height) {
            setContainerSize({ width, height });
          }
          setIsLandscape(width > height);
        }}
      >
        <View
          style={[
            styles.videoInner,
            imageDimensions.width > 0 && imageDimensions.height > 0
              ? { width: imageDimensions.width, height: imageDimensions.height }
              : { width: '100%', height: '100%' }
          ]}
        >
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
          />

          {/* Tap overlay: toggle play/pause and show controls when user taps the video */}
          <TouchableOpacity
            style={styles.tapOverlay}
            activeOpacity={1}
            onPress={() => {
              if (isLandscape) {
                // In landscape, tap shows/hides controls
                setShowControls(!showControls);
                if (!showControls) {
                  resetHideControlsTimer();
                }
              } else {
                // In portrait, tap toggles play/pause
                togglePlayPause();
              }
            }}
          />

          {/* Landscape: show centered play/pause + back button (with auto-hide) */}
          {isLandscape && showControls && (
            <>
              <TouchableOpacity style={styles.landscapeCenterBtn} onPress={togglePlayPause}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={48} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.landscapeBackBtn} onPress={handleBackToPortrait}>
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          {/* No overlay in HTTP-only mode */}
        </View>

        {videoError && (
          <View style={styles.errorOverlay}>
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={48} color="#F44336" />
              <Text style={styles.errorTitle}>{videoError.title}</Text>
              <Text style={styles.errorMessage}>{videoError.message}</Text>
              {videoError.codec && (
                <Text style={styles.errorCodec}>Codec: {videoError.codec}</Text>
              )}
              {videoError.suggestion && (
                <Text style={styles.errorSuggestion}>{videoError.suggestion}</Text>
              )}
              <View style={styles.errorButtonContainer}>
                {videoError.isRateLimit && (
                  <TouchableOpacity
                    style={[styles.errorButton, styles.retryButton]}
                    onPress={async () => {
                      setVideoError(null);
                      // Wait a bit before retrying
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      // Reload video by recreating player
                      if (player) {
                        try {
                          // expo-video player will reload when source changes
                          // For now, just clear error and let user retry manually
                          console.log('[VideoPlayer] Retry requested - video should reload');
                        } catch (e) {
                          console.error('[VideoPlayer] Retry failed:', e);
                        }
                      }
                    }}
                  >
                    <Ionicons name="refresh" size={18} color={colors.textOnPrimary} />
                    <Text style={styles.errorButtonText}>Thử lại</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.errorButton}
                  onPress={() => {
                    setVideoError(null);
                    onClose?.();
                  }}
                >
                  <Text style={styles.errorButtonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.processingText}>Đang xử lý...</Text>
          </View>
        )}

        {/* No per-frame correctness feedback in HTTP-only mode */}
      </View>

      {/* Hide controls in landscape (fullscreen) */}
      {!isLandscape && (
        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={32}
              color={colors.primary}
            />
          </TouchableOpacity>

          {/* NEW: Nút Replay */}
          <TouchableOpacity onPress={handleReplay} style={styles.controlButton}>
            <Ionicons name="reload" size={28} color={colors.primary} />
          </TouchableOpacity>

          {/* NEW: Nút Rotate */}
          <TouchableOpacity onPress={handleRotate} style={styles.controlButton}>
            <Ionicons
              name={isLandscape ? "phone-portrait" : "phone-landscape"}
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeHeader: {
    backgroundColor: colors.card,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  repContainer: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  repText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    position: 'relative',
  },
  videoInner: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  processingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  errorBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  errorCodec: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 8,
    marginBottom: 8,
  },
  errorSuggestion: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  errorButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButton: {
    backgroundColor: colors.iconWarning,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: colors.card,
  },
  playButton: {
    padding: 16,
  },
  feedbackContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feedbackCorrect: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  feedbackIncorrect: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  feedbackText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackTextCorrect: {
    color: '#4CAF50',
  },
  feedbackTextIncorrect: {
    color: '#F44336',
  },
  controlButton: {
    padding: 16,
    marginHorizontal: 10,
  },
  tapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  landscapeBackBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 30,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  landscapeCenterBtn: {
    position: 'absolute',
    zIndex: 25,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.45)',
    top: '42%',
  },
});

export default VideoPlayer;