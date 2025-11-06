import React, { useEffect, useRef, useState } from 'react';
import {ScrollView, View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { poseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PoseVisualization from '../components/PoseVisualization';
import VideoPlayer from '../components/VideoPlayer';
import { colors } from '../theme/colors';

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
  const [currentExercise, setCurrentExercise] = useState(route.params?.exerciseName || 'squat');
  const [exerciseTitle, setExerciseTitle] = useState(route.params?.exerciseTitle || 'Squat');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomImageDimensions, setZoomImageDimensions] = useState({ width: 0, height: 0 });
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [realTimeInterval, setRealTimeInterval] = useState(null);
  const isRealTimeModeRef = useRef(false);
  const [repCount, setRepCount] = useState(0);
  const [videoUri, setVideoUri] = useState(null);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const repStateRef = useRef({
    lastPhase: null, // 'up', 'down', 'middle'
    lastCorrectState: false,
    consecutiveCorrectFrames: 0,
  });
  const [detectionStatus, setDetectionStatus] = useState('idle'); // 'idle', 'scanning', 'detected', 'no_person', 'incorrect', 'correct'
  const { user } = useAuth();

  useEffect(() => {
    if (!permission) {
      requestPermission();
      return;
    }
    if (!permission.granted && !permission.canAskAgain) {
      // cannot ask again; user must enable from settings
      // no-op here; UI below will show guidance
    }
  }, [permission]);

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
    };
    
    // Cleanup on unmount
    return () => {
      if (realTimeInterval) {
        clearInterval(realTimeInterval);
      }
    };
  }, [route.params, navigation]);

  const takeAndEvaluate = async () => {
    try {
      if (!cameraRef.current) return;
      setIsProcessing(true);
      setDetectionStatus('scanning');
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8, imageType: 'jpg', skipProcessing: false });
      setPreviewUri(photo.uri);
      const imageBase64 = `data:image/jpeg;base64,${photo.base64}`;
      const resp = await poseAPI.evaluate({
        userId: user?.id,
        exerciseName: currentExercise,
        imageBase64
      });
      
      // Update detection status based on result
      if (resp.data && resp.data.success !== false) {
        if (resp.data.keypoints && resp.data.keypoints.length > 0) {
          if (resp.data.isCorrect) {
            setDetectionStatus('correct');
          } else {
            setDetectionStatus('incorrect');
          }
        } else {
          setDetectionStatus('detected'); // Has result but no keypoints (shouldn't happen)
        }
      } else {
        setDetectionStatus('no_person');
      }
      
      setLastResult(resp.data);
      
      // Update rep count if in real-time mode
      if (isRealTimeMode) {
        updateRepCount(resp.data);
      }
      
      // Get original image dimensions for scaling
      Image.getSize(photo.uri, (width, height) => {
        setOriginalImageDimensions({ width, height });
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
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
      const mime = asset.mimeType || 'image/jpeg';
      const imageBase64 = `data:${mime};base64,${asset.base64}`;
      const resp = await poseAPI.evaluate({
        userId: user?.id,
        exerciseName: currentExercise,
        imageBase64,
      });
      
      // Update detection status based on result
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
      
      setLastResult(resp.data);
      
      // Get original image dimensions for scaling
      Image.getSize(asset.uri, (width, height) => {
        setOriginalImageDimensions({ width, height });
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

  const pickVideoAndEvaluate = async () => {
    try {
      setIsProcessing(true);
      
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện video');
        setIsProcessing(false);
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
      });
      
      if (result.canceled) {
        setIsProcessing(false);
        return;
      }
      
      const asset = result.assets && result.assets[0];
      if (!asset) {
        Alert.alert('Lỗi', 'Không đọc được video đã chọn');
        setIsProcessing(false);
        return;
      }

      // Reset rep count
      setRepCount(0);
      repStateRef.current = {
        lastPhase: null,
        lastCorrectState: false,
        consecutiveCorrectFrames: 0,
      };

      // Set video URI and show video player
      setVideoUri(asset.uri);
      setIsVideoMode(true);
      setIsProcessing(false);
      
    } catch (e) {
      Alert.alert('Lỗi', e?.response?.data?.message || e.message || 'Đã xảy ra lỗi');
      setIsProcessing(false);
    }
  };

  const handleVideoClose = () => {
    setIsVideoMode(false);
    setVideoUri(null);
    setRepCount(0);
    setLastResult(null);
    setDetectionStatus('idle');
  };

  const handleVideoRepCountUpdate = (count) => {
    setRepCount(count);
  };

  const startRealTimeEvaluation = async () => {
    if (!cameraRef.current) {
      Alert.alert('Lỗi', 'Camera chưa sẵn sàng');
      return;
    }

    setIsRealTimeMode(true);
    isRealTimeModeRef.current = true;
    setIsProcessing(false);
    setDetectionStatus('scanning');

    // Capture and evaluate every 1 second for better rep counting accuracy
    const interval = setInterval(async () => {
      try {
        if (!cameraRef.current || !isRealTimeModeRef.current) {
          clearInterval(interval);
          return;
        }

        setDetectionStatus('scanning');
        const photo = await cameraRef.current.takePictureAsync({ 
          base64: true, 
          quality: 0.7, 
          imageType: 'jpg',
          skipProcessing: false 
        });

        if (!photo || !photo.base64) return;

        const imageBase64 = `data:image/jpeg;base64,${photo.base64}`;
        
        // Evaluate in background without blocking UI
        poseAPI.evaluate({
          userId: user?.id,
          exerciseName: currentExercise,
          imageBase64
        })
        .then(resp => {
          // Update detection status based on result
          if (resp.data && resp.data.success !== false) {
            if (resp.data.keypoints && resp.data.keypoints.length > 0) {
              if (resp.data.isCorrect) {
                setDetectionStatus('correct');
              } else {
                setDetectionStatus('incorrect');
              }
            } else {
              // Has response but no keypoints - might be low confidence
              setDetectionStatus('no_person');
              console.log('Response received but no keypoints found');
            }
          } else {
            // Backend returned success: false
            setDetectionStatus('no_person');
            console.log('Backend detection failed:', resp.data?.message || 'Unknown error');
          }
          
          setLastResult(resp.data);
          setPreviewUri(photo.uri);
          Image.getSize(photo.uri, (width, height) => {
            setOriginalImageDimensions({ width, height });
          });
          // Update rep count in real-time mode
          if (isRealTimeModeRef.current) {
            updateRepCount(resp.data);
          }
        })
        .catch(e => {
          // Update status on error
          setDetectionStatus('no_person');
          const errorMessage = e?.response?.data?.message || e.message || 'Unknown error';
          console.log('Real-time evaluation error:', errorMessage);
          console.log('Error details:', {
            status: e?.response?.status,
            data: e?.response?.data,
            stack: e?.stack
          });
        });
      } catch (e) {
        setDetectionStatus('no_person');
        console.log('Real-time capture error:', e.message);
      }
    }, 1000); // Evaluate every 1 second for better accuracy

    setRealTimeInterval(interval);
  };

  const stopRealTimeEvaluation = () => {
    setIsRealTimeMode(false);
    isRealTimeModeRef.current = false;
    setDetectionStatus('idle');
    if (realTimeInterval) {
      clearInterval(realTimeInterval);
      setRealTimeInterval(null);
    }
    // Reset rep state when stopping
    repStateRef.current = {
      lastPhase: null,
      lastCorrectState: false,
      consecutiveCorrectFrames: 0,
    };
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

  // Function to count reps based on exercise type and pose evaluation
  const updateRepCount = (result) => {
    if (!result || !result.angles) return; // Removed isCorrect requirement - we count based on movement, not just perfect form

    const state = repStateRef.current;
    const angles = result.angles;
    let newPhase = null;

    // Determine current phase based on exercise type
    switch (currentExercise) {
      case 'squats':
      case 'squat': {
        const avgKnee = angles.avgKnee || (angles.leftKnee + angles.rightKnee) / 2;
        // Improved logic: down position is when knee angle is small (squatting), up is when standing
        if (avgKnee < 100) {
          newPhase = 'down';
        } else if (avgKnee > 130) {
          newPhase = 'up';
        } else {
          // Keep current phase if in transition zone to avoid false counts
          newPhase = state.lastPhase || 'middle';
        }
        break;
      }
      case 'push-ups': {
        // For push-ups, we can use shoulder position or elbow angle if available
        // Simplified: assume correct pose when isCorrect is true
        if (state.consecutiveCorrectFrames < 3) {
          state.consecutiveCorrectFrames++;
          return;
        }
        // For push-ups, count when transitioning from down to up
        if (state.lastPhase === 'down' && result.isCorrect) {
          newPhase = 'up';
        } else if (!state.lastCorrectState && result.isCorrect) {
          newPhase = 'down';
        }
        break;
      }
      case 'plank': {
        // For plank, count reps based on holding correct position for duration
        // Count 1 rep every 3-5 seconds of correct pose
        if (result.isCorrect) {
          state.consecutiveCorrectFrames++;
          if (state.consecutiveCorrectFrames >= 15) { // ~3 seconds at 2s interval
            setRepCount(prev => prev + 1);
            state.consecutiveCorrectFrames = 0;
          }
        } else {
          state.consecutiveCorrectFrames = 0;
        }
        state.lastCorrectState = result.isCorrect;
        return;
      }
      case 'plank-to-downward-dog': {
        // Count transitions between poses
        if (state.lastCorrectState !== result.isCorrect) {
          if (result.isCorrect) {
            setRepCount(prev => prev + 1);
          }
        }
        state.lastCorrectState = result.isCorrect;
        return;
      }
      case 'jumping-jack': {
        // For jumping jacks, count transitions
        if (state.lastCorrectState !== result.isCorrect && result.isCorrect) {
          setRepCount(prev => prev + 1);
        }
        state.lastCorrectState = result.isCorrect;
        return;
      }
      default:
        return;
    }

    // For squats and push-ups: count when transitioning from down -> up
    // Add debounce: only count if we've been in 'down' phase for at least 1 frame
    if (newPhase === 'up' && state.lastPhase === 'down') {
      // Count rep when we transition from down to up, regardless of isCorrect
      // This allows counting reps even if form isn't perfect
      setRepCount(prev => prev + 1);
      state.consecutiveCorrectFrames = 0;
    } else if (newPhase === 'down') {
      // Track consecutive down frames to ensure valid rep
      state.consecutiveCorrectFrames++;
    } else if (newPhase !== state.lastPhase) {
      // Reset counter when phase changes (but not counting)
      state.consecutiveCorrectFrames = 0;
    }

    state.lastPhase = newPhase;
    state.lastCorrectState = result.isCorrect;
  };

  // Show video player if video is selected
  if (isVideoMode && videoUri) {
    return (
      <VideoPlayer
        videoUri={videoUri}
        exerciseName={currentExercise}
        userId={user?.id}
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.cameraWrap}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
        <View style={styles.switchRow}>
          <TouchableOpacity style={styles.switchBtn} onPress={() => setFacing((p) => (p === 'back' ? 'front' : 'back'))}>
            <Icon name="camera-reverse" size={18} color={colors.iconDefault} />
            <Text style={styles.switchText}>Đổi camera</Text>
          </TouchableOpacity>
        </View>
        
        {/* Detection Status Overlay */}
        {(isRealTimeMode || detectionStatus !== 'idle') && (
          <View style={[
            styles.statusOverlay, 
            { 
              backgroundColor: getStatusInfo().bgColor,
              borderColor: getStatusInfo().color
            }
          ]}>
            <Icon 
              name={getStatusInfo().icon} 
              size={24} 
              color={getStatusInfo().color} 
              style={detectionStatus === 'scanning' ? styles.statusIconPulse : null}
            />
            <Text style={[styles.statusText, { color: getStatusInfo().color }]}>
              {getStatusInfo().text}
            </Text>
            {lastResult && lastResult.score !== undefined && detectionStatus !== 'scanning' && (
              <Text style={[styles.statusScore, { color: getStatusInfo().color }]}>
                Điểm: {Math.round((lastResult.score || 0) * 100)}/100
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {!isRealTimeMode ? (
          <>
            <TouchableOpacity style={[styles.captureBtn, { marginTop: 0 }]} onPress={takeAndEvaluate} disabled={isProcessing}>
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="camera" size={22} color={colors.textOnPrimary} />
                  <Text style={styles.captureText}>Chụp ảnh đánh giá</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.captureBtn, styles.realTimeBtn, { marginTop: 10 }]} 
              onPress={startRealTimeEvaluation} 
              disabled={isProcessing || !permission?.granted}
            >
              <Icon name="videocam" size={22} color={colors.textOnPrimary} />
              <Text style={styles.captureText}>Camera thời gian thực</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.captureBtn, { marginTop: 10, backgroundColor: colors.iconSuccess }]} 
              onPress={pickAndEvaluate} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <>
                  <Icon name="images" size={22} color={colors.textOnPrimary} />
                  <Text style={styles.captureText}>Chọn ảnh từ thư viện</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.captureBtn, { marginTop: 10, backgroundColor: colors.textSecondary }]} 
              onPress={pickVideoAndEvaluate} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <>
                  <Icon name="film" size={22} color={colors.textWhite} />
                  <Text style={[styles.captureText, { color: colors.textWhite }]}>Tải video lên đánh giá</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.captureBtn, styles.stopBtn]} 
            onPress={stopRealTimeEvaluation}
          >
            <Icon name="stop-circle" size={22} color={colors.textWhite} />
            <Text style={[styles.captureText, { color: colors.textWhite }]}>Dừng nhận diện thời gian thực</Text>
          </TouchableOpacity>
        )}
      </View>

      {isRealTimeMode && (
        <View style={styles.realTimeIndicator}>
          <View style={styles.pulseDot} />
          <Text style={styles.realTimeText}>Đang nhận diện tư thế thời gian thực...</Text>
        </View>
      )}

      {/* Rep Counter - Only show in real-time mode or when rep count > 0 */}
      {(isRealTimeMode || repCount > 0) && (
        <View style={styles.repCounterContainer}>
          <View style={styles.repCounterCircle}>
            <Text style={styles.repCounterNumber}>{repCount}</Text>
          </View>
          <Text style={styles.repCounterLabel}>Số lần tập</Text>
        </View>
      )}

      {previewUri && (
        <View style={styles.resultWrap}>
          <TouchableOpacity 
            style={styles.imageContainer}
            activeOpacity={0.9}
            onPress={() => setIsZoomed(true)}
          >
            <Image 
              source={{ uri: previewUri }} 
              style={styles.preview}
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                if (width > 0 && height > 0) {
                  setImageDimensions({ width, height });
                }
              }}
              resizeMode="contain"
            />
            {lastResult && lastResult.keypoints && imageDimensions.width > 0 && (
              <PoseVisualization
                imageWidth={imageDimensions.width}
                imageHeight={imageDimensions.height}
                originalWidth={originalImageDimensions.width}
                originalHeight={originalImageDimensions.height}
                detectedKeypoints={lastResult.keypoints}
                exerciseName={currentExercise}
                showStandard={true}
                showDetected={true}
              />
            )}
            <View style={styles.zoomHint}>
              <Icon name="resize-outline" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          
          {/* Zoom Modal */}
          <Modal
            visible={isZoomed}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsZoomed(false)}
          >
            <View style={styles.zoomContainer}>
              <TouchableOpacity 
                style={styles.zoomCloseBtn}
                onPress={() => setIsZoomed(false)}
              >
                <Icon name="close-circle" size={32} color="#fff" />
              </TouchableOpacity>
              <View style={styles.zoomImageWrapper}>
                <Image 
                  source={{ uri: previewUri }} 
                  style={styles.zoomImage}
                  onLayout={(e) => {
                    const { width, height } = e.nativeEvent.layout;
                    if (width > 0 && height > 0) {
                      setZoomImageDimensions({ width, height });
                    }
                  }}
                  resizeMode="contain"
                />
                {lastResult && lastResult.keypoints && zoomImageDimensions.width > 0 && (
                  <View style={styles.zoomVisualizationContainer}>
                    <PoseVisualization
                      imageWidth={zoomImageDimensions.width}
                      imageHeight={zoomImageDimensions.height}
                      originalWidth={originalImageDimensions.width}
                      originalHeight={originalImageDimensions.height}
                      detectedKeypoints={lastResult.keypoints}
                      exerciseName={currentExercise}
                      showStandard={true}
                      showDetected={true}
                    />
                  </View>
                )}
              </View>
            </View>
          </Modal>
          {lastResult && (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Kết quả</Text>
              <Text style={styles.resultLine}>Đúng tư thế: {lastResult.isCorrect ? 'Có' : 'Không'}</Text>
              <Text style={styles.resultLine}>Điểm: {Math.round((lastResult.score || 0) * 100)} / 100</Text>
              {lastResult.angles && (
                <View style={styles.anglesContainer}>
                  <Text style={styles.anglesTitle}>Góc đo:</Text>
                  {Object.entries(lastResult.angles).map(([key, value]) => (
                    <Text key={key} style={styles.resultLine}>
                      {key}: {Math.round(value)}°
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
          {lastResult && lastResult.keypoints && (
            <View style={styles.legendBox}>
              <Text style={styles.legendTitle}>Chú thích:</Text>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.detected.correct }]} />
                <Text style={styles.legendText}>Keypoint đúng (xanh)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.detected.incorrect }]} />
                <Text style={styles.legendText}>Keypoint sai (đỏ)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.standard.point }]} />
                <Text style={styles.legendText}>Vị trí chuẩn (xanh dương)</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView >
  );
};

const COLORS = {
  detected: {
    correct: '#51CF66',
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
  }
});

export default PoseScreen;


