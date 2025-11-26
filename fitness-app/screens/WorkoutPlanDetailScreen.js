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
import colors from '../theme/colors';
import { workoutAPI } from '../services/api';
import { styles } from './styles/WorkoutPlanDetailScreen.styles';

const WorkoutPlanDetailScreen = ({ route, navigation }) => {
  const { plan } = route.params;
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayDetails, setDayDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Auto-select current day or first incomplete day
    if (plan.currentDay) {
      handleSelectDay(plan.currentDay);
    } else if (plan.days && plan.days.length > 0) {
      const firstIncompleteDay = plan.days.find(d => !d.isCompleted);
      if (firstIncompleteDay) {
        handleSelectDay(firstIncompleteDay);
      }
    }
  }, []);

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
              const response = await workoutAPI.completeWorkoutDay(selectedDay.id);
              if (response.data.success) {
                Alert.alert('Chúc mừng!', 'Bạn đã hoàn thành buổi tập!');
                // Refresh the screen
                navigation.goBack();
              }
            } catch (error) {
              console.error('Failed to complete day:', error);
              Alert.alert('Lỗi', 'Không thể hoàn thành buổi tập');
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

    return (
      <TouchableOpacity
        style={[
          styles.dayItem,
          isSelected && styles.dayItemSelected,
          isCompleted && styles.dayItemCompleted,
        ]}
        onPress={() => {
          if (isCompleted) return;
          handleSelectDay(item);
        }}
        activeOpacity={isCompleted ? 1 : 0.7}
      >
        <View style={styles.dayItemContent}>
          <View style={styles.dayItemHeader}>
            <Text style={[
              styles.dayNumber,
              isSelected && styles.dayNumberSelected,
              isCompleted && styles.dayNumberCompleted,
            ]}>
              {item.dayNumber}
            </Text>
            {isCompleted && (
              <Icon name="checkmark-circle" size={16} color={colors.success} style={{ marginLeft: 4 }} />
            )}
            {isRestDay && (
              <Icon name="moon" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text
            style={[
              styles.dayItemText,
              isSelected && styles.dayItemTextSelected,
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

    return (
      <TouchableOpacity
        style={[
          styles.exerciseItem,
          isCompleted && styles.exerciseItemCompleted
        ]}
        onPress={() => {
          // Don't allow clicking on completed exercises
          if (isCompleted) {
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
        activeOpacity={isCompleted ? 1 : 0.7} // No opacity change if completed
        disabled={isCompleted} // Disable touch if completed
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
                <Text style={styles.exerciseDetailText}>{item.duration} phút</Text>
              </View>
            ) : null}

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
          <Text style={styles.headerTitle}>{plan.name}</Text>
          <Text style={styles.headerSubtitle}>
            {plan.duration} tuần • {plan.frequency} buổi/tuần
          </Text>
        </View>
      </View>

      {/* Days Horizontal List */}
      <View style={styles.daysContainer}>
        <FlatList
          horizontal
          data={plan.days || []}
          renderItem={renderDayItem}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysList}
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
      {selectedDay && !selectedDay.isCompleted && (
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
      )}
    </View>
  );
};

export default WorkoutPlanDetailScreen;

/*
// Styles moved to ./styles/WorkoutPlanDetailScreen.styles.js
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  daysContainer: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
  },
  daysList: {
    paddingHorizontal: 16,
  },
  dayItem: {
    width: 60,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayItemCompleted: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  dayItemContent: {
    alignItems: 'center',
  },
  dayItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  dayNumberSelected: {
    color: '#fff',
  },
  dayNumberCompleted: {
    color: colors.success,
  },
  dayItemText: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dayItemTextSelected: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  dayHeader: {
    padding: 20,
    backgroundColor: colors.card,
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  dayFocus: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  dayStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dayStat: {
    alignItems: 'center',
  },
  dayStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  dayStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  restDayContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  restDayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  restDayText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  notesContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  exercisesSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  exerciseDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  exerciseMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  exerciseMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  exerciseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  exerciseDetailText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  exerciseNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  exerciseNotesText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 16,
    borderRadius: 12,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
*/

