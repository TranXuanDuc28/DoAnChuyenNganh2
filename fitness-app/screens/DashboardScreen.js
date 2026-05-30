import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { styles } from './styles/DashboardScreen.styles';
import { dashboardAPI } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import Skeleton from '../components/Skeleton';
import { Image } from 'expo-image';

const DashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const todayStats = {
    steps: 8450,
    calories: 320,
    activeMinutes: 45,
    water: 6,
    sleep: 7.5,
    heartRate: 72,
  };

  const {
    data: dashboardData,
    isLoading: loading,
    refetch,
    isRefetching: refreshing
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await dashboardAPI.getStats();
      return res.data?.success ? res.data.stats : todayStats;
    }
  });

  const stats = dashboardData || todayStats;

  const onRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.topHeaderBar}>
            <Skeleton width={120} height={40} borderRadius={20} />
            <Skeleton width={38} height={38} borderRadius={19} />
          </View>
          <View style={styles.headerContainer}>
            <Skeleton width={150} height={20} style={{ marginBottom: 10 }} />
            <Skeleton width={200} height={60} />
          </View>
          <View style={styles.topStatsRow}>
            <Skeleton width="48%" height={100} borderRadius={15} />
            <Skeleton width="48%" height={100} borderRadius={15} />
          </View>
          <Skeleton width="100%" height={200} borderRadius={20} style={{ marginTop: 20 }} />
          <Skeleton width="100%" height={150} borderRadius={20} style={{ marginTop: 20 }} />
        </ScrollView>
      </View>
    );
  }

  const displaySteps = stats.steps || 999;
  const displayCalories = stats.calories ? (stats.calories / 1000).toFixed(1) + 'k' : '12.4k';
  const displayHR = stats.heartRate || 72;
  const displayWater = stats.water ? (stats.water / 1000).toFixed(1) : '1.8';
  const stepGoal = 2000;
  const stepsProgress = Math.min(displaySteps / stepGoal, 1);

  const weeklyData = [
    { day: 'Mon', h: 40 },
    { day: 'Tue', h: 60 },
    { day: 'Wed', h: 30 },
    { day: 'Thu', h: 70 },
    { day: 'Fri', h: 90, active: true },
    { day: 'Sat', h: 50 },
    { day: 'Sun', h: 45 }
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E76F51" />
        }
      >
        {/* Top App Header */}
        <View style={styles.topHeaderBar}>
          <View style={styles.topLeftGroup}>
            <Image
              source={{ uri: user?.profileImage || 'https://via.placeholder.com/150' }}
              style={styles.avatarImage}
            />
            <Text style={styles.brandText}>FITLIFE</Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationIconBtn, {
              width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center'
            }]}
            onPress={() => navigation.navigate('DashboardNew')}
          >
            <Icon name="notifications-outline" size={22} color="#717578" />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.statusSubtitle}>Elite Athlete Status</Text>
          <Text style={styles.welcomeTitle}>
            Welcome,{'\n'}{user?.firstName || 'Alex Rivera'}
          </Text>

          <TouchableOpacity style={styles.robotButtonContainer} onPress={() => navigation.navigate('Assistant')}>
            <MaterialCommunityIcons name="robot-outline" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Top Stats Cards */}
        <View style={styles.topStatsRow}>
          <View style={styles.topStatCard}>
            <View style={styles.topStatIconContainer}>
              <Icon name="flame" size={24} color="#E76F51" />
            </View>
            <Text style={styles.topStatTitle}>Daily Streak</Text>
            <Text style={styles.topStatValue}>12</Text>
          </View>

          <View style={styles.topStatCard}>
            <View style={styles.topStatIconContainer}>
              <Icon name="barbell" size={24} color="#E76F51" />
            </View>
            <Text style={styles.topStatTitle}>Total Workouts</Text>
            <Text style={styles.topStatValue}>142</Text>
          </View>
        </View>

        {/* Your Pulse Section */}
        <View style={styles.pulseCardContainer}>
          <LinearGradient
            colors={['#E76F51', '#9F3E15']}
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
              <View style={styles.pulseRingsContainer}>
                <Svg height="140" width="140" viewBox="0 0 140 140">
                  <Circle cx="70" cy="70" r="60" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="10" fill="none" />
                  <Circle
                    cx="70" cy="70" r="60"
                    stroke="#FFFFFF"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 60 * 0.75} ${2 * Math.PI * 60}`}
                    strokeLinecap="round"
                    fill="none"
                    rotation="-90" origin="70, 70"
                  />
                  <Circle cx="70" cy="70" r="46" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="10" fill="none" />
                  <Circle
                    cx="70" cy="70" r="46"
                    stroke="rgba(255, 255, 255, 0.7)"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 46 * 0.85} ${2 * Math.PI * 46}`}
                    strokeLinecap="round"
                    fill="none"
                    rotation="-90" origin="70, 70"
                  />
                  <Circle cx="70" cy="70" r="32" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="10" fill="none" />
                  <Circle
                    cx="70" cy="70" r="32"
                    stroke="rgba(255, 255, 255, 0.9)"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 32 * 0.6} ${2 * Math.PI * 32}`}
                    strokeLinecap="round"
                    fill="none"
                    rotation="-90" origin="70, 70"
                  />
                </Svg>
                <View style={{ position: 'absolute' }}>
                  <Icon name="flash" size={22} color="#FFF" />
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

        {/* Weekly Progress Section */}
        <View style={styles.weeklyProgressCard}>
          <View style={styles.weeklyProgressHeader}>
            <Text style={styles.weeklyTitle}>Weekly Progress</Text>
            <Text style={styles.weeklySubtitle}>You've hit 85% of your step goal this week.</Text>
          </View>

          <View style={styles.chartRow}>
            {weeklyData.map((item, idx) => (
              <View key={idx} style={styles.barContainer}>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, {
                    height: `${item.h}%`,
                    backgroundColor: item.active ? '#9F3E15' : '#E0E0E0'
                  }]} />
                </View>
                <Text style={styles.dayText}>{item.day}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.viewProgressButton}
            onPress={() => navigation.navigate('Progress')}
          >
            <Text style={styles.viewProgressText}>View Detailed Progress</Text>
            <Icon name="arrow-up-outline" size={18} color="#FFF" style={{ transform: [{ rotate: '45deg' }] }} />
          </TouchableOpacity>
        </View>

        {/* Daily Challenge Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Daily Challenge</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Challenges')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Challenges')}
        >
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
        </TouchableOpacity>
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
          {/* <TouchableOpacity 
            style={styles.biometricsAddCircle}
            onPress={() => navigation.navigate('Health')}
          >
            <Icon name="add" size={24} color="#FFF" />
          </TouchableOpacity> */}
        </View>

        <View style={styles.biometricsGridRow}>
          <TouchableOpacity
            style={styles.bioCard}
          //onPress={() => navigation.navigate('Statistics', { type: 'heart-rate' })}
          >
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
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bioCard}
          //onPress={() => navigation.navigate('Statistics', { type: 'steps' })}
          >
            <View style={styles.bioCardHeaderRow}>
              <View style={[styles.bioIconCircle, { backgroundColor: '#FFF0EA' }]}>
                <Icon name="walk" size={24} color="#E76F51" />
              </View>
            </View>
            <Text style={styles.bioLabel}>Steps</Text>
            <View style={styles.bioValueRow}>
              <Text style={styles.bioValueNum}>{displaySteps}</Text>
              <Text style={styles.bioValueUnit}>/ {stepGoal}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${stepsProgress * 100}%` }]} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.bioFullCard}
          onPress={() => navigation.navigate('WaterTracking')}
        >
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
          <TouchableOpacity
            style={styles.bioHydrationAddPill}
            onPress={() => {
              navigation.navigate('WaterTracking');
            }}
          >
            <Text style={styles.bioHydrationAddText}>ADD +</Text>
          </TouchableOpacity>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
