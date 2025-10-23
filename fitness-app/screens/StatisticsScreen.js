import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { healthAPI, workoutAPI } from '../services/api';

const StatisticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  const fetchStats = async () => {
    try {
      // Fetch some example stats: activity records and workout history
      const [activityRes, workoutsRes] = await Promise.all([
        healthAPI.getActivityRecords({ limit: 30 }),
        workoutAPI.getWorkoutHistory({ limit: 30 })
      ]);

      setStats({ activities: activityRes.data, workouts: workoutsRes.data });
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
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: '#f7f7f8', padding: 12, borderRadius: 8, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardMeta: { fontSize: 14, color: '#666', marginTop: 4 },
  empty: { color: '#666' }
});

export default StatisticsScreen;
