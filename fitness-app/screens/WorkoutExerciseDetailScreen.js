import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons as Icon } from '@expo/vector-icons';
import colors from '../theme/colors';
import { styles } from './styles/WorkoutExerciseDetailScreen.styles';
import { workoutAPI } from '../services/api';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

const WorkoutExerciseDetailScreen = ({ route, navigation }) => {
  const { exercise, workoutExercise, dayExerciseId } = route.params;
  // workoutExercise contains: sets, reps, duration, restSeconds, weight, notes
  // dayExerciseId is the ID from workout_plan_day_exercises table

  const [activeTab, setActiveTab] = useState('instructions');
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  // Animation for timer
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Create video player instance only if videoUrl exists
  const player = exercise.videoUrl
    ? useVideoPlayer(exercise.videoUrl, player => {
      player.loop = true;
    })
    : null;

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const startRestTimer = () => {
    const restSeconds = workoutExercise.restSeconds || 60;
    setRestTimeLeft(restSeconds);
    setIsResting(true);

    const interval = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResting(false);
          setTimerInterval(null);
          // Play completion sound or vibration here
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopRestTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsResting(false);
    setRestTimeLeft(0);
    scaleAnim.setValue(1);
  };

  const handleCompleteSet = () => {
    const newCompletedSets = [...completedSets, currentSet];
    setCompletedSets(newCompletedSets);

    const totalSets = workoutExercise.sets || 3;

    if (currentSet < totalSets) {
      // Start rest timer
      startRestTimer();
      setCurrentSet(currentSet + 1);
    } else {
      // All sets completed
      // You can navigate back or show completion message
    }
  };

  const handleSkipRest = () => {
    stopRestTimer();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return colors.iconSuccess;
      case 'intermediate':
        return colors.iconWarning;
      case 'advanced':
        return colors.iconDanger;
      default:
        return colors.textSecondary;
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung bình';
      case 'advanced':
        return 'Nâng cao';
      default:
        return difficulty;
    }
  };

  // Use actual values from database, no defaults
  const totalSets = workoutExercise.sets || 0;
  const reps = workoutExercise.reps || '';
  const weight = workoutExercise.weight;
  const duration = workoutExercise.duration || 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Bài tập</Text>

        <TouchableOpacity style={styles.headerButton}>
          <Icon name="heart-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Video */}
        <View style={styles.videoContainer}>
          {exercise.videoUrl && player ? (
            <VideoView
              player={player}
              style={styles.exerciseVideo}
              contentFit="contain"
              nativeControls
            />
          ) : exercise.imageUrl ? (
            <Image
              source={{ uri: exercise.imageUrl }}
              style={styles.exerciseVideo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Icon name="videocam-outline" size={80} color={colors.textSecondary} />
              <Text style={styles.placeholderText}>Chưa có video hướng dẫn</Text>
            </View>
          )}
        </View>

        {/* Exercise Info */}
        <View style={styles.infoSection}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>

          {exercise.description && (
            <Text style={styles.exerciseDescription}>{exercise.description}</Text>
          )}

          {/* Workout Plan Info */}
          <View style={styles.workoutInfoContainer}>
            <View style={styles.workoutInfoRow}>
              {/* Show Sets if exercise has sets */}
              {workoutExercise.sets && workoutExercise.sets > 0 && (
                <View style={styles.workoutInfoItem}>
                  <Icon name="repeat-outline" size={24} color={colors.primary} />
                  <Text style={styles.workoutInfoLabel}>Sets</Text>
                  <Text style={styles.workoutInfoValue}>{totalSets}</Text>
                </View>
              )}

              {/* Show Reps if exercise has reps */}
              {workoutExercise.reps && (
                <View style={styles.workoutInfoItem}>
                  <Icon name="fitness-outline" size={24} color={colors.primary} />
                  <Text style={styles.workoutInfoLabel}>Reps</Text>
                  <Text style={styles.workoutInfoValue}>{reps}</Text>
                </View>
              )}

              {/* Show Duration if exercise has duration */}
              {workoutExercise.duration && workoutExercise.duration > 0 && (
                <View style={styles.workoutInfoItem}>
                  <Icon name="timer-outline" size={24} color={colors.primary} />
                  <Text style={styles.workoutInfoLabel}>Thời gian</Text>
                  <Text style={styles.workoutInfoValue}>{workoutExercise.duration}s</Text>
                </View>
              )}

              {/* Show Weight if exists */}
              {weight && (
                <View style={styles.workoutInfoItem}>
                  <Icon name="barbell-outline" size={24} color={colors.primary} />
                  <Text style={styles.workoutInfoLabel}>Tải</Text>
                  <Text style={styles.workoutInfoValue}>{weight}kg</Text>
                </View>
              )}

              {/* Show Rest time if exists */}
              {workoutExercise.restSeconds && (
                <View style={styles.workoutInfoItem}>
                  <Icon name="time-outline" size={24} color={colors.primary} />
                  <Text style={styles.workoutInfoLabel}>Nghỉ</Text>
                  <Text style={styles.workoutInfoValue}>{workoutExercise.restSeconds}s</Text>
                </View>
              )}
            </View>
          </View>


          {/* Set Progress - Only show for exercises with sets (strength training) */}
          {workoutExercise.sets && workoutExercise.sets > 0 && (
            <View style={styles.setProgressContainer}>
              <Text style={styles.setProgressTitle}>Tiến độ Sets</Text>
              <View style={styles.setProgressRow}>
                {Array.from({ length: totalSets }, (_, i) => i + 1).map((setNum) => (
                  <View
                    key={setNum}
                    style={[
                      styles.setIndicator,
                      completedSets.includes(setNum) && styles.setIndicatorCompleted,
                      currentSet === setNum && !completedSets.includes(setNum) && styles.setIndicatorActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.setIndicatorText,
                        completedSets.includes(setNum) && styles.setIndicatorTextCompleted,
                        currentSet === setNum && !completedSets.includes(setNum) && styles.setIndicatorTextActive,
                      ]}
                    >
                      {setNum}
                    </Text>
                    {completedSets.includes(setNum) && (
                      <Icon name="checkmark-circle" size={16} color={colors.success} style={styles.setCheckmark} />
                    )}
                  </View>
                ))}
              </View>
              <Text style={styles.setProgressSubtitle}>
                Set {currentSet} / {totalSets}
              </Text>
            </View>
          )}

          {/* Workout Notes */}
          {workoutExercise.notes && (
            <View style={styles.workoutNotes}>
              <Icon name="information-circle" size={20} color={colors.iconWarning} />
              <Text style={styles.workoutNotesText}>{workoutExercise.notes}</Text>
            </View>
          )}

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            {exercise.difficulty && (
              <View style={styles.statItem}>
                <Icon
                  name="speedometer-outline"
                  size={20}
                  color={getDifficultyColor(exercise.difficulty)}
                />
                <Text style={[styles.statLabel, { color: getDifficultyColor(exercise.difficulty) }]}>
                  {getDifficultyLabel(exercise.difficulty)}
                </Text>
              </View>
            )}

            {exercise.equipment && Array.isArray(exercise.equipment) && exercise.equipment.length > 0 && (
              <View style={styles.statItem}>
                <Icon name="barbell-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.statLabel}>
                  {exercise.equipment.join(', ')}
                </Text>
              </View>
            )}
          </View>

          {/* Muscle Groups */}
          {exercise.muscleGroups && Array.isArray(exercise.muscleGroups) && exercise.muscleGroups.length > 0 && (
            <View style={styles.muscleSection}>
              <Text style={styles.sectionTitle}>Nhóm cơ</Text>
              <View style={styles.muscleTagsContainer}>
                {exercise.muscleGroups.map((muscle, index) => (
                  <View key={index} style={styles.muscleTag}>
                    <Text style={styles.muscleTagText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'instructions' && styles.activeTab]}
            onPress={() => setActiveTab('instructions')}
          >
            <Text style={[styles.tabText, activeTab === 'instructions' && styles.activeTabText]}>
              Hướng dẫn
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tips' && styles.activeTab]}
            onPress={() => setActiveTab('tips')}
          >
            <Text style={[styles.tabText, activeTab === 'tips' && styles.activeTabText]}>
              Lưu ý
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'instructions' && (
            <View>
              {exercise.instructions && Array.isArray(exercise.instructions) && exercise.instructions.length > 0 ? (
                exercise.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Chưa có hướng dẫn chi tiết</Text>
              )}
            </View>
          )}

          {activeTab === 'tips' && (
            <View>
              {exercise.tips && Array.isArray(exercise.tips) && exercise.tips.length > 0 ? (
                exercise.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Icon name="checkmark-circle" size={20} color={colors.iconSuccess} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Chưa có lưu ý nào</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Complete Set Button */}
      <View style={styles.bottomContainer}>
        {/* For exercises WITH sets (strength training) */}
        {workoutExercise.sets && workoutExercise.sets > 0 ? (
          completedSets.length < totalSets ? (
            <TouchableOpacity
              style={styles.completeSetButton}
              onPress={handleCompleteSet}
              disabled={isResting}
            >
              <Icon name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.completeSetButtonText}>
                Hoàn thành Set {currentSet}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.completeSetButton, styles.allSetsCompleteButton]}
              onPress={async () => {
                try {
                  // Mark exercise as completed in database
                  if (dayExerciseId) {
                    await workoutAPI.completeExercise(dayExerciseId);
                    Alert.alert('Hoàn thành!', 'Bài tập đã được đánh dấu hoàn thành.');
                  }
                  navigation.goBack();
                } catch (error) {
                  console.error('Error completing exercise:', error);
                  Alert.alert('Lỗi', 'Không thể lưu tiến độ. Vui lòng thử lại.');
                  navigation.goBack();
                }
              }}
            >
              <Icon name="checkmark-done-circle" size={24} color="#fff" />
              <Text style={styles.completeSetButtonText}>
                Hoàn thành tất cả! Quay lại
              </Text>
            </TouchableOpacity>
          )
        ) : (
          /* For exercises WITHOUT sets (cardio, yoga, etc.) - just complete button */
          <TouchableOpacity
            style={[styles.completeSetButton, styles.allSetsCompleteButton]}
            onPress={async () => {
              try {
                // Mark exercise as completed in database
                if (dayExerciseId) {
                  await workoutAPI.completeExercise(dayExerciseId);
                  Alert.alert('Hoàn thành!', 'Bài tập đã được đánh dấu hoàn thành.');
                }
                navigation.goBack();
              } catch (error) {
                console.error('Error completing exercise:', error);
                Alert.alert('Lỗi', 'Không thể lưu tiến độ. Vui lòng thử lại.');
                navigation.goBack();
              }
            }}
          >
            <Icon name="checkmark-done-circle" size={24} color="#fff" />
            <Text style={styles.completeSetButtonText}>
              Hoàn thành! Quay lại
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rest Timer Modal */}
      <Modal
        visible={isResting}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timerModal}>
            <Icon name="moon" size={48} color={colors.primary} />
            <Text style={styles.timerTitle}>Thời gian nghỉ</Text>

            <Animated.View style={[styles.timerCircle, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.timerText}>{formatTime(restTimeLeft)}</Text>
            </Animated.View>

            <Text style={styles.timerSubtitle}>
              Chuẩn bị cho Set {currentSet}
            </Text>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipRest}
            >
              <Text style={styles.skipButtonText}>Bỏ qua nghỉ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WorkoutExerciseDetailScreen;
