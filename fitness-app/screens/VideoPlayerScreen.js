import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
  const { exercise } = route.params;

  const videoSource =
    exercise?.videoUrl ||
    'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';

  const [showControls, setShowControls] = useState(true);

  // ✅ Player
  const player = useVideoPlayer(videoSource);

  // ✅ Listen realtime state (QUAN TRỌNG: Cần lắng nghe từng sự kiện riêng lẻ)
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const { playing } = useEvent(player, 'playingChange', { playing: player.playing });
  const { currentTime } = useEvent(player, 'timeUpdate', { currentTime: player.currentTime });
  const { duration } = useEvent(player, 'durationChange', { duration: player.duration });

  const isPlaying = playing;
  const playerStatus = status;

  const controlsTimer = useRef(null);

  // ✅ Auto hide controls logic
  const startControlsTimer = () => {
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    controlsTimer.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    if (showControls && isPlaying) {
      startControlsTimer();
    }
    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, [showControls, isPlaying]);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // ✅ Auto play
  useEffect(() => {
    player.loop = true;
    player.play();
  }, [player]);

  // ✅ Play / Pause
  const togglePlayback = () => {
    startControlsTimer(); // Reset timer on interaction
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  // ✅ Seek
  const seek = (seconds) => {
    startControlsTimer(); // Reset timer on interaction
    player.seekBy(seconds);
  };

  // ✅ Time remaining fix
  const remaining = duration > 0 ? duration - currentTime : 0;

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <VideoView
        style={styles.video}
        player={player}
        nativeControls={false}
      />

      {/* Loading */}
      {playerStatus === 'loading' && (
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        </View>
      )}

      {/* Overlay */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={toggleControls}
      >
        {showControls && (
          <>
            {/* HEADER */}
            <SafeAreaView style={styles.header}>
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.brandTitle}>FITLIFE</Text>
                  <Text style={styles.exerciseTitle}>
                    {exercise?.name?.toUpperCase() || 'EXERCISE'}
                  </Text>
                </View>

                <View style={styles.roundBadge}>
                  <Text style={styles.roundText}>ROUND{'\n'}1/1</Text>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => navigation.goBack()}
                >
                  <Icon name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            {/* CENTER BUTTON */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                style={styles.playPauseBtn}
                onPress={togglePlayback}
              >
                <Icon
                  name={isPlaying ? 'pause' : 'play'}
                  size={64}
                  color="#FFFFFF"
                  style={!isPlaying && { marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>

            {/* BOTTOM */}
            <View style={styles.bottomControls}>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.bottomGradient}
              >
                {/* PROGRESS */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${duration > 0
                            ? (currentTime / duration) * 100
                            : 0
                            }%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* CONTROLS */}
                <View style={styles.controlsRow}>
                  <View style={styles.timeInfo}>
                    <Text style={styles.timeLabel}>TIME REMAINING</Text>
                    <Text style={styles.timeValue}>
                      {formatTime(remaining)}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => seek(-10)}
                      style={styles.seekBtn}
                    >
                      <MaterialCommunityIcons
                        name="rewind-10"
                        size={32}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => seek(30)}
                      style={[styles.seekBtn, { marginLeft: 20 }]}
                    >
                      <MaterialCommunityIcons
                        name="fast-forward-30"
                        size={32}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.volumeContainer}>
                    <Icon
                      name="volume-medium-outline"
                      size={24}
                      color="#FFFFFF"
                    />
                    <View style={styles.volumeTrack}>
                      <View style={styles.volumeLevel} />
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ✅ Format time
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F10' },
  video: { width: '100%', height: '100%' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },

  header: { paddingTop: 10 },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },

  brandTitle: {
    color: '#FF6B35',
    fontSize: 24,
    fontWeight: '900',
  },

  exerciseTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
    maxWidth: width * 0.6,
  },

  roundBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 20,
  },

  roundText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },

  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerControls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  playPauseBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomControls: {
    height: 180,
    justifyContent: 'flex-end',
  },

  bottomGradient: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  progressContainer: {
    height: 4,
    marginBottom: 25,
  },

  progressBarBg: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
  },

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeInfo: { flex: 1 },

  timeLabel: {
    color: '#AAAAAA',
    fontSize: 10,
  },

  timeValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },

  actionButtons: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },

  seekBtn: { padding: 5 },

  volumeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  volumeTrack: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginLeft: 10,
  },

  volumeLevel: {
    width: '70%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoPlayerScreen;