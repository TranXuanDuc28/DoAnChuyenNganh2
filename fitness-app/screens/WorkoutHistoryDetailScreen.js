import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { styles } from './styles/WorkoutHistoryDetailScreen.styles';

const WorkoutHistoryDetailScreen = ({ route, navigation }) => {
  const { session } = route.params;

  // Determine session period based on date/time
  const getSessionPeriod = (dateString) => {
    const hour = new Date(dateString).getHours();
    if (hour >= 5 && hour < 12) return 'Morning Session';
    if (hour >= 12 && hour < 17) return 'Afternoon Session';
    if (hour >= 17 && hour < 21) return 'Evening Session';
    return 'Night Session';
  };

  const sessionPeriod = getSessionPeriod(session.date);

  // Fallback for Heart Rate if not provided
  const avgBpm = session.avgBpm || 145; // Default mockup value

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#1B1B1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Performance</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainWrapper}>

          {/* PREMIUM SUMMARY CARD (BODY START) */}
          <View style={styles.summaryCard}>
            <View style={styles.blurBlob} />

            <View style={styles.summaryTop}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTag}>{sessionPeriod}</Text>
                <Text style={styles.sessionName} numberOfLines={2}>
                  {session.name}
                </Text>
              </View>
              <View style={styles.eliteBadge}>
                <Text style={styles.eliteText}>ELITE</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBlock}>
                <Text style={styles.statValue}>{session.duration}</Text>
                <Text style={styles.statUnit}>min</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statValue}>{Math.round(session.calories)}</Text>
                <Text style={styles.statUnit}>kcal</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statValue}>{avgBpm}</Text>
                <Text style={styles.statUnit}>bpm avg</Text>
              </View>
            </View>
          </View>

          {/* EXERCISE BREAKDOWN (BODY CONTENT) */}
          <View style={styles.breakdownSection}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownTitle}>Exercise Breakdown</Text>
              <Text style={styles.exerciseCount}>
                {session.exercises?.length || 0} Exercises
              </Text>
            </View>

            <View style={styles.exerciseList}>
              {session.exercises?.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseMain}>
                    <View style={[styles.iconCircle]}>
                      <Icon
                        name={exercise.category?.toLowerCase().includes('cardio') ? 'heart' : 'fitness'}
                        size={22}
                        color={'#A8390D'}
                      />
                    </View>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName} numberOfLines={1}>
                        {exercise.name}
                      </Text>
                      <Text style={styles.exerciseSets}>
                        {exercise.sets ? `${exercise.sets} sets x ` : ''}
                        {exercise.reps ? `${exercise.reps} reps` : exercise.duration ? `${exercise.duration} min` : 'Performance Completed'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutHistoryDetailScreen;
