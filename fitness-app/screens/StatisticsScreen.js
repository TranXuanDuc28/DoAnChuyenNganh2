import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { healthAPI, workoutAPI } from '../services/api';
import { colors } from '../theme/colors';

const StatisticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  const fetchStats = async () => {
    try {
      // Fetch some example stats: activity records and workout history
      // We use separate try-catch for each to allow partial data display
      let activityData = [];
      let workoutData = [];

      try {
        const activityRes = await healthAPI.getActivityRecords({ limit: 30 });
        if (activityRes.data && activityRes.data.success) {
          activityData = activityRes.data.data;
        }
      } catch (err) {
        console.error('Failed to fetch activity records:', err);
      }

      try {
        const workoutsRes = await workoutAPI.getWorkoutHistory({ limit: 30 });
        if (workoutsRes.data && workoutsRes.data.success) {
          workoutData = workoutsRes.data.data;
        }
      } catch (err) {
        console.error('Failed to fetch workout history:', err);
      }

      setStats({ activities: activityData, workouts: workoutData });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Recent Activity</Text>
      <Text style={styles.sectionTitle}>Workouts (last 30)</Text>
      {stats.workouts && stats.workouts.length === 0 && <Text style={styles.empty}>No workouts logged yet.</Text>}
      {stats.workouts && stats.workouts.map(w => (
        <View key={w.id} style={styles.card}>
          <Text style={styles.cardTitle}>{w.name}</Text>
          <Text style={styles.cardMeta}>{w.duration} min — {w.difficulty}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Activity Records (last 30 days)</Text>
      {stats.activities && stats.activities.length === 0 && <Text style={styles.empty}>No activity data yet.</Text>}
      {stats.activities && stats.activities.map(a => (
        <View key={a.id} style={styles.card}>
          <Text style={styles.cardTitle}>{a.date}</Text>
          <Text style={styles.cardMeta}>{a.steps} steps — {a.caloriesBurned} kcal</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 16,
    color: colors.text,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginTop: 20, 
    marginBottom: 12,
    color: colors.text,
  },
  card: { 
    backgroundColor: colors.card, 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '700',
    color: colors.text,
  },
  cardMeta: { 
    fontSize: 14, 
    color: colors.textSecondary, 
    marginTop: 6,
  },
  empty: { 
    color: colors.textSecondary,
    fontSize: 15,
    fontStyle: 'italic',
  }
});

export default StatisticsScreen;
