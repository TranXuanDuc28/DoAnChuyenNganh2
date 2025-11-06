import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

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
      color: colors.primary,
    },
    {
      id: 2,
      type: 'nutrition',
      title: 'Increase protein intake',
      description: 'Your protein consumption is below your goal. Try adding a protein shake.',
      icon: 'restaurant',
      color: colors.iconSuccess,
    },
    {
      id: 3,
      type: 'sleep',
      title: 'Improve sleep quality',
      description: 'Your sleep score is 7.5/10. Try going to bed 30 minutes earlier.',
      icon: 'bed',
      color: colors.iconWarning,
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
    if (bmi < 18.5) return { status: 'Underweight', color: colors.info };
    if (bmi < 25) return { status: 'Normal', color: colors.success };
    if (bmi < 30) return { status: 'Overweight', color: colors.warning };
    return { status: 'Obese', color: colors.danger };
  };

  const StatCard = ({ title, value, unit, icon, color, progress = null, bgColor }) => (
    <View style={[styles.statCard, { borderLeftColor: color, backgroundColor: bgColor }]}>
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
      <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.cardDarkLight,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`, // Orange with opacity
    labelColor: (opacity = 1) => `rgba(224, 224, 224, ${opacity})`, // Light gray text
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
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
     <ImageBackground
    source={require('../image/banner2.jpg')}
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
            <Icon name="notifications" size={24} color={colors.white} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Today's Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Activity</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Steps"
            value={todayStats.steps.toLocaleString()}
            icon="walk"
            color={colors.primary}
            bgColor={colors.card}
            progress={(todayStats.steps / 10000) * 100}
          />
          <StatCard
            title="Calories"
            value={todayStats.calories}
            unit=" kcal"
            icon="flame"
            color={colors.primary}
            bgColor={colors.card}
            progress={(todayStats.calories / 500) * 100}
          />
          <StatCard
            title="Active Minutes"
            value={todayStats.activeMinutes}
            unit=" min"
            icon="time"
            color={colors.primary}
            bgColor={colors.card}
            progress={(todayStats.activeMinutes / 60) * 100}
          />
          <StatCard
            title="Water"
            value={todayStats.water}
            unit=" glasses"
            icon="water"
            color={colors.primary}
            bgColor={colors.card}
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

      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    height: 180,
  },
  headerImage: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
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
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
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
    color: colors.white,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
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
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  statUnit: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.cardDarkLight,
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
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  healthLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  healthValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 2,
  },
  healthSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chartContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
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
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
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
    color: colors.white,
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '23%',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.white,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;
