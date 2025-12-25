import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../theme/colors';
import { workoutAPI } from '../services/api';
import { styles } from './styles/WorkoutPlanDetailScreen.styles';

// Helper function to format duration
const formatDuration = (seconds) => {
  if (!seconds) return null;
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} phút`;
  }
  return `${seconds} giây`;
};

// Helper function to calculate current day number based on plan startDate
const getCurrentDayNumber = (startDate, duration) => {
  if (!startDate) return null;

  const today = new Date();
  const start = new Date(startDate);

  // Reset time parts for accurate day calculation
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  const diffTime = today - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Day number is 1-indexed
  const dayNumber = diffDays + 1;

  // Check if within plan duration
  const totalDays = duration * 7; // duration is in weeks

  if (dayNumber < 1 || dayNumber > totalDays) {
    return null; // Outside plan range
  }

  return dayNumber;
};

const WorkoutPlanDetailScreen = ({ route, navigation }) => {
  const { plan } = route.params;
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayDetails, setDayDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [planData, setPlanData] = useState(plan); // Store mutable plan data

  useEffect(() => {
    // Auto-select current day or first incomplete day
    if (planData.currentDay) {
      handleSelectDay(planData.currentDay);
    } else if (planData.days && planData.days.length > 0) {
      const firstIncompleteDay = planData.days.find(d => !d.isCompleted);
      if (firstIncompleteDay) {
        handleSelectDay(firstIncompleteDay);
      }
    }
  }, []);

  // Refresh day details when returning from exercise screen
  useFocusEffect(
    React.useCallback(() => {
      // Reload day details when screen gains focus (e.g., after completing an exercise)
      if (selectedDay) {
        console.log('Screen focused, refreshing day details');
        handleSelectDay(selectedDay);
      }
    }, [selectedDay])
  );

  const handleSelectDay = async (day) => {
    setSelectedDay(day);
    setLoading(true);
    try {
      const response = await workoutAPI.getWorkoutPlanDay(day.id);
      if (response.data.success) {
        setDayDetails(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load day details:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết ngày tập');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDay = async () => {
    if (!selectedDay) return;

    Alert.alert(
      'Hoàn thành buổi tập',
      'Bạn đã hoàn thành buổi tập này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hoàn thành',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await workoutAPI.completeWorkoutDay(selectedDay.id);
              if (response.data.success) {
                // Update local state immediately
                const updatedDay = { ...selectedDay, isCompleted: true, completedAt: new Date().toISOString() };
                setSelectedDay(updatedDay);

                // Update plan days
                const updatedDays = planData.days.map(day =>
                  day.id === selectedDay.id
                    ? updatedDay
                    : day
                );
                setPlanData({ ...planData, days: updatedDays });

                // Reload day details to get updated exercise completion status
                const dayResponse = await workoutAPI.getWorkoutPlanDay(selectedDay.id);
                if (dayResponse.data.success) {
                  setDayDetails(dayResponse.data.data);
                }

                Alert.alert(
                  'Chúc mừng! 🎉',
                  'Bạn đã hoàn thành buổi tập!\n\nTiếp tục phát huy nhé! 💪',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Find next incomplete day
                        const nextDay = updatedDays.find(d => !d.isCompleted && d.dayNumber > selectedDay.dayNumber);
                        if (nextDay) {
                          handleSelectDay(nextDay);
                        }
                      }
                    }
                  ]
                );
              }
            } catch (error) {
              console.error('Failed to complete day:', error);
              Alert.alert('Lỗi', 'Không thể hoàn thành buổi tập. Vui lòng thử lại.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderDayItem = ({ item }) => {
    const isSelected = selectedDay?.id === item.id;
    const isCompleted = item.isCompleted;
    const isRestDay = item.isRestDay;

    // Calculate current day number based on plan startDate
    const currentDayNumber = getCurrentDayNumber(planData.startDate, planData.duration);
    const isPastDay = currentDayNumber ? item.dayNumber < currentDayNumber : false;
    const isDisabled = isPastDay && !isCompleted; // Only disable past days that are NOT completed

    return (
      <TouchableOpacity
        style={[
          styles.dayItem,
          isSelected && styles.dayItemSelected,
          isCompleted && styles.dayItemCompleted,
          isDisabled && { opacity: 0.5 },
        ]}
        onPress={() => {
          // Allow viewing completed days, only block incomplete past days
          if (isDisabled) return;
          handleSelectDay(item);
        }}
        activeOpacity={isDisabled ? 1 : 0.7}
        disabled={isDisabled}
      >
        <View style={styles.dayItemContent}>
          <View style={styles.dayItemHeader}>
            <Text style={[
              styles.dayNumber,
              isSelected && styles.dayNumberSelected,
              isCompleted && styles.dayNumberCompleted,
              isDisabled && { color: colors.textSecondary },
            ]}>
              {item.dayNumber}
            </Text>
            {isCompleted && (
              <Icon name="checkmark-circle" size={16} color={colors.success} style={{ marginLeft: 4 }} />
            )}
            {isRestDay && (
              <Icon name="moon" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
            )}
            {isDisabled && !isCompleted && (
              <Icon name="lock-closed" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text
            style={[
              styles.dayItemText,
              isSelected && styles.dayItemTextSelected,
              isDisabled && { color: colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {isRestDay ? 'Nghỉ' : item.focusArea || 'Tập'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderExerciseItem = ({ item, index }) => {
    const exercise = item.exerciseDetails;
    const isCompleted = item.isCompleted; // Check if exercise is completed

    // Check if this is a past day
    const currentDayNumber = getCurrentDayNumber(planData.startDate, planData.duration);
    const isPastDay = currentDayNumber && selectedDay ? selectedDay.dayNumber < currentDayNumber : false;
    const isDisabled = (isPastDay && !isCompleted) || isCompleted; // Disable if past day (and not completed) or already completed

    return (
      <TouchableOpacity
        style={[
          styles.exerciseItem,
          isCompleted && styles.exerciseItemCompleted,
          isPastDay && !isCompleted && { opacity: 0.5 },
        ]}
        onPress={() => {
          // Don't allow clicking on completed or past day exercises
          if (isDisabled) {
            return;
          }

          if (exercise) {
            navigation.navigate('WorkoutExerciseDetail', {
              exercise: exercise,
              workoutExercise: {
                sets: item.sets,
                reps: item.reps,
                duration: item.duration,
                restSeconds: item.restSeconds,
                weight: item.weight,
                notes: item.notes,
              },
              dayExerciseId: item.id_dayExercise // ID from workout_plan_day_exercises table
            });
          }
        }}
        activeOpacity={isDisabled ? 1 : 0.7} // No opacity change if disabled
        disabled={isDisabled} // Disable touch if disabled
      >
        <View style={styles.exerciseNumber}>
          <Text style={styles.exerciseNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.exerciseContent}>
          <View style={styles.exerciseNameRow}>
            <Text style={[
              styles.exerciseName,
              isCompleted && styles.exerciseNameCompleted
            ]}>
              {item.exerciseName}
            </Text>
            {isCompleted && (
              <Icon name="checkmark-circle" size={24} color={colors.success} />
            )}
          </View>

          {exercise && (
            <>
              {exercise.description && (
                <Text style={styles.exerciseDescription} numberOfLines={2}>
                  {exercise.description}
                </Text>
              )}

              <View style={styles.exerciseMeta}>
                {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                  <View style={styles.exerciseMetaItem}>
                    <Icon name="body-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.exerciseMetaText}>
                      {exercise.muscleGroups.join(', ')}
                    </Text>
                  </View>
                )}
                {exercise.difficulty && (
                  <View style={styles.exerciseMetaItem}>
                    <Icon name="speedometer-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.exerciseMetaText}>{exercise.difficulty}</Text>
                  </View>
                )}
              </View>
            </>
          )}

          <View style={styles.exerciseDetails}>
            {item.sets && item.reps ? (
              <View style={styles.exerciseDetailItem}>
                <Icon name="repeat-outline" size={16} color={colors.textOnPrimary} />
                <Text style={styles.exerciseDetailText}>
                  {item.sets} sets × {item.reps} reps
                </Text>
              </View>
            ) : item.duration ? (
              <View style={styles.exerciseDetailItem}>
                <Icon name="time-outline" size={16} color={colors.textOnPrimary} />
                <Text style={styles.exerciseDetailText}>{formatDuration(item.duration)}</Text>
              </View>
            ) : null}

            {item.caloriesBurned && (
              <View style={[styles.exerciseDetailItem, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
                <Icon name="flame-outline" size={16} color={colors.warning} />
                <Text style={[styles.exerciseDetailText, { color: colors.warning }]}>
                  {item.caloriesBurned} cal
                </Text>
              </View>
            )}

            {item.restSeconds && (
              <View style={[styles.exerciseDetailItem, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Icon name="pause-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.exerciseDetailText, { color: colors.textSecondary }]}>
                  Nghỉ {item.restSeconds}s
                </Text>
              </View>
            )}
          </View>

          {item.notes && (
            <View style={styles.exerciseNotes}>
              <Icon name="information-circle-outline" size={14} color={colors.iconWarning} />
              <Text style={styles.exerciseNotesText}>{item.notes}</Text>
            </View>
          )}
        </View>

        {/* Navigation Arrow */}
        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{planData.name}</Text>
          <Text style={styles.headerSubtitle}>
            {planData.duration} tuần • {planData.frequency} buổi/tuần
          </Text>
        </View>
      </View>

      {/* Days Horizontal List */}
      <View style={styles.daysContainer}>
        <FlatList
          horizontal
          data={planData.days || []}
          renderItem={renderDayItem}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysList}
          extraData={planData.days} // Re-render when days change
        />
      </View>

      {/* Day Details */}
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : dayDetails ? (
          <View>
            {/* Day Header */}
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{dayDetails.dayName}</Text>
              {dayDetails.focusArea && (
                <Text style={styles.dayFocus}>{dayDetails.focusArea}</Text>
              )}

              <View style={styles.dayStats}>
                <View style={styles.dayStat}>
                  <Icon name="time-outline" size={24} color={colors.primary} />
                  <Text style={styles.dayStatValue}>{dayDetails.totalDuration}</Text>
                  <Text style={styles.dayStatLabel}>phút</Text>
                </View>
                <View style={styles.dayStat}>
                  <Icon name="flame-outline" size={24} color={colors.warning} />
                  <Text style={styles.dayStatValue}>{dayDetails.estimatedCalories}</Text>
                  <Text style={styles.dayStatLabel}>cal</Text>
                </View>
                <View style={styles.dayStat}>
                  <Icon name="barbell-outline" size={24} color={colors.success} />
                  <Text style={styles.dayStatValue}>{dayDetails.exercises?.length || 0}</Text>
                  <Text style={styles.dayStatLabel}>bài tập</Text>
                </View>
              </View>
            </View>

            {/* Rest Day Message */}
            {dayDetails.isRestDay ? (
              <View style={styles.restDayContainer}>
                <Icon name="moon" size={64} color={colors.textSecondary} />
                <Text style={styles.restDayTitle}>Ngày nghỉ ngơi</Text>
                <Text style={styles.restDayText}>
                  Hãy nghỉ ngơi để cơ thể phục hồi và phát triển
                </Text>
              </View>
            ) : (
              <>
                {/* Notes */}
                {dayDetails.notes && (
                  <View style={styles.notesContainer}>
                    <Icon name="information-circle" size={20} color={colors.white} />
                    <Text style={styles.notesText}>{dayDetails.notes}</Text>
                  </View>
                )}

                {/* Exercises List */}
                <View style={styles.exercisesSection}>
                  <Text style={styles.sectionTitle}>Bài tập</Text>
                  <FlatList
                    data={dayDetails.exercises || []}
                    renderItem={renderExerciseItem}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                  />
                </View>
              </>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chọn một ngày để xem chi tiết</Text>
          </View>
        )}
      </ScrollView>

      {/* Complete Button */}
      {selectedDay && !selectedDay.isCompleted && (() => {
        // Check if this is a past day
        const currentDayNumber = getCurrentDayNumber(planData.startDate, planData.duration);
        const isPastDay = currentDayNumber ? selectedDay.dayNumber < currentDayNumber : false;

        // Don't show complete button for past days
        if (isPastDay) return null;

        return (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteDay}
              activeOpacity={0.8}
            >
              <Icon name="checkmark-circle" size={24} color={colors.white} />
              <Text style={styles.completeButtonText}>Hoàn thành buổi tập</Text>
            </TouchableOpacity>
          </View>
        );
      })()}
    </View>
  );
};

export default WorkoutPlanDetailScreen;
