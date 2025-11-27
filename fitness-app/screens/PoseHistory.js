import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, Dimensions, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { poseAPI, videoAnalysisAPI } from '../services/api';
import * as Asset from 'expo-asset';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import { colors } from '../theme/colors';
import * as jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import PoseAnalyzer from '../components/PoseDetector';
import HistoryTabs from '../components/HistoryTabs';

import PoseOverlay from '../components/PoseOverlay';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

const PoseHistory = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [lastResult, setLastResult] = useState(null);
  const [facing, setFacing] = useState('back');
  const [currentExercise, setCurrentExercise] = useState(route.params?.exerciseName);
  const [exerciseTitle, setExerciseTitle] = useState(route.params?.exerciseTitle || 'Squat');
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [localModelReady, setLocalModelReady] = useState(false);
  const [realTimeInterval, setRealTimeInterval] = useState(null);
  const isRealTimeModeRef = useRef(false);
  const [repCount, setRepCount] = useState(0);
  const [videoUri, setVideoUri] = useState(null);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [lastVideoResult, setLastVideoResult] = useState(null);
  const [videoHistory, setVideoHistory] = useState([]);
  const [imageHistory, setImageHistory] = useState([]);
  const detectorRef = useRef(null);
  const [currentPose, setCurrentPose] = useState(null);
  const analyzerRef = useRef(new PoseAnalyzer(currentExercise));
  const [usePythonScoring, setUsePythonScoring] = useState(false);
  const [showHistory, setShowHistory] = useState(true); // Tab switching: camera or history
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [exerciseMode, setExerciseMode] = useState(route.params?.exerciseMode || 'video'); // 'image' or 'video'
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const repStateRef = useRef({
    lastPhase: null, // 'up', 'down', 'middle'
    lastCorrectState: false,
    consecutiveCorrectFrames: 0,
    // Jumping jack specific state machine
    jumpingJackState: 'waiting_for_closed', // State machine: 'waiting_for_closed' -> 'closed' -> 'spread' -> 'closed' = 1 rep
    phaseStartTime: null,      // Timestamp when current phase started
    lastStablePhase: null,     // Last stable phase (not middle)
    lastRepTime: Date.now(),   // Timestamp of last rep count (for debouncing)
  });
  const [detectionStatus, setDetectionStatus] = useState('idle'); // 'idle', 'scanning', 'detected', 'no_person', 'incorrect', 'correct'
  const { user } = useAuth();
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  // Map app exercise name to PoseRAC exercise name
  const getPoseRACExerciseName = (name) => {
    const exerciseMap = {
      'Half_Moon_Pose': 'Half_Moon_Pose',
      'Butterfly_Pose': 'Butterfly_Pose',
      'Downward_Facing_Dog': 'Downward_Facing_Dog',
      'Dancer_Pose': 'Dancer_Pose',
      'Triangle_Pose': 'Triangle_Pose',
      'Goddess_Pose': 'Goddess_Pose',
      'Warrior_Pose': 'Warrior_Pose',
      'Tree_Pose': 'Tree_Pose',
      'squat': 'squat',
      'squats': 'squat',
      'push-up': 'push_up',
      'push-ups': 'push_up',
      'pull-up': 'pull_up',
      'pull-ups': 'pull_up',
      'front-raise': 'front_raise',
      'bench-pressing': 'bench_pressing',
      'jumping-jack': 'jump_jack',
      'situp': 'situp',
      'sit-ups': 'situp',
      'pommelhorse': 'pommelhorse',

    };
    return exerciseMap[name];
  };

  // Lấy lịch sử video đã xử lý cho bài tập hiện tại
  const fetchVideoHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const poseName = getPoseRACExerciseName(currentExercise);
      const resp = await videoAnalysisAPI.getAnalyses({ exerciseName: poseName, limit: 10 });
      const analyses = resp.data.analyses || [];

      // Lấy URL cho mỗi analysis
      const withUrls = await Promise.all(analyses.map(async (a) => {
        try {
          const url = await videoAnalysisAPI.getVideoUrl(a.id);
          return {
            id: a.id,
            exerciseName: a.exerciseName,
            repCount: a.repetitionCount,
            status: a.status,
            createdAt: a.createdAt,
            videoUrl: url
          };
        } catch (e) {
          return {
            id: a.id,
            exerciseName: a.exerciseName,
            repCount: a.repetitionCount,
            status: a.status,
            createdAt: a.createdAt,
            videoUrl: null
          };
        }
      }));

      setVideoHistory(withUrls);
      setIsHistoryLoading(false);
      return withUrls;
    } catch (error) {
      console.error('[PoseHistory] fetchVideoHistory error:', error.message || error);
      setIsHistoryLoading(false);
      return [];
    }
  };

  // Lấy lịch sử ảnh đã xử lý cho bài tập hiện tại
  const fetchImageHistory = async () => {
    try {
      setIsHistoryLoading(true);
      //console.log('currentExercise', currentExercise);
      const poseName = getPoseRACExerciseName(currentExercise);
      //console.log('poseName', poseName);
      // console.log('user', user);
      const resp = await poseAPI.history({
        user_id: user.id,
        limit: 50,
        type: 'image',
        exerciseName: poseName,
      });

      const images = resp.data.items || [];
      setImageHistory(images);
      setIsHistoryLoading(false);
      return images;
    } catch (error) {
      console.error('[PoseHistory] fetchImageHistory error:', error.message || error);
      setIsHistoryLoading(false);
      return [];
    }
  };

  useEffect(() => {
    // Only request permission once when component mounts
    if (!permission) {
      requestPermission();
    }
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    // Set navigation title
    if (route.params?.exerciseTitle) {
      navigation.setOptions({ title: route.params.exerciseTitle });
    }

    // Reset rep count when exercise changes
    setRepCount(0);
    repStateRef.current = {
      lastPhase: null,
      lastCorrectState: false,
      consecutiveCorrectFrames: 0,
      jumpingJackState: 'waiting_for_closed',
      phaseStartTime: null,
      lastStablePhase: null,
      lastRepTime: Date.now(),
    };

    // Cleanup on unmount
    return () => {
      if (realTimeInterval) {
        clearInterval(realTimeInterval);
      }
    };
  }, [route.params, navigation]);

  // Fetch history when exercise changes - based on mode
  useEffect(() => {
    if (exerciseMode === 'image') {
      fetchImageHistory();
    } else {
      fetchVideoHistory();
    }
  }, [currentExercise, exerciseMode]);

  // Track orientation so we can hide app chrome when showing video fullscreen
  const [isLandscape, setIsLandscape] = useState(Dimensions.get('window').width > Dimensions.get('window').height);
  useEffect(() => {
    const dimListener = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height);
    });

    return () => {
      if (dimListener?.remove) {
        dimListener.remove();
      } else if (typeof dimListener === 'function') {
        dimListener();
      }
    };
  }, []);

  // When a processed video is open and device is landscape, hide nav header and status bar for true fullscreen.
  useEffect(() => {
    if (isVideoMode && isLandscape) {
      navigation.setOptions({ headerShown: false });
      try { StatusBar.setHidden(true); } catch (e) { }
    } else {
      navigation.setOptions({ headerShown: true });
      try { StatusBar.setHidden(false); } catch (e) { }
    }

    return () => {
      navigation.setOptions({ headerShown: true });
      try { StatusBar.setHidden(false); } catch (e) { }
    };
  }, [isVideoMode, isLandscape, navigation]);

  useEffect(() => {
    analyzerRef.current = new PoseAnalyzer(currentExercise);
  }, [currentExercise]);

  useEffect(() => {
    return () => {
      if (detectorRef.current?.dispose) {
        try {
          detectorRef.current.dispose();
        } catch (error) {
          console.warn('[PoseHistory] Error disposing pose detector:', error);
        }
        detectorRef.current = null;
      }
    };
  }, []);

  const handleVideoClose = () => {
    setIsVideoMode(false);
    setVideoUri(null);
    setLastResult(null);
    setDetectionStatus('idle');
  };

  const handleVideoRepCountUpdate = (count) => {
    setRepCount(count);
    setLastVideoResult((prev) => prev ? { ...prev, repCount: count } : prev);
  };

  const handleWatchProcessedVideo = () => {
    if (!lastVideoResult?.uri) return;
    setVideoUri(lastVideoResult.uri);
    setRepCount(lastVideoResult.repCount || 0);
    setIsVideoMode(true);
  };
  const handleDeleteImage = async (imageId) => {
    try {
      await poseAPI.deleteImage(imageId, user?.id);
      setImageModalVisible(false);
      setSelectedImage(null);
      // Refresh history
      fetchImageHistory();
    } catch (error) {
      console.error('Failed to delete image:', error);
      Alert.alert('Lỗi', 'Không thể xóa ảnh. Vui lòng thử lại.');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await videoAnalysisAPI.deleteVideo(videoId);
      // Refresh history
      fetchVideoHistory();
    } catch (error) {
      console.error('Failed to delete video:', error);
      Alert.alert('Lỗi', 'Không thể xóa video. Vui lòng thử lại.');
    }
  };
  // Show video player if video is selected
  if (isVideoMode && videoUri) {
    return (
      <VideoPlayer
        videoUri={videoUri}
        exerciseName={currentExercise}
        user_id={user?.id}
        onRepCountUpdate={handleVideoRepCountUpdate}
        onClose={handleVideoClose}
      />
    );
  }

  if (!permission || !permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Cần quyền truy cập camera</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Cho phép</Text>
        </TouchableOpacity>
        {!permission?.canAskAgain && (
          <Text style={{ marginTop: 10, color: '#666', textAlign: 'center' }}>
            Hãy vào Cài đặt → Ứng dụng → Expo Go → Quyền → Bật Camera
          </Text>
        )}


      </View>
    );
  }
  return (
    <>


      {/* Content: Camera or History */}
      {!showHistory ? (
        <HistoryTabs user={user} exerciseMode={exerciseMode} exerciseName={currentExercise} />
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Rep Counter - Only show in real-time mode or when rep count > 0 */}
          {(isRealTimeMode || repCount > 0) && (
            <View style={styles.repCounterContainer}>
              <View style={styles.repCounterCircle}>
                <Text style={styles.repCounterNumber}>{repCount}</Text>
              </View>
              <Text style={styles.repCounterLabel}>Số lần tập</Text>
            </View>
          )}

          {lastVideoResult?.uri && !isVideoMode && (
            <View style={styles.videoSummaryBox}>
              <View style={styles.videoSummaryHeader}>
                <Icon name="film" size={22} color={colors.primary} />
                <Text style={styles.videoSummaryTitle}>Video vừa xem</Text>
              </View>
              <Text style={styles.videoSummaryLine}>
                Động tác: {String(lastVideoResult.exerciseName || exerciseTitle)}
              </Text>
              <Text style={styles.videoSummaryLine}>
                Số lần lặp lại: {String(lastVideoResult.repCount || 0)}
              </Text>
              <TouchableOpacity
                style={[styles.captureBtn, styles.watchAgainBtn]}
                onPress={handleWatchProcessedVideo}
              >
                <Icon name="play-circle" size={22} color={colors.textOnPrimary} />
                <Text style={styles.captureText}>Xem lại video</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Video history for this exercise */}
          {videoHistory && videoHistory.length > 0 && (
            <View style={[styles.videoSummaryBox, { marginTop: 12 }]}>
              <View style={styles.videoSummaryHeader}>
                <Icon name="time" size={20} color={colors.primary} />
                <Text style={styles.videoSummaryTitle}>Lịch sử video ({videoHistory.length})</Text>
              </View>
              {videoHistory.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  onPress={() => {
                    if (item.videoUrl) {
                      setVideoUri(item.videoUrl);
                      setIsVideoMode(true);
                      setRepCount(item.repCount || 0);
                      setLastVideoResult({ uri: item.videoUrl, repCount: item.repCount, analysisId: item.id, exerciseName: item.exerciseName });
                    } else {
                      Alert.alert('Lỗi', 'Không có URL video');
                    }
                  }}
                  onLongPress={() => {
                    Alert.alert(
                      'Xóa video',
                      'Bạn có chắc muốn xóa video này?',
                      [
                        { text: 'Hủy', style: 'cancel' },
                        {
                          text: 'Xóa',
                          style: 'destructive',
                          onPress: () => handleDeleteVideo(item.id)
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.videoSummaryLine}>Đã xử lý: {String(item.exerciseName || exerciseTitle)}</Text>
                  <Text style={styles.videoSummaryLine}>Số lần: {String(item.repCount || 0)} • {new Date(item.createdAt).toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Image history for this exercise */}
          {imageHistory && imageHistory.length > 0 && (
            <View style={[styles.videoSummaryBox, { marginTop: 12 }]}>
              <View style={styles.videoSummaryHeader}>
                <Icon name="images" size={20} color={colors.primary} />
                <Text style={styles.videoSummaryTitle}>Lịch sử ảnh ({imageHistory.length})</Text>
              </View>
              {imageHistory.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  onPress={() => {
                    setSelectedImage(item);
                    setImageModalVisible(true);
                  }}
                  onLongPress={() => {
                    Alert.alert(
                      'Xóa ảnh',
                      'Bạn có chắc muốn xóa ảnh này?',
                      [
                        { text: 'Hủy', style: 'cancel' },
                        {
                          text: 'Xóa',
                          style: 'destructive',
                          onPress: () => handleDeleteImage(item.id)
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.videoSummaryLine}>
                    Bài tập: {String(item.exerciseName || exerciseTitle)}
                  </Text>
                  <Text style={styles.videoSummaryLine}>
                    Điểm: {Math.round(item.score || 0)}/100 • {item.isCorrect ? '✅' : '❌'} • {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
      {/* Tab Bar */}
      <View style={styles.mainTabBar}>
        <View style={styles.tabBarInner}>
          <TouchableOpacity
            style={[styles.mainTab, showHistory && styles.activeMainTab]}
            onPress={() => setShowHistory(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.tabIconContainer, showHistory && styles.activeTabIconContainer]}>
              <Icon name="barbell" size={22} color={showHistory ? colors.textOnPrimary : colors.textSecondary} />
            </View>
            <Text style={[styles.mainTabText, showHistory && styles.activeMainTabText]}>
              Kết quả bài tập
            </Text>
            {showHistory && <View style={styles.activeIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainTab, !showHistory && styles.activeMainTab]}
            onPress={() => setShowHistory(false)}
            activeOpacity={0.7}
          >
            <View style={[styles.tabIconContainer, !showHistory && styles.activeTabIconContainer]}>
              <Icon name="time" size={22} color={!showHistory ? colors.textOnPrimary : colors.textSecondary} />
            </View>
            <Text style={[styles.mainTabText, !showHistory && styles.activeMainTabText]}>
              Lịch sử
            </Text>
            {!showHistory && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Detail Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết đánh giá</Text>
              <TouchableOpacity onPress={() => setImageModalVisible(false)}>
                <Icon name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedImage && (
              <ScrollView style={styles.modalBody}>
                {/* Exercise Info */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Bài tập</Text>
                  <Text style={styles.infoValue}>{selectedImage.exerciseName}</Text>
                </View>

                {selectedImage.detectedPose && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Phát hiện tự động</Text>
                    <Text style={styles.infoValue}>{selectedImage.detectedPose}</Text>
                  </View>
                )}

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Điểm số</Text>
                  <Text style={[styles.infoValue, { color: selectedImage.isCorrect ? '#4CAF50' : '#F44336' }]}>
                    {Math.round(selectedImage.score || 0)}/100 {selectedImage.isCorrect ? '✅' : '❌'}
                  </Text>
                </View>

                {selectedImage.confidence && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Độ tin cậy</Text>
                    <Text style={styles.infoValue}>{Math.round(selectedImage.confidence * 100)}%</Text>
                  </View>
                )}

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Thời gian</Text>
                  <Text style={styles.infoValue}>{new Date(selectedImage.createdAt).toLocaleString()}</Text>
                </View>

                {/* Feedback */}
                {selectedImage.feedback && Array.isArray(selectedImage.feedback) && selectedImage.feedback.length > 0 && (
                  <View style={styles.feedbackSection}>
                    <Text style={styles.sectionTitle}>Góp ý cải thiện</Text>
                    {selectedImage.feedback.map((item, index) => (
                      <Text key={index} style={styles.feedbackItem}>• {item}</Text>
                    ))}
                  </View>
                )}

                {/* Images */}
                <View style={styles.imagesSection}>
                  <Text style={styles.sectionTitle}>Hình ảnh đánh giá</Text>

                  {selectedImage.resultImageUrl && (
                    <View style={styles.imageContainer}>
                      <Text style={styles.imageLabel}>Kết quả phân tích</Text>
                      <Image
                        source={{ uri: selectedImage.resultImageUrl }}
                        style={styles.modalImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}

                  {selectedImage.referenceImageUrl && (
                    <View style={styles.imageContainer}>
                      <Text style={styles.imageLabel}>Tư thế tham chiếu</Text>
                      <Image
                        source={{ uri: selectedImage.referenceImageUrl }}
                        style={styles.modalImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}

                  {selectedImage.comparisonImageUrl && (
                    <View style={styles.imageContainer}>
                      <Text style={styles.imageLabel}>So sánh</Text>
                      <Image
                        source={{ uri: selectedImage.comparisonImageUrl }}
                        style={styles.modalImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cameraWrap: { height: 360, backgroundColor: colors.black, position: 'relative' },
  camera: { flex: 1 },
  switchRow: { position: 'absolute', right: 12, bottom: 12, zIndex: 10 },
  statusOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    zIndex: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  statusScore: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    opacity: 0.9,
  },
  statusIconPulse: {
    opacity: 0.8,
  },
  switchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  switchText: { color: colors.text, fontWeight: '600', marginLeft: 6 },
  actions: { padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  captureBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  realTimeBtn: { backgroundColor: colors.iconWarning },
  stopBtn: { backgroundColor: colors.iconDanger },
  captureText: { color: colors.textOnPrimary, fontSize: 15, fontWeight: '600', marginLeft: 8 },
  watchAgainBtn: { marginTop: 16 },
  realTimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.iconWarning,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.iconWarning,
    marginRight: 8,
  },
  realTimeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  repCounterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  repCounterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 8,
  },
  repCounterNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  repCounterLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  resultWrap: { padding: 16 },
  imageContainer: { position: 'relative', marginBottom: 12 },
  preview: { width: '100%', height: 220, borderRadius: 16 },
  zoomHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resultBox: { backgroundColor: colors.card, borderRadius: 16, padding: 16, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 12 },
  resultTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: colors.text },
  resultLine: { fontSize: 14, color: colors.text, marginBottom: 4 },
  anglesContainer: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  anglesTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  legendBox: { backgroundColor: colors.card, borderRadius: 16, padding: 16, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  legendTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: colors.text },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  legendDot: { width: 16, height: 16, borderRadius: 8, marginRight: 8 },
  legendText: { fontSize: 13, color: colors.textSecondary },
  videoSummaryBox: { backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  videoSummaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  videoSummaryTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  videoSummaryLine: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionText: { fontSize: 16, color: colors.text, marginBottom: 12 },
  primaryBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  primaryBtnText: { color: colors.textWhite, fontWeight: '700' },
  zoomContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  zoomCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  zoomImageWrapper: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  zoomImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  zoomVisualizationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },

  tabBarInner: {
    flexDirection: 'row',
    gap: 12,
  },

  mainTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    position: 'relative',
    backgroundColor: 'transparent',
    transition: 'all 0.3s ease',
  },

  activeMainTab: {
    backgroundColor: colors.card,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },

  activeTabIconContainer: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    transform: [{ scale: 1.05 }],
  },

  mainTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },

  activeMainTabText: {
    color: colors.text,
    fontWeight: '700',
  },

  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  feedbackSection: {
    marginTop: 8,
  },
  feedbackItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  imagesSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 16,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
});


export default PoseHistory;
