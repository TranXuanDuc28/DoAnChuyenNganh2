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
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles/WorkoutExerciseDetailScreen.styles';
import { workoutAPI } from '../services/api';

const { width } = Dimensions.get('window');

const WorkoutExerciseDetailScreen = ({ route, navigation }) => {
  const { exercise, workoutExercise, dayExerciseId } = route.params;

  const [activeTab, setActiveTab] = useState(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState([]);
  const [actualReps, setActualReps] = useState(parseInt(workoutExercise.reps) || 12);

  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  // Animation for timer pulse
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Create video player instance only if videoUrl exists
  const player = exercise.videoUrl
    ? useVideoPlayer(exercise.videoUrl, player => {
      player.loop = true;
      player.play(); // Auto-play fix
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

    if (timerInterval) clearInterval(timerInterval);

    const interval = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResting(false);
          setTimerInterval(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const handleCompleteSet = () => {
    const newCompletedSets = [...completedSets, currentSet];
    setCompletedSets(newCompletedSets);

    const totalSets = workoutExercise.sets || 3;

    if (currentSet < totalSets) {
      startRestTimer();
      setCurrentSet(currentSet + 1);
      setActualReps(parseInt(workoutExercise.reps) || 12);
    } else {
      completeAll();
    }
  };

  const completeAll = async () => {
    try {
      if (dayExerciseId) {
        await workoutAPI.completeExercise(dayExerciseId);
        Alert.alert('Perfect! 🎉', 'You completed this exercise.');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error completing exercise:', error);
      Alert.alert('Error', 'Failed to save progress.');
      navigation.goBack();
    }
  };

  const handleSkipRest = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsResting(false);
    setRestTimeLeft(0);
    scaleAnim.setValue(1);
  };

  const handleExtendRest = () => {
    setRestTimeLeft(prev => prev + 15);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSets = workoutExercise.sets || 1;
  const hasReps = workoutExercise.reps && parseInt(workoutExercise.reps) > 0;

  const renderDots = () => {
    return (
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSets }, (_, i) => i + 1).map((num) => {
          const isDone = completedSets.includes(num);
          const isActive = currentSet === num;

          return (
            <View
              key={num}
              style={[
                styles.progressDot,
                isDone && styles.progressDotCompleted,
                isActive && styles.progressDotActive
              ]}
            >
              {isDone ? (
                <Icon name="checkmark" size={14} color="white" />
              ) : isActive ? (
                <View style={styles.progressDotInner} />
              ) : null}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{exercise.name || 'Exercise Detail'}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Media Block */}
        <View style={styles.videoContainer}>
          {exercise.videoUrl && player ? (
            <VideoView
              player={player}
              style={styles.exerciseVideo}
              contentFit="contain"
              nativeControls={true}
            />
          ) : exercise.imageUrl ? (
            <Image
              source={{ uri: exercise.imageUrl }}
              style={styles.exerciseVideo}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.exerciseVideo, { justifyContent: 'center', alignItems: 'center' }]}>
              <Icon name="fitness" size={80} color="#A8390D" style={{ opacity: 0.1 }} />
            </View>
          )}
        </View>

        {/* Tab Selection */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabCard, activeTab === 'instructions' && styles.tabCardActive]}
            onPress={() => setActiveTab(activeTab === 'instructions' ? null : 'instructions')}
          >
            <Text style={styles.tabCardText}>Instructions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabCard, activeTab === 'recognition' && styles.tabCardActive]}
            onPress={() => {
              navigation.navigate('Pose', {
                exerciseName: exercise.slug || exercise.id || exercise.name,
                exerciseTitle: exercise.name
              });
            }}
          >
            <Text style={styles.tabCardText}>Recognition</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content Display */}
        {activeTab && (
          <View style={styles.infoOverlay}>
            <Text style={styles.infoText}>
              {activeTab === 'instructions'
                ? (Array.isArray(exercise.instructions) ? exercise.instructions.join('\n') : exercise.instructions)
                : (Array.isArray(exercise.tips) ? exercise.tips.join('\n') : (exercise.tips || 'Tips help correct form and prevent injury.'))}
            </Text>
          </View>
        )}

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statColumn}>
            <View style={styles.statIconBox}>
              <Icon name="list" size={18} color="#A8390D" />
            </View>
            <Text style={styles.statLabel}>Sets</Text>
            <Text style={styles.statValue}>{totalSets}</Text>
          </View>
          <View style={styles.statColumn}>
            <View style={styles.statIconBox}>
              <Icon name="fitness" size={18} color="#A8390D" />
            </View>
            <Text style={styles.statLabel}>Reps</Text>
            <Text style={styles.statValue}>{workoutExercise.reps || 12}</Text>
          </View>
          <View style={styles.statColumn}>
            <View style={styles.statIconBox}>
              <Icon name="timer-outline" size={18} color="#A8390D" />
            </View>
            <Text style={styles.statLabel}>Rest</Text>
            <Text style={styles.statValue}>{workoutExercise.restSeconds || 60}"</Text>
          </View>
        </View>

        {/* Current Set Header */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>Set {currentSet} of {totalSets}</Text>
          {renderDots()}
        </View>

        {/* Main Counter (Conditional) */}
        {hasReps && (
          <View style={styles.counterSection}>
            <Text style={styles.repNumber}>{actualReps}</Text>
            <Text style={styles.repLabel}>Reps Completed</Text>

            <View style={styles.adjustmentRow}>
              <TouchableOpacity
                style={styles.adjButton}
                onPress={() => setActualReps(Math.max(0, actualReps - 1))}
              >
                <Icon name="remove" size={28} color="#A8390D" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adjButton}
                onPress={() => setActualReps(actualReps + 1)}
              >
                <Icon name="add" size={28} color="#A8390D" />
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Sticky Footer Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.nextSetButton}
          onPress={handleCompleteSet}
        >
          <Text style={styles.nextSetText}>Next Set</Text>
          <Icon name="arrow-forward" size={18} color="#681C00" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.skipText}>Skip Set</Text>
        </TouchableOpacity>
      </View>

      {/* Rest Timer Modal - REDESIGNED */}
      <Modal
        visible={isResting}
        transparent={false}
        animationType="slide"
      >
        <LinearGradient
          colors={['#FFE8E1', '#FBF8FC']}
          style={styles.timerModalOverlay}
        >
          <View style={styles.timerFullContainer}>


            {/* Labels */}
            <View style={styles.timerLabelSet}>
              <Text style={styles.timerRestTag}>Rest</Text>
              <Text style={styles.timerRecoverTitle}>Recovering</Text>
            </View>

            {/* Timer Circle */}
            <View style={styles.timerCircleWrapper}>
              <View style={styles.timerCircleOuter} />
              <Animated.View style={[styles.timerCircleInner, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.timerBigText}>{formatTime(restTimeLeft)}</Text>
              </Animated.View>
            </View>

            {/* Exercise Info */}
            <View style={styles.timerEmojiInfo}>
              <View style={styles.timerExerciseInfo}>
                <Text style={styles.timerExerciseName}>{exercise.name || 'Next Set'}</Text>
                <Text style={styles.timerExerciseSummary}>{totalSets} sets × {workoutExercise.reps || 12} reps</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.timerActions}>
              <TouchableOpacity
                style={styles.extendButton}
                onPress={handleExtendRest}
              >
                <Icon name="add-circle" size={20} color="#681C00" />
                <Text style={styles.extendButtonText}>Extend +15s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipRestBtn}
                onPress={handleSkipRest}
              >
                <Text style={styles.skipRestBtnText}>Skip Rest</Text>
                <Icon name="play-skip-forward" size={16} color="#A8390D" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Modal>
    </View>
  );
};

export default WorkoutExerciseDetailScreen;
