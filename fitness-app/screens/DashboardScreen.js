import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Image,
  ImageBackground,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import { styles } from './styles/DashboardScreen.styles';
import { dashboardAPI } from '../services/api';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayStats, setTodayStats] = useState({
    steps: 8450,
    calories: 320,
    activeMinutes: 45,
    water: 6,
    sleep: 7.5,
    heartRate: 72,
  });

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const statsRes = await dashboardAPI.getStats();
      if (statsRes.data && statsRes.data.success) {
        setTodayStats(statsRes.data.stats);
      }
    } catch (err) {
      console.log('Error fetching dashboard data:', err);
      // We will suppress standard errors here and just rely on default zeroed data or mock data to render the UI
    } finally {
      // Small timeout just to simulate loading state for UX
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 500);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF794A" />
      </View>
    );
  }

  // Fallback values if API doesn't provide them, aligning with the new mockup
  const displaySteps = todayStats.steps || 999;
  const displayCalories = todayStats.calories ? (todayStats.calories / 1000).toFixed(1) + 'k' : '12.4k';
  const displayHR = todayStats.heartRate || 72;
  const displayWater = todayStats.water ? (todayStats.water / 1000).toFixed(1) : '1.8';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF794A" />
        }
      >
        {/* Top App Header */}
        <View style={styles.topHeaderBar}>
          <View style={styles.topLeftGroup}>
            <Image
              source={{ uri: user?.profileImage }}
              style={styles.avatarImage}
            />
            <Text style={styles.brandText}>FITLIFE</Text>
          </View>
          <TouchableOpacity style={styles.notificationIconBtn}>
            <Icon name="notifications-outline" size={24} color="#717578" />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.statusSubtitle}>Elite Athlete Status</Text>
          <Text style={styles.welcomeTitle}>
            Welcome,{'\n'}{user?.firstName || 'Alex Rivera'}
          </Text>

          <TouchableOpacity style={styles.robotButtonContainer} onPress={() => { }}>
            <MaterialCommunityIcons name="robot-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Top Stats Cards */}
        <View style={styles.topStatsRow}>
          <View style={styles.topStatCard}>
            <View style={styles.topStatIconContainer}>
              <Icon name="flame" size={24} color="#FF794A" />
            </View>
            <Text style={styles.topStatTitle}>Daily Streak</Text>
            <Text style={styles.topStatValue}>12</Text>
          </View>

          <View style={styles.topStatCard}>
            <View style={styles.topStatIconContainer}>
              <Icon name="barbell" size={24} color="#FF794A" />
            </View>
            <Text style={styles.topStatTitle}>Total Workouts</Text>
            <Text style={styles.topStatValue}>142</Text>
          </View>
        </View>

        {/* Your Pulse Section */}
        <View style={styles.pulseCardContainer}>
          <LinearGradient
            colors={['#FF794A', '#C44211']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pulseCardInner}
          >
            <View style={styles.pulseHeaderRow}>
              <View>
                <Text style={styles.pulseTitle}>Your Pulse</Text>
                <Text style={styles.pulseSubtitle}>Daily goal: 85% reached</Text>
              </View>
              <View style={styles.pulseIconCircle}>
                <Icon name="pulse" size={20} color="#FFF" />
              </View>
            </View>

            <View style={styles.pulseContentRow}>
              {/* Custom CSS Rings matching layout */}
              <View style={styles.pulseRingsContainer}>
                <View style={{
                  width: 140, height: 140, borderRadius: 70, borderWidth: 14, borderColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center'
                }}>
                  <View style={{
                    width: 90, height: 90, borderRadius: 45, borderWidth: 14, borderColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center'
                  }}>
                    <Icon name="flash" size={20} color="#FFF" />
                  </View>
                </View>
              </View>

              <View style={styles.pulseStatsCol}>
                <View style={styles.pulseStatBlock}>
                  <Text style={styles.pulseStatLabel}>Calories</Text>
                  <View style={styles.pulseStatValueRow}>
                    <Text style={styles.pulseStatValue}>{displayCalories}</Text>
                    <Text style={styles.pulseStatUnit}>kcal</Text>
                  </View>
                </View>

                <View style={styles.pulseStatBlock}>
                  <Text style={styles.pulseStatLabel}>Total Time</Text>
                  <View style={styles.pulseStatValueRow}>
                    <Text style={styles.pulseStatValue}>3.8k</Text>
                    <Text style={styles.pulseStatUnit}>min</Text>
                  </View>
                </View>

                <View style={styles.pulseStatBlockNoBorder}>
                  <Text style={styles.pulseStatLabel}>Active Intensity</Text>
                  <View style={styles.pulseStatValueRow}>
                    <Text style={styles.pulseStatValue}>High</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Daily Challenge Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Daily Challenge</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ImageBackground
          source={require('../image/banner2.jpg')}
          style={styles.challengeCard}
          imageStyle={styles.challengeImageCover}
        >
          <View style={styles.challengeOverlay}>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>Live Now</Text>
            </View>
            <Text style={styles.challengeTitle}>Morning HIIT{'\n'}Blast</Text>

            <View style={styles.challengeMetaRow}>
              <View style={styles.challengeMetaItem}>
                <Icon name="time-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.challengeMetaText}>25 min</Text>
              </View>
              <View style={styles.challengeMetaItem}>
                <Icon name="medal-outline" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.challengeMetaText}>Expert</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Recommendation Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ImageBackground
          source={require('../image/banner1.jpg')}
          style={styles.challengeCard}
          imageStyle={styles.challengeImageCover}
        >
          <View style={styles.recommendationOverlay}>
            <View style={styles.recommendationBadge}>
              <Text style={styles.recommendationBadgeText}>Intermediate</Text>
            </View>
            <Text style={styles.recommendationTitle}>ENDURANCE{'\n'}BUILDER</Text>
            <Text style={styles.recommendationSubtitle}>The Kinetic Protocol Series</Text>
          </View>
        </ImageBackground>

        {/* Biometrics Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Biometrics</Text>
          <TouchableOpacity style={styles.biometricsAddCircle}>
            <Icon name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.biometricsGridRow}>
          {/* Heart Rate Card */}
          <View style={styles.bioCard}>
            <View style={styles.bioCardHeaderRow}>
              <View style={[styles.bioIconCircle, { backgroundColor: '#FDECEB' }]}>
                <Icon name="heart" size={22} color="#D92D20" />
              </View>
              <Text style={styles.bioBadgeLiveText}>LIVE</Text>
            </View>
            <Text style={styles.bioLabel}>Heart Rate</Text>
            <View style={styles.bioValueRow}>
              <Text style={styles.bioValueNum}>{displayHR}</Text>
              <Text style={styles.bioValueUnit}>BPM</Text>
            </View>
          </View>

          {/* Steps Card */}
          <View style={styles.bioCard}>
            <View style={styles.bioCardHeaderRow}>
              <View style={[styles.bioIconCircle, { backgroundColor: '#FFF0EA' }]}>
                <Icon name="walk" size={24} color="#FF794A" />
              </View>
            </View>
            <Text style={styles.bioLabel}>Steps</Text>
            <View style={styles.bioValueRow}>
              <Text style={styles.bioValueNum}>{displaySteps}</Text>
              <Text style={styles.bioValueUnit}>/ 2000</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min((displaySteps / 2000) * 100, 100)}%` }]} />
            </View>
          </View>
        </View>

        {/* Hydration Card */}
        <View style={styles.bioFullCard}>
          <View style={[styles.bioIconCircle, { backgroundColor: '#F3E8FF' }]}>
            <Icon name="water" size={22} color="#9333EA" />
          </View>

          <View style={styles.bioHydrationInfo}>
            <Text style={styles.bioLabel}>Hydration</Text>
            <View style={styles.bioValueRow}>
              <Text style={styles.bioValueNum}>{displayWater}</Text>
              <Text style={styles.bioValueUnit}>Liters</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bioHydrationAddPill}>
            <Text style={styles.bioHydrationAddText}>ADD +</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
