import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { workoutAPI } from '../services/api';
import { styles } from './styles/WorkoutPlanDetailScreen.styles';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to get formatted day info for calendar
const getDayDetailsForCalendar = (dayNumber, startDate) => {
  if (!startDate) return { dayName: `D${dayNumber}`, dateNum: dayNumber };
  const start = new Date(startDate);
  const targetDate = new Date(start);
  targetDate.setDate(start.getDate() + (dayNumber - 1));
  
  return { 
    dayName: DAYS_OF_WEEK[targetDate.getDay()], 
    dateNum: targetDate.getDate() 
  };
};

const WorkoutPlanDetailScreen = ({ route, navigation }) => {
  const { plan } = route.params;
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayDetails, setDayDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState(plan);

  useEffect(() => {
    // Auto-select current day or first incomplete day
    if (planData.currentDay) {
      handleSelectDay(planData.currentDay);
    } else if (planData.days && planData.days.length > 0) {
      const firstIncompleteDay = planData.days.find(d => !d.isCompleted);
      if (firstIncompleteDay) {
        handleSelectDay(firstIncompleteDay);
      } else {
        handleSelectDay(planData.days[0]);
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
      Alert.alert('Error', 'Unable to load day details');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDay = async () => {
    if (!selectedDay) return;

    Alert.alert(
      'Complete Workout',
      'Have you finished today\'s session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await workoutAPI.completeWorkoutDay(selectedDay.id);
              if (response.data.success) {
                const updatedDay = { ...selectedDay, isCompleted: true, completedAt: new Date().toISOString() };
                setSelectedDay(updatedDay);

                const updatedDays = planData.days.map(day =>
                  day.id === selectedDay.id ? updatedDay : day
                );
                setPlanData({ ...planData, days: updatedDays });

                // Reload day details
                const dayResponse = await workoutAPI.getWorkoutPlanDay(selectedDay.id);
                if (dayResponse.data.success) {
                  setDayDetails(dayResponse.data.data);
                }

                // Navigate to completion screen with stats
                navigation.navigate('WorkoutComplete', {
                  calories: dayDetails.estimatedCalories || 350,
                  duration: dayDetails.totalDuration || 60,
                  exerciseCount: dayDetails.exercises?.length || 0,
                  sessionData: {
                    ...dayDetails,
                    date: new Date().toISOString(),
                    planName: planData.name
                  }
                });
              }
            } catch (error) {
              console.error('Failed to complete day:', error);
              Alert.alert('Error', 'Unable to complete session. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderDayCapsule = ({ item }) => {
    const isSelected = selectedDay?.id === item.id;
    const isCompleted = item.isCompleted;
    const { dayName, dateNum } = getDayDetailsForCalendar(item.dayNumber, planData.startDate);

    return (
      <TouchableOpacity
        style={[
          styles.dayCapsule,
          isSelected && styles.dayCapsuleSelected,
          isCompleted && styles.dayCapsuleCompleted,
        ]}
        onPress={() => handleSelectDay(item)}
      >
        <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>{dayName}</Text>
        <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>{dateNum}</Text>
        {isSelected && <View style={styles.todayIndicator} />}
        {isCompleted && !isSelected && (
          <View style={{ marginTop: 2 }}>
             <Icon name="checkmark-circle" size={12} color="#16A34A" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderExerciseItem = ({ item }) => {
    const exercise = item.exerciseDetails;
    const isCompleted = item.isCompleted;

    return (
      <TouchableOpacity
        style={[styles.exerciseItem, isCompleted && styles.exerciseItemCompleted]}
        onPress={() => {
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
              dayExerciseId: item.id_dayExercise
            });
          }
        }}
      >
        <View style={styles.exerciseInfo}>
          <View style={styles.exerciseMetaRow}>
            <View style={styles.exerciseBadge}>
              <Text style={styles.exerciseBadgeText}>{exercise?.category || 'Strength'}</Text>
            </View>
            {isCompleted && <Icon name="checkmark-circle" size={16} color="#16A34A" />}
          </View>
          
          <Text style={styles.exerciseName} numberOfLines={1}>{item.exerciseName}</Text>
          
          <View style={styles.exerciseStatsRow}>
            <View style={styles.exerciseStat}>
              <Icon name="time" size={14} color="#3F3F46" />
              <Text style={styles.exerciseStatText}>
                {item.duration ? `${Math.floor(item.duration / 60)} MIN` : `${item.sets || 3} SETS`}
              </Text>
            </View>
            <View style={styles.exerciseStat}>
              <Icon name="flame" size={14} color="#3F3F46" />
              <Text style={styles.exerciseStatText}>{item.caloriesBurned || 150} KCAL</Text>
            </View>
          </View>
        </View>

        {exercise?.imageUrl ? (
          <Image source={{ uri: exercise.imageUrl }} style={styles.exerciseImage} />
        ) : (
          <View style={[styles.exerciseImage, { justifyContent: 'center', alignItems: 'center' }]}>
            <Icon name="fitness" size={24} color="#A8390D" style={{ opacity: 0.3 }} />
          </View>
        )}
      </TouchableOpacity>
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
        <Text style={styles.headerTitle} numberOfLines={1}>Monthly Plan</Text>
      </View>

      {/* Calendar Bar */}
      <View style={styles.calendarContainer}>
        <FlatList
          horizontal
          data={planData.days || []}
          renderItem={renderDayCapsule}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarList}
        />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A8390D" />
          </View>
        ) : dayDetails ? (
          <View>
            {/* Main Day Header Card */}
            <View style={styles.dayHeaderCard}>
               <View style={styles.cardTopRow}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{dayDetails.focusArea || 'Full Body'}</Text>
                  </View>
                  <Text style={styles.dayTitle}>{dayDetails.dayName}</Text>
                  <Text style={styles.dayDescription}>
                    {dayDetails.notes || 'Focus on compound movements and proper form for maximum efficiency.'}
                  </Text>
                </View>

                {/* Oval Play Button */}
                <TouchableOpacity 
                   style={styles.playButton}
                   onPress={() => {/* Start Session logic */}}
                >
                   <Icon name="play" size={14} color="#A8390D" />
                </TouchableOpacity>
               </View>

               {/* Stats Row */}
               <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <View style={styles.statIconBox}>
                      <Icon name="time" size={20} color="#A8390D" />
                    </View>
                    <Text style={styles.statValue}>{dayDetails.totalDuration || 60} min</Text>
                    <Text style={styles.statLabel}>Time</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={styles.statIconBox}>
                      <Icon name="flame" size={19} color="#A8390D" />
                    </View>
                    <Text style={styles.statValue}>{dayDetails.estimatedCalories || 400} cal</Text>
                    <Text style={styles.statLabel}>Burn</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={styles.statIconBox}>
                      <Icon name="list" size={20} color="#A8390D" />
                    </View>
                    <Text style={styles.statValue}>{dayDetails.exercises?.length || 5} exercises</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
               </View>
            </View>

            {/* Rest Day view */}
            {dayDetails.isRestDay ? (
              <View style={styles.restDayCard}>
                <Icon name="moon" size={64} color="#A8390D" style={{ opacity: 0.5 }} />
                <Text style={styles.restDayTitle}>Recovery Day</Text>
                <Text style={styles.restDayText}>
                  Rest is when your muscles grow. Take it easy today!
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <FlatList
                   data={dayDetails.exercises || []}
                   renderItem={renderExerciseItem}
                   keyExtractor={(item, index) => index.toString()}
                   scrollEnabled={false}
                />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Select a day to see details</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Footer */}
      {selectedDay && !selectedDay.isCompleted && !dayDetails?.isRestDay && (
        <View style={styles.footer}>
           <TouchableOpacity 
             style={styles.completeButton}
             onPress={handleCompleteDay}
           >
              <Icon name="checkmark-circle" size={30} color="white" />
              <Text style={styles.completeButtonText}>Completed Session</Text>
           </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default WorkoutPlanDetailScreen;
