import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [todayStats, setTodayStats] = useState({
    steps: 8450,
    calories: 320,
    activeMinutes: 45,
    water: 6,
    sleep: 7.5,
    heartRate: 72,
  });

  const [weeklyData, setWeeklyData] = useState({
    steps: [8000, 9200, 7800, 10500, 8800, 9600, 8450],
    calories: [280, 320, 290, 380, 310, 340, 320],
  });

  const [aiRecommendations, setAiRecommendations] = useState([
    {
      id: 1,
      type: 'workout',
      title: 'Try a 20-minute HIIT workout',
      description: 'Based on your activity level, a high-intensity workout would be perfect today.',
      icon: 'fitness',
      color: '#FF6B6B',
    },
    {
      id: 2,
      type: 'nutrition',
      title: 'Increase protein intake',
      description: 'Your protein consumption is below your goal. Try adding a protein shake.',
      icon: 'restaurant',
      color: '#4ECDC4',
    },
    {
      id: 3,
      type: 'sleep',
      title: 'Improve sleep quality',
      description: 'Your sleep score is 7.5/10. Try going to bed 30 minutes earlier.',
      icon: 'bed',
      color: '#45B7D1',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getBMI = () => {
    if (!user?.profile?.height || !user?.healthMetrics?.currentWeight) return null;
    const heightInMeters = user.profile.height / 100;
    const weight = user.healthMetrics.currentWeight || user.profile.weight;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { status: 'Underweight', color: '#4ECDC4' };
    if (bmi < 25) return { status: 'Normal', color: '#4CAF50' };
    if (bmi < 30) return { status: 'Overweight', color: '#FF9800' };
    return { status: 'Obese', color: '#F44336' };
  };

  const StatCard = ({ title, value, unit, icon, color, progress = null }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>
        {value}{unit && <Text style={styles.statUnit}>{unit}</Text>}
      </Text>
      {progress !== null && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
        </View>
      )}
    </View>
  );

  const RecommendationCard = ({ recommendation }) => (
    <TouchableOpacity style={styles.recommendationCard}>
      <View style={[styles.recommendationIcon, { backgroundColor: recommendation.color }]}>
        <Icon name={recommendation.icon} size={24} color="#fff" />
      </View>
      <View style={styles.recommendationContent}>
        <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
        <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF',
    },
  };

  const bmi = getBMI();
  const bmiStatus = bmi ? getBMIStatus(bmi) : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#007AFF', '#0056CC']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>
              {user?.profile?.firstName || 'User'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" size={24} color="#fff" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Activity</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Steps"
            value={todayStats.steps.toLocaleString()}
            icon="walk"
            color="#FF6B6B"
            progress={(todayStats.steps / 10000) * 100}
          />
          <StatCard
            title="Calories"
            value={todayStats.calories}
            unit=" kcal"
            icon="flame"
            color="#FF9800"
            progress={(todayStats.calories / 500) * 100}
          />
          <StatCard
            title="Active Minutes"
            value={todayStats.activeMinutes}
            unit=" min"
            icon="time"
            color="#4CAF50"
            progress={(todayStats.activeMinutes / 60) * 100}
          />
          <StatCard
            title="Water"
            value={todayStats.water}
            unit=" glasses"
            icon="water"
            color="#2196F3"
            progress={(todayStats.water / 8) * 100}
          />
        </View>
      </View>

      {/* Health Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <View style={styles.healthMetrics}>
          <View style={styles.healthCard}>
            <Text style={styles.healthLabel}>Sleep</Text>
            <Text style={styles.healthValue}>{todayStats.sleep}h</Text>
            <Text style={styles.healthSubtext}>Last night</Text>
          </View>
          <View style={styles.healthCard}>
            <Text style={styles.healthLabel}>Heart Rate</Text>
            <Text style={styles.healthValue}>{todayStats.heartRate}</Text>
            <Text style={styles.healthSubtext}>BPM (resting)</Text>
          </View>
          {bmi && (
            <View style={styles.healthCard}>
              <Text style={styles.healthLabel}>BMI</Text>
              <Text style={styles.healthValue}>{bmi}</Text>
              <Text style={[styles.healthSubtext, { color: bmiStatus.color }]}>
                {bmiStatus.status}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Weekly Progress Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [
                {
                  data: weeklyData.steps.map(step => step / 1000), // Convert to thousands
                },
              ],
            }}
            width={width - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* AI Recommendations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recommendationsContainer}>
          {aiRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
            />
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="fitness" size={32} color="#FF6B6B" />
            <Text style={styles.quickActionText}>Start Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="restaurant" size={32} color="#4ECDC4" />
            <Text style={styles.quickActionText}>Log Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="water" size={32} color="#2196F3" />
            <Text style={styles.quickActionText}>Log Water</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Icon name="bed" size={32} color="#9C27B0" />
            <Text style={styles.quickActionText}>Sleep Log</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  section: {
    margin: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
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
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statUnit: {
    fontSize: 16,
    color: '#666',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  healthSubtext: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '23%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;
