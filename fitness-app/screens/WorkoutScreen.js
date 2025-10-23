import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

const WorkoutScreen = () => {
  const [selectedTab, setSelectedTab] = useState('plans');

  const workoutPlans = [
    {
      id: 1,
      title: 'Beginner Full Body',
      duration: '30 min',
      difficulty: 'Beginner',
      exercises: 8,
      calories: 250,
      image: 'fitness',
      color: '#FF6B6B',
    },
    {
      id: 2,
      title: 'HIIT Cardio Blast',
      duration: '25 min',
      difficulty: 'Intermediate',
      exercises: 6,
      calories: 400,
      image: 'flash',
      color: '#4ECDC4',
    },
    {
      id: 3,
      title: 'Strength Training',
      duration: '45 min',
      difficulty: 'Advanced',
      exercises: 10,
      calories: 350,
      image: 'barbell',
      color: '#45B7D1',
    },
  ];

  const recentWorkouts = [
    {
      id: 1,
      name: 'Morning Yoga',
      date: 'Today',
      duration: '20 min',
      calories: 120,
    },
    {
      id: 2,
      name: 'HIIT Cardio',
      date: 'Yesterday',
      duration: '25 min',
      calories: 380,
    },
    {
      id: 3,
      name: 'Strength Training',
      date: '2 days ago',
      duration: '45 min',
      calories: 320,
    },
  ];

  const tabs = [
    { id: 'plans', title: 'Workout Plans', icon: 'list' },
    { id: 'history', title: 'History', icon: 'time' },
    { id: 'exercises', title: 'Exercises', icon: 'fitness' },
  ];

  const renderWorkoutPlan = ({ item }) => (
    <TouchableOpacity style={[styles.workoutCard, { borderLeftColor: item.color }]}>
      <View style={styles.workoutHeader}>
        <View style={[styles.workoutIcon, { backgroundColor: item.color }]}>
          <Icon name={item.image} size={24} color="#fff" />
        </View>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutTitle}>{item.title}</Text>
          <Text style={styles.workoutSubtitle}>
            {item.duration} • {item.difficulty}
          </Text>
        </View>
      </View>
      <View style={styles.workoutStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.exercises}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.calories}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecentWorkout = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyIcon}>
        <Icon name="checkmark-circle" size={24} color="#4CAF50" />
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle}>{item.name}</Text>
        <Text style={styles.historySubtitle}>{item.date}</Text>
      </View>
      <View style={styles.historyStats}>
        <Text style={styles.historyDuration}>{item.duration}</Text>
        <Text style={styles.historyCalories}>{item.calories} cal</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workouts</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={selectedTab === tab.id ? '#007AFF' : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedTab === 'plans' && (
          <View>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <FlatList
              data={workoutPlans}
              renderItem={renderWorkoutPlan}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {selectedTab === 'history' && (
          <View>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <FlatList
              data={recentWorkouts}
              renderItem={renderRecentWorkout}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {selectedTab === 'exercises' && (
          <View style={styles.exercisesContainer}>
            <Text style={styles.sectionTitle}>Exercise Library</Text>
            <Text style={styles.comingSoon}>Exercise library coming soon!</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Start Button */}
      <TouchableOpacity style={styles.quickStartButton}>
        <Icon name="play" size={24} color="#fff" />
        <Text style={styles.quickStartText}>Quick Start Workout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  workoutSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyIcon: {
    marginRight: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  historyStats: {
    alignItems: 'flex-end',
  },
  historyDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  historyCalories: {
    fontSize: 12,
    color: '#666',
  },
  exercisesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  comingSoon: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  quickStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  quickStartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default WorkoutScreen;
