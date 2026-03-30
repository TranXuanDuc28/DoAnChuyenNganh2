import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { styles } from './styles/DashboardScreen.styles';

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
      color: colors.success,
    },
    {
      id: 3,
      type: 'sleep',
      title: 'Improve sleep quality',
      description: 'Your sleep score is 7.5/10. Try going to bed 30 minutes earlier.',
      icon: 'bed',
      color: colors.warning,
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
    // BMI is now calculated and stored automatically in the user model
    if (user?.profile?.bmi) {
      return user.profile.bmi.toFixed(1);
    }
    // Fallback to manual calculation if BMI is not available
    if (!user?.profile?.height || !user?.profile?.weight) return null;
    const heightInMeters = user.profile.height / 100;
    return (user.profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { status: 'Underweight', color: colors.info };
    if (bmi < 25) return { status: 'Normal', color: colors.success };
    if (bmi < 30) return { status: 'Overweight', color: colors.warning };
    return { status: 'Obese', color: colors.danger };
  };

  const StatCard = ({ title, value, unit, icon, color, progress = null, bgColor }) => (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={20} color={color} />
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
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`, // Orange
    labelColor: (opacity = 1) => `rgba(160, 160, 160, ${opacity})`, // Grey
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // solid lines
      stroke: colors.border,
      strokeWidth: 1,
    },
  };

  const bmi = getBMI();
  const bmiStatus = bmi ? getBMIStatus(bmi) : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <ImageBackground
        source={require('../image/banner2.jpg')}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
      
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>
                {user?.firstName || 'User'}
              </Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Icon name="notifications-outline" size={24} color={colors.white} />
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
            color={colors.danger}
            bgColor={colors.card}
            progress={(todayStats.calories / 500) * 100}
          />
          <StatCard
            title="Active Min"
            value={todayStats.activeMinutes}
            unit=" min"
            icon="time"
            color={colors.warning}
            bgColor={colors.card}
            progress={(todayStats.activeMinutes / 60) * 100}
          />
          <StatCard
            title="Water"
            value={todayStats.water}
            unit=" gls"
            icon="water"
            color={colors.info}
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
            <Text style={styles.healthSubtext}>BPM</Text>
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
            width={width - 80} // Adjusted for padding
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            yAxisSuffix="k"
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

export default DashboardScreen;
