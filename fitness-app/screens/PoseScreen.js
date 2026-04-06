import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, Dimensions, StatusBar, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { poseAPI, videoAnalysisAPI } from '../services/api';
import PoseWebSocket from '../services/poseWebSocket';
import { useAuth } from '../context/AuthContext';
import PoseVisualization from '../components/PoseVisualization';
import VideoPlayer from '../components/VideoPlayer';
import { colors } from '../theme/colors';
import { Buffer } from 'buffer';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import PoseAnalyzer from '../components/PoseDetector';
import HistoryTabs from '../components/HistoryTabs';
import PoseOverlay from '../components/PoseOverlay';
import { LinearGradient } from 'expo-linear-gradient';
function detectMimeFromBase64(b64) {
  if (!b64 || typeof b64 !== 'string') return 'image/jpeg';
  const p = b64.substring(0, 6);
  if (p.startsWith('iVBOR')) return 'image/png';
  if (p.startsWith('/9j/')) return 'image/jpeg';
  return 'image/jpeg';
}
async function convertBase64PngToJpeg(pngBase64) {
  if (!pngBase64 || typeof pngBase64 !== 'string') throw new Error('Invalid base64 input');
  const encodingOption = FileSystem.EncodingType?.Base64 || 'base64';
  const tmpPng = `${FileSystem.cacheDirectory}tmp_png_${Date.now()}.png`;
  try {
    // write png
    await FileSystem.writeAsStringAsync(tmpPng, pngBase64, { encoding: encodingOption });
    const converted = await ImageManipulator.manipulateAsync(
      tmpPng,
      [],
      { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG } // High quality (0.95) to preserve pose details
    );
    const jpegBase64 = await FileSystem.readAsStringAsync(converted.uri, { encoding: encodingOption });
    // cleanup
    FileSystem.deleteAsync(tmpPng, { idempotent: true }).catch(() => { });
    FileSystem.deleteAsync(converted.uri, { idempotent: true }).catch(() => { });
    return jpegBase64;
  } catch (err) {
    // attempt cleanup
    FileSystem.deleteAsync(tmpPng, { idempotent: true }).catch(() => { });
    throw err;
  }
}


if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Component Modal - Định nghĩa bên ngoài để tránh re-create
const EvaluationResultModal = ({ visible, onClose, result }) => {
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison', 'reference', 'result'

  if (!result) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          {/* Header */}
          <View style={modalStyles.header}>
            <Text style={modalStyles.headerTitle}>Kết quả đánh giá</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Icon name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Auto-Detection Banner */}
            {result.detected_pose && (
              <View style={modalStyles.autoDetectBanner}>
                <View style={modalStyles.autoDetectIcon}>
                  <Icon name="scan" size={24} color={colors.primary} />
                </View>
                <View style={modalStyles.autoDetectInfo}>
                  <Text style={modalStyles.autoDetectLabel}>Tự động nhận diện</Text>
                  <Text style={modalStyles.autoDetectPose}>{result.pose_name_vi || result.pose_name}</Text>
                  {result.confidence !== undefined && (
                    <View style={modalStyles.confidenceBadge}>
                      <Icon name="analytics" size={14} color="#666" />
                      <Text style={modalStyles.confidenceValue}>
                        {(result.confidence * 100).toFixed(1)}% tin cậy
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Score Section */}
            <View style={modalStyles.scoreSection}>
              <View style={[modalStyles.scoreCircle, { borderColor: getScoreColor(result.score) }]}>
                <Text style={[modalStyles.scoreText, { color: getScoreColor(result.score) }]}>
                  {result.score}
                </Text>
                <Text style={modalStyles.scoreLabel}>/ 100</Text>
              </View>
              <View style={modalStyles.statusBadge}>
                <Icon
                  name={result.isCorrect ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={result.isCorrect ? "#4CAF50" : "#F44336"}
                />
                <Text style={[
                  modalStyles.statusText,
                  { color: result.isCorrect ? "#4CAF50" : "#F44336" }
                ]}>
                  {result.isCorrect ? "Tư thế đúng" : "Cần cải thiện"}
                </Text>
              </View>
            </View>

            {/* Tab Navigation */}
            <View style={modalStyles.tabContainer}>
              <TouchableOpacity
                style={[modalStyles.tab, activeTab === 'comparison' && modalStyles.activeTab]}
                onPress={() => setActiveTab('comparison')}
              >
                <Icon
                  name="git-compare"
                  size={18}
                  color={activeTab === 'comparison' ? colors.primary : '#888'}
                />
                <Text style={[
                  modalStyles.tabText,
                  activeTab === 'comparison' && modalStyles.activeTabText
                ]}>
                  So sánh
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[modalStyles.tab, activeTab === 'reference' && modalStyles.activeTab]}
                onPress={() => setActiveTab('reference')}
              >
                <Icon
                  name="star"
                  size={18}
                  color={activeTab === 'reference' ? colors.primary : '#888'}
                />
                <Text style={[
                  modalStyles.tabText,
                  activeTab === 'reference' && modalStyles.activeTabText
                ]}>
                  Tư thế mẫu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[modalStyles.tab, activeTab === 'result' && modalStyles.activeTab]}
                onPress={() => setActiveTab('result')}
              >
                <Icon
                  name="person"
                  size={18}
                  color={activeTab === 'result' ? colors.primary : '#888'}
                />
                <Text style={[
                  modalStyles.tabText,
                  activeTab === 'result' && modalStyles.activeTabText
                ]}>
                  Của bạn
                </Text>
              </TouchableOpacity>
            </View>

            {/* Image Display */}
            <View style={modalStyles.imageSection}>
              {activeTab === 'comparison' && result.comparison_image && (
                <View style={modalStyles.imageWrapper}>
                  <Text style={modalStyles.imageLabel}>So sánh tư thế</Text>
                  <Image
                    source={{ uri: result.comparison_image }}
                    style={modalStyles.comparisonImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              {activeTab === 'reference' && result.reference_image && (
                <View style={modalStyles.imageWrapper}>
                  <Text style={modalStyles.imageLabel}>Tư thế chuẩn</Text>
                  <Image
                    source={{ uri: result.reference_image }}
                    style={modalStyles.singleImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              {activeTab === 'result' && result.result_image && (
                <View style={modalStyles.imageWrapper}>
                  <Text style={modalStyles.imageLabel}>Tư thế của bạn</Text>
                  <Image
                    source={{ uri: result.result_image }}
                    style={modalStyles.singleImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>

            {/* Feedback Section - Always show */}
            <View style={modalStyles.feedbackSection}>
              <View style={modalStyles.feedbackHeader}>
                <Icon name="bulb" size={22} color="#FF9800" />
                <Text style={modalStyles.feedbackTitle}>Gợi ý cải thiện</Text>
              </View>
              {result.feedback && result.feedback.length > 0 ? (
                result.feedback.map((item, index) => (
                  <View key={index} style={modalStyles.feedbackItem}>
                    <View style={modalStyles.feedbackBullet} />
                    <Text style={modalStyles.feedbackText}>{item}</Text>
                  </View>
                ))
              ) : (
                <View style={modalStyles.feedbackItem}>
                  <Icon name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={[modalStyles.feedbackText, { marginLeft: 8, color: '#4CAF50', fontWeight: '600' }]}>
                    Tuyệt vời! Tư thế của bạn đã chuẩn!
                  </Text>
                </View>
              )}
            </View>

            {/* Tips Section */}
            {!result.isCorrect && (
              <View style={modalStyles.tipsSection}>
                <Icon name="information-circle" size={20} color={colors.primary} />
                <Text style={modalStyles.tipsText}>
                  Lưu ý: Đứng cách camera 1.5-2m, đảm bảo đủ ánh sáng và toàn thân trong khung hình
                </Text>
              </View>
            )}
          </ScrollView>
          {/* Modals */}
          {/* Footer Actions */}
          <View style={modalStyles.footer}>
            <TouchableOpacity
              style={[modalStyles.footerBtn, modalStyles.tryAgainBtn]}
              onPress={onClose}
            >
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={modalStyles.footerBtnText}>Thử lại</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[modalStyles.footerBtn, modalStyles.continueBtn]}
              onPress={onClose}
            >
              <Icon name="checkmark" size={20} color="#fff" />
              <Text style={modalStyles.footerBtnText}>Tiếp tục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const PoseScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [previewUri, setPreviewUri] = useState(null);
  const [facing, setFacing] = useState('back');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });
  const [currentExercise, setCurrentExercise] = useState(route.params?.exerciseName);
  const [exerciseTitle, setExerciseTitle] = useState(route.params?.exerciseTitle || 'Squat');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomImageDimensions, setZoomImageDimensions] = useState({ width: 0, height: 0 });
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [localModelReady, setLocalModelReady] = useState(false);
  const [realTimeInterval, setRealTimeInterval] = useState(null);
  const isRealTimeModeRef = useRef(false);
  const [repCount, setRepCount] = useState(0);
  const [videoUri, setVideoUri] = useState(null);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [lastVideoResult, setLastVideoResult] = useState(null);
  const [videoHistory, setVideoHistory] = useState([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const detectorRef = useRef(null);
  const detectorInitPromiseRef = useRef(null);
  const [isTfReady, setIsTfReady] = useState(false);
  const [currentPose, setCurrentPose] = useState(null);
  const analyzerRef = useRef(new PoseAnalyzer(currentExercise));
  const lastPreviewUpdateRef = useRef(0);
  const isProcessingFrameRef = useRef(false);
  const lastCaptureTimeRef = useRef(0);
  const [isFrameVisible, setIsFrameVisible] = useState(false);
  const [usePythonScoring, setUsePythonScoring] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // Tab switching: camera or history
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

  useEffect(() => {
    // Only request permission once when component mounts
    if (!permission) {
      requestPermission();
    }
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    // Navigate dynamically
    navigation.setOptions({ 
      headerShown: false,
      header: () => null 
    });

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
          console.warn('[PoseScreen] Error disposing pose detector:', error);
        }
        detectorRef.current = null;
      }
    };
  }, []);

  // Gọi API đánh giá tư thế với hình ảnh chụp từ camera
  const takeAndEvaluate = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert('Lỗi', 'Camera không sẵn sàng');
        return;
      }

      // ✅ Đảm bảo camera đã ready
      if (!isCameraReady) {
        console.warn("Camera chưa sẵn sàng!");
        Alert.alert('Thông báo', 'Vui lòng đợi camera khởi động');
        return;
      }

      setIsProcessing(true);
      setDetectionStatus('scanning');

      // ✅ Đợi camera ổn định (tăng thời gian nếu cần)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // ✅ Thử chụp với cấu hình tốt hơn
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5, // ✅ Tăng quality
        skipProcessing: true, // ✅ Thử skip processing
        exif: false,
        imageType: 'jpg', // ✅ Chỉ định rõ định dạng
      });

      // console.log('📸 Photo captured:', {
      //   uri: photo.uri,
      //   width: photo.width,
      //   height: photo.height,
      //   base64Length: photo.base64?.length,
      //   firstBytes: photo.base64?.substring(0, 20)
      // });

      // ✅ Kiểm tra ảnh hợp lệ
      if (!photo.base64 || photo.base64.length < 1000) {
        throw new Error('Ảnh chụp không hợp lệ hoặc quá nhỏ');
      }

      // ✅ Kiểm tra magic bytes (JPEG phải bắt đầu với /9j/)
      if (!photo.base64.startsWith('/9j/') && !photo.base64.startsWith('iVBOR')) {
        console.error('❌ Invalid image format, first 20 chars:', photo.base64.substring(0, 20));
        throw new Error('Định dạng ảnh không hợp lệ');
      }

      setPreviewUri(photo.uri);

      const imageBase64 = `data:image/jpeg;base64,${photo.base64}`;

      // Call API without exerciseName - auto-detection!
      const resp = await poseAPI.evaluatePose({ imageBase64 });

      //console.log('[PoseScreen] Camera score response:', resp.data);

      // Update detection status based on result
      if (resp.data && resp.data.success) {
        const result = resp.data.result || {};

        if (result.success) {
          if (result.isCorrect) {
            setDetectionStatus('correct');
          } else {
            setDetectionStatus('incorrect');
          }

          // Show result to user with detected pose info
          const score = result.score !== undefined ? Math.round(result.score) : 0;
          const feedback = result.feedback || [];

          setEvaluationResult({
            score,
            feedback,
            isCorrect: result.isCorrect,
            result_image: result.result_image,
            reference_image: result.reference_image,
            comparison_image: result.comparison_image,
            // Auto-detection fields
            detected_pose: result.detected_pose,
            pose_name: result.pose_name,
            pose_name_vi: result.pose_name_vi,
            confidence: result.confidence
          });
          setResultModalVisible(true);

        } else {
          setDetectionStatus('no_person');
          // Optional: Alert if no person detected or other error
        }
      } else {
        setDetectionStatus('no_person');
      }

      setLastResult(resp.data.result);

      // Update rep count if in real-time mode
      if (isRealTimeMode) {
        updateRepCount(resp.data);
      }

      // Get original image dimensions for scaling
      Image.getSize(photo.uri, (width, height) => {
        setOriginalImageDimensions({ width, height });
      }, (error) => {
        console.warn('Failed to get image size:', error);
        // Set default dimensions if getSize fails
        setOriginalImageDimensions({ width: 0, height: 0 });
      });
    } catch (e) {
      setDetectionStatus('no_person');
      const errorMessage = e?.response?.data?.message || e.message || 'Đã xảy ra lỗi';
      console.log('Pick and evaluate error:', errorMessage);
      console.log('Error details:', {
        status: e?.response?.status,
        data: e?.response?.data,
        code: e?.code
      });
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Gọi API đánh giá tư thế với hình ảnh chọn từ thư viện
  const pickAndEvaluate = async () => {
    try {
      setIsProcessing(true);
      setDetectionStatus('scanning');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 0.5,
        base64: true,
        allowsEditing: false,
      });
      if (result.canceled) {
        setDetectionStatus('idle');
        setIsProcessing(false);
        return;
      }
      const asset = result.assets && result.assets[0];
      if (!asset?.base64) {
        Alert.alert('Lỗi', 'Không đọc được ảnh đã chọn');
        setDetectionStatus('idle');
        return;
      }
      setPreviewUri(asset.uri);
      let base64Data;
      try {
        const encodingOption = FileSystem.EncodingType?.Base64 || 'base64';
        base64Data = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: encodingOption,
        });

        console.log('[pickAndEvaluate] Read base64 from file, length:', base64Data.length);

        if (!base64Data || base64Data.length < 100) {
          throw new Error('Base64 data is too short or empty');
        }
      } catch (readError) {
        console.error('[pickAndEvaluate] Failed to read image as base64:', readError);
        Alert.alert('Lỗi', 'Không thể đọc ảnh đã chọn');
        setDetectionStatus('idle');
        setIsProcessing(false);
        return;
      }

      // Determine mime from base64 and convert PNG->JPEG if needed
      let mimeType = detectMimeFromBase64(base64Data) || asset.mimeType || 'image/jpeg';
      try {
        if (mimeType === 'image/png') {
          const converted = await convertBase64PngToJpeg(base64Data);
          base64Data = converted;
          mimeType = 'image/jpeg';
          console.log('[pickAndEvaluate] Converted PNG->JPEG for upload');
        }
      } catch (convErr) {
        console.warn('[pickAndEvaluate] PNG->JPEG conversion failed:', convErr.message || convErr);
      }
      const imageBase64 = `data:${mimeType};base64,${base64Data}`;
      // const resp = await poseAPI.evaluate({
      //   user_id: user?.id,
      //   exerciseName: currentExercise,
      //   imageBase64,
      // });
      const resp = await poseAPI.evaluatePose({ imageBase64 });
      //console.log('[PoseScreen] Evaluation result:', resp.data.success, resp.data.result);

      //console.log('[PoseScreen] Score response:', resp.data);

      // Update detection status based on result
      // resp.data structure from poseScoring.js: { success: true, result: { success: true, score: 85, feedback: [], isCorrect: true } }
      if (resp.data && resp.data.success) {
        const result = resp.data.result || {};
        if (result.success) {
          if (result.isCorrect) {
            setDetectionStatus('correct');
          } else {
            setDetectionStatus('incorrect');
          }

          // Show result to user
          const score = result.score !== undefined ? Math.round(result.score) : 0;
          const feedback = result.feedback || [];

          setEvaluationResult({
            score,
            feedback,
            isCorrect: result.isCorrect,
            result_image: result.result_image,
            reference_image: result.reference_image,
            comparison_image: result.comparison_image,
            // Auto-detection fields
            detected_pose: result.detected_pose,
            pose_name: result.pose_name,
            pose_name_vi: result.pose_name_vi,
            confidence: result.confidence
          });
          console.log('[PoseScreen] Evaluation result:', result.detected_pose, result.pose_name, result.pose_name_vi, result.confidence);
          setResultModalVisible(true);

        } else {
          setDetectionStatus('no_person');
          Alert.alert('Thông báo', result.message || 'Không thể đánh giá tư thế');
        }
      } else {
        setDetectionStatus('no_person');
        Alert.alert('Lỗi', 'Không nhận được phản hồi từ server');
      }

      setLastResult(resp.data.result);

      // Get original image dimensions for scaling
      Image.getSize(asset.uri, (width, height) => {
        setOriginalImageDimensions({ width, height });
      }, (error) => {
        console.warn('Failed to get image size:', error);
        // Set default dimensions if getSize fails
        setOriginalImageDimensions({ width: 0, height: 0 });
      });
    } catch (e) {
      setDetectionStatus('no_person');
      const errorMessage = e?.response?.data?.message || e.message || 'Đã xảy ra lỗi';
      console.log('Pick and evaluate error:', errorMessage);
      console.log('Error details:', {
        status: e?.response?.status,
        data: e?.response?.data,
        code: e?.code
      });
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  // Gọi API đánh giá tư thế với video chọn từ thư viện và xử lý bằng PoseRAC
  const pickVideoAndEvaluate = async () => {
    try {
      setIsProcessing(true);
      setDetectionStatus('scanning');

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện video');
        setIsProcessing(false);
        setDetectionStatus('idle');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: false,
      });

      if (result.canceled) {
        setIsProcessing(false);
        setDetectionStatus('idle');
        return;
      }

      const asset = result.assets && result.assets[0];
      if (!asset) {
        Alert.alert('Lỗi', 'Không đọc được video đã chọn');
        setIsProcessing(false);
        setDetectionStatus('idle');
        return;
      }

      // Map exercise name từ app sang format của PoseRAC
      const exerciseMap = {
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

      const poseRACExerciseName = exerciseMap[currentExercise] || 'squat';

      // Tạo FormData để upload video
      const formData = new FormData();
      formData.append('video', {
        uri: asset.uri,
        type: asset.mimeType || 'video/mp4',
        name: asset.fileName || `video_${Date.now()}.mp4`,
      });

      // Thêm exercise name hint (backend sẽ tự động detect nhưng có thể dùng hint này)
      // formData.append('exerciseName', poseRACExerciseName);

      // Có thể thêm các tham số tùy chọn
      // formData.append('enter_threshold', '0.78');
      // formData.append('exit_threshold', '0.4');

      // Upload và bắt đầu xử lý video
      Alert.alert(
        'Đang xử lý',
        'Video đang được upload và xử lý. Vui lòng đợi...',
        [{ text: 'OK' }]
      );

      const uploadResponse = await videoAnalysisAPI.processVideo(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      });

      const { analysisId } = uploadResponse.data;
      console.log('[PoseScreen] Video uploaded, analysis ID:', analysisId);

      // Poll để check status cho đến khi hoàn thành
      let analysis = null;
      let attempts = 0;
      const maxAttempts = 300; // Tối đa 5 phút (300 * 1 giây)

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Đợi 2 giây giữa mỗi lần check

        try {
          const statusResponse = await videoAnalysisAPI.getAnalysis(analysisId);
          analysis = statusResponse.data.analysis;

          console.log('[PoseScreen] Analysis status:', analysis.status);

          if (analysis.status === 'completed') {
            // Hoàn thành! Hiển thị kết quả
            const repetitions = analysis.repetitionCount || 0;
            setRepCount(repetitions);
            setDetectionStatus('correct');

            // Hiển thị video output từ server
            const videoUrl = await videoAnalysisAPI.getVideoUrl(analysisId);
            setVideoUri(videoUrl);
            setIsVideoMode(true);
            setIsProcessing(false);
            setLastVideoResult({
              uri: videoUrl,
              repCount: repetitions,
              analysisId,
              exerciseName: analysis.exerciseName || poseRACExerciseName,
              completedAt: new Date().toISOString(),
            });

            Alert.alert(
              'Hoàn thành!',
              `Động tác: ${analysis.exerciseName || poseRACExerciseName}\nSố lần lặp lại: ${analysis.repetitionCount || 0}`,
              [{ text: 'Xem video', onPress: () => { } }]
            );
            // Làm mới lịch sử video của bài tập để hiển thị ngay
            try {
              await fetchVideoHistory();
            } catch (e) {
              console.warn('[PoseScreen] Failed to refresh video history:', e.message || e);
            }
            return;
          } else if (analysis.status === 'failed') {
            throw new Error(analysis.errorMessage || 'Xử lý video thất bại');
          }
          // Nếu status là 'processing' hoặc 'pending', tiếp tục poll
        } catch (error) {
          console.error('[PoseScreen] Error checking analysis status:', error);
          if (attempts > 10) { // Sau 10 lần thử, báo lỗi
            throw error;
          }
        }

        attempts++;
      }

      // Timeout sau 5 phút
      throw new Error('Xử lý video mất quá nhiều thời gian. Vui lòng thử lại.');

    } catch (e) {
      const errorMessage = e?.response?.data?.message || e.message || 'Đã xảy ra lỗi khi xử lý video';
      console.error('[PoseScreen] Video processing error:', errorMessage);
      Alert.alert('Lỗi', errorMessage);
      setDetectionStatus('idle');
      setIsProcessing(false);
    }
  };

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
  // Nhấn icon play để bắt đầu nhận diện tư thế thời gian thực
  const startRealTimeEvaluation = async () => {
    if (!cameraRef.current) {
      Alert.alert('Lỗi', 'Camera chưa sẵn sàng');
      return;
    }

    try {
      setIsProcessing(true);
      // Kết nối WebSocket và khởi tạo session
      await PoseWebSocket.connect();
      PoseWebSocket.startSession(currentExercise);
    } catch (error) {
      console.error('[PoseScreen] Unable to start real-time (WS):', error);
      const message = error?.message || 'Không thể kết nối realtime socket. Vui lòng thử lại.';
      Alert.alert('Lỗi', message);
      setDetectionStatus('idle');
      setIsProcessing(false);
      return;
    }

    analyzerRef.current?.reset?.();
    setIsRealTimeMode(true);
    isRealTimeModeRef.current = true;
    setIsProcessing(false);
    setDetectionStatus('scanning');
    setCurrentPose(null);
    isProcessingFrameRef.current = false;
    lastCaptureTimeRef.current = 0;

    // Hàm capture frame và gửi lên server
    const captureFrame = async () => {
      if (isProcessingFrameRef.current || !cameraRef.current || !isRealTimeModeRef.current) return;

      isProcessingFrameRef.current = true;
      setDetectionStatus('scanning');

      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.3,
          imageType: 'jpg',
          skipProcessing: false
        });

        if (!photo?.base64) {
          if (isRealTimeModeRef.current) {
            setDetectionStatus('no_person');
            setCurrentPose(null);
          }
          return;
        }

        let detectedMime = detectMimeFromBase64(photo.base64);
        let uploadBase64 = photo.base64;

        if (detectedMime === 'image/png') {
          try {
            const converted = await convertBase64PngToJpeg(photo.base64);
            uploadBase64 = converted;
            detectedMime = 'image/jpeg';
          } catch (convErr) {
            console.warn('[captureFrame] PNG->JPEG conversion failed:', convErr.message || convErr);
          }
        }

        const imageBase64 = `data:${detectedMime};base64,${uploadBase64}`;

        // Decide whether to use Python scorer (HTTP) or WebSocket evaluator
        let wsResult = null;
        // if (usePythonScoring) {

        // } else {
        wsResult = await PoseWebSocket.evaluateFrame({
          user_id: user?.id,
          exerciseName: currentExercise,
          imageBase64,
        });
        // }

        // Xử lý kết quả server
        if (!wsResult || wsResult.success === false) {
          if (isRealTimeModeRef.current) {
            setDetectionStatus('no_person');
            setCurrentPose(null);
          }
          return;
        }

        if (isRealTimeModeRef.current) {
          if (wsResult.keypoints?.length) {
            setDetectionStatus(wsResult.isCorrect ? 'correct' : 'incorrect');
          } else {
            setDetectionStatus('no_person');
          }
        }

        const poseForOverlay = wsResult.keypoints?.length
          ? { keypoints: wsResult.keypoints, imageWidth: 600, imageHeight: 900 }
          : null;
        setCurrentPose(poseForOverlay);
        setLastResult(wsResult);

        // Giới hạn cập nhật preview
        const now = Date.now();
        if (now - lastPreviewUpdateRef.current > 800) {
          setPreviewUri(photo.uri);
          Image.getSize(photo.uri, (width, height) => {
            setOriginalImageDimensions({ width, height });
          }, () => { });
          lastPreviewUpdateRef.current = now;
        }

        // Cập nhật số rep nếu cần
        if (isRealTimeModeRef.current) {
          updateRepCount(wsResult);
        }

      } catch (e) {
        console.log('Real-time capture error:', e?.message || e);
        if (isRealTimeModeRef.current) {
          setDetectionStatus('no_person');
          setCurrentPose(null);
        }
      } finally {
        isProcessingFrameRef.current = false;
      }
    };

    // Bắt đầu vòng lặp frame
    captureFrame();
    const interval = setInterval(() => {
      if (!isRealTimeModeRef.current) {
        clearInterval(interval);
        return;
      }
      captureFrame();
    }, 100);

    setRealTimeInterval(interval);
  };

  // Nhấn icon stop để dừng nhận diện tư thế thời gian thực
  const stopRealTimeEvaluation = () => {
    setIsRealTimeMode(false);
    isRealTimeModeRef.current = false;
    setDetectionStatus('idle');
    if (realTimeInterval) {
      clearInterval(realTimeInterval);
      setRealTimeInterval(null);
    }
    setCurrentPose(null);
    lastPreviewUpdateRef.current = 0;
    isProcessingFrameRef.current = false;
    lastCaptureTimeRef.current = 0;
    // 停止后端会话并断开 socket
    try {
      PoseWebSocket.stopSession(currentExercise);
    } catch { }
    try {
      PoseWebSocket.disconnect();
    } catch { }
    // Reset rep state when stopping
    repStateRef.current = {
      lastPhase: null,
      lastCorrectState: false,
      consecutiveCorrectFrames: 0,
      jumpingJackState: 'waiting_for_closed',
      phaseStartTime: null,
      lastStablePhase: null,
      lastRepTime: Date.now(),
    };
    analyzerRef.current?.reset?.();
  };

  // Get status information for display
  const getStatusInfo = () => {
    switch (detectionStatus) {
      case 'scanning':
        return {
          text: 'Đang quét...',
          color: '#FFA500',
          icon: 'scan-circle',
          bgColor: 'rgba(255, 165, 0, 0.2)'
        };
      case 'correct':
        return {
          text: '✓ Tư thế đúng',
          color: '#10B981',
          icon: 'checkmark-circle',
          bgColor: 'rgba(16, 185, 129, 0.2)'
        };
      case 'incorrect':
        return {
          text: '✗ Tư thế sai',
          color: '#EF4444',
          icon: 'close-circle',
          bgColor: 'rgba(239, 68, 68, 0.2)'
        };
      case 'no_person':
        return {
          text: 'Không phát hiện người',
          color: '#6B7280',
          icon: 'person-outline',
          bgColor: 'rgba(107, 114, 128, 0.2)'
        };
      case 'detected':
        return {
          text: 'Đã phát hiện',
          color: '#3B82F6',
          icon: 'person',
          bgColor: 'rgba(59, 130, 246, 0.2)'
        };
      default:
        return {
          text: 'Chưa bắt đầu',
          color: '#9CA3AF',
          icon: 'ellipse-outline',
          bgColor: 'rgba(156, 163, 175, 0.1)'
        };
    }
  };

  // Function to update rep count using backend-provided value
  const updateRepCount = (result) => {
    if (!result) return;

    // Prefer backend-provided repCount when available
    if (typeof result.repCount === 'number') {
      setRepCount(result.repCount);
      setLastResult(prev => prev ? { ...prev, repCount: result.repCount } : prev);
      return;
    }

    // If backend didn't provide repCount, do nothing (we rely on server-side counting)
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
    <View style={{ flex: 1, backgroundColor: '#020617', overflow: 'hidden' }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background Camera & Layers */}
      <View style={StyleSheet.absoluteFillObject}>
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          onCameraReady={() => {
            setIsCameraReady(true);
            setTimeout(() => setIsFrameVisible(true), 2500);
          }}
        />
        {/* Design Gradient Overlays from Snippet */}
        <LinearGradient
          colors={['rgba(2, 6, 23, 0.60)', 'rgba(2, 6, 23, 0)', 'rgba(2, 6, 23, 0.90)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      </View>

        {/* Custom Header overlaying Camera - Strictly from design snippet */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 ,}}>
          {/* Gradient Header Layer */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.40)', 'rgba(0, 0, 0, 0)']}
            style={{ width: '100%', height: 100, position: 'absolute' }}
          />
          {/* Solid Header Layer (Matched to design snippet) */}
          <View style={{ width: '100%', height: 100, backgroundColor: '#F6F2F7', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 50 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ position: 'absolute', left: 16, top: 40, marginTop: 20 }}
            >
              <Icon name="chevron-back" size={28} color="black" />
            </TouchableOpacity>
  
            <Text style={{ color: '#F97316', fontSize: 22, fontWeight: '800', marginTop: 10 }}>
              {exerciseTitle}
            </Text>
  
            <TouchableOpacity
              onPress={() => Alert.alert('History', 'History feature triggered')}
              style={{ position: 'absolute', right: 16, top: 40, padding: 6, backgroundColor: '#000', borderRadius: 20, marginTop: 20 }}
            >
              <Icon name="time" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

      {/* Pose Overlay */}
      {isRealTimeMode && currentPose?.keypoints?.length > 0 && (
        <View style={[StyleSheet.absoluteFillObject, { zIndex: 10 }]}>
          <PoseOverlay
            pose={currentPose}
            containerWidth={Dimensions.get('window').width}
            containerHeight={Dimensions.get('window').height}
            flipHorizontal={facing === 'front'}
          />
        </View>
      )}

      {/* Main Interface Content - Exact coordinates from snippet */}
      <View style={{ flex: 1, paddingTop: 96, paddingHorizontal: 24, zIndex: 20, justifyContent: 'space-between', paddingBottom: 60 }}>

        {/* Switch Camera Button Top Center */}
        <TouchableOpacity
          style={{
            alignSelf: 'center',
            backgroundColor: 'rgba(15, 15, 15, 0.70)', paddingHorizontal: 20, paddingVertical: 10,
            borderRadius: 9999, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.10)',
            flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20
          }}
          onPress={() => setFacing(p => (p === 'back' ? 'front' : 'back'))}
        >
          <Icon name="camera-reverse" size={16} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 }}>Switch camera</Text>
        </TouchableOpacity>

        {/* Scan Tracker Middle */}
        <View style={{ alignSelf: 'stretch', alignItems: 'center', marginBottom: 20 }}>
          <View style={{
            width: 256, height: 256, borderRadius: 48,
            borderWidth: 2, borderColor: 'rgba(168, 57, 13, 0.30)',
            justifyContent: 'center', alignItems: 'center',
          }}>
            <View style={{ position: 'absolute', top: -2, left: -2, width: 32, height: 32, borderTopLeftRadius: 32, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#A8390D' }} />
            <View style={{ position: 'absolute', top: -2, right: -2, width: 32, height: 32, borderTopRightRadius: 32, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#A8390D' }} />
            <View style={{ position: 'absolute', bottom: -2, left: -2, width: 32, height: 32, borderBottomLeftRadius: 32, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#A8390D' }} />
            <View style={{ position: 'absolute', bottom: -2, right: -2, width: 32, height: 32, borderBottomRightRadius: 32, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#A8390D' }} />

            <View style={{ alignItems: 'center' }}>
              <Icon name="scan" size={40} color="#A8390D" />
              <Text style={{ color: '#FFDBD0', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', letterSpacing: 2, marginTop: 8 }}>
                {isRealTimeMode ? 'Scanning Active' : 'Ready to Scan'}
              </Text>
            </View>
          </View>

          {/* Local Status Message */}
          {(detectionStatus !== 'idle') && (
            <View style={{ marginTop: 16, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusInfo().color, marginRight: 8 }} />
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{getStatusInfo().text}</Text>
            </View>
          )}
        </View>

        {/* Bottom Controls Group */}
        <View style={{ width: '100%', gap: 12 }}>
          {!isRealTimeMode ? (
            <>
              <TouchableOpacity
                style={{ backgroundColor: '#FF7849', borderRadius: 32, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 5 }}
                onPress={takeAndEvaluate} disabled={isProcessing}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 8, borderRadius: 999 }}>
                    {isProcessing ? <ActivityIndicator color="#fff" size="small" /> : <Icon name="camera" size={20} color="#fff" />}
                  </View>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Take Photo for Analysis</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: '#F59E0B', borderRadius: 32, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4 }}
                onPress={startRealTimeEvaluation} disabled={isProcessing || !permission?.granted}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 8, borderRadius: 999 }}>
                    <Icon name="videocam" size={20} color="#fff" />
                  </View>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Real-time Camera</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: '#22C55E', borderRadius: 32, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4 }}
                onPress={pickAndEvaluate} disabled={isProcessing}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 8, borderRadius: 999 }}>
                    <Icon name="images" size={20} color="#fff" />
                  </View>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Choose from Gallery</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: 'rgba(156, 163, 175, 0.60)', borderRadius: 32, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                onPress={pickVideoAndEvaluate} disabled={isProcessing}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, opacity: 0.6 }}>
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 8, borderRadius: 999 }}>
                    <Icon name="film" size={20} color="#fff" />
                  </View>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Upload Video for Analysis</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={{ backgroundColor: '#EF4444', borderRadius: 32, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 10 }}
              onPress={stopRealTimeEvaluation}
            >
              <Icon name="stop-circle" size={24} color="#fff" style={{ marginRight: 12 }} />
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>STOP SESSION</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Rep Counter Overlay Top Right */}
      {(isRealTimeMode || repCount > 0) && (
        <View style={{
          position: 'absolute', right: 20, top: 100,
          backgroundColor: 'rgba(168, 57, 13, 0.85)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24,
          alignItems: 'center', minWidth: 80, zIndex: 30, elevation: 5
        }}>
          <Text style={{ color: '#FFDBD0', fontSize: 12, fontWeight: '800' }}>REPS</Text>
          <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900', lineHeight: 44 }}>{repCount}</Text>
        </View>
      )}

      {/* Evaluation Results Modal */}
      <EvaluationResultModal
        visible={resultModalVisible}
        onClose={() => setResultModalVisible(false)}
        result={evaluationResult}
      />
    </View>
  );
};

const COLORS = {
  detected: {
    correct: '#51CF250',
    incorrect: '#FF6B6B',
  },
  standard: {
    point: '#4ECDC4',
  },
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

// Styles cho Modal
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  // Tab Bar Styles
  mainTabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeMainTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeMainTabText: {
    color: colors.primary,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: Dimensions.get('window').height * 0.9,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    padding: 4,
  },
  // Auto-detection banner styles
  autoDetectBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0F7FF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  autoDetectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  autoDetectInfo: {
    flex: 1,
  },
  autoDetectLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  autoDetectPose: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceValue: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f8f9fa',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.primary + '15',
  },
  tabText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  imageSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    minHeight: 300,
  },
  imageWrapper: {
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  comparisonImage: {
    width: '100%',
    height: 350,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  singleImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  feedbackSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 4,
  },
  feedbackBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9800',
    marginTop: 6,
    marginRight: 10,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  tipsSection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    gap: 10,
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    gap: 12,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  tryAgainBtn: {
    backgroundColor: '#FF9800',
  },
  continueBtn: {
    backgroundColor: colors.primary,
  },
  footerBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

});

export default PoseScreen;
