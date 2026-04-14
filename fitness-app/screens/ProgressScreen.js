import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { styles } from './styles/ProgressScreen.styles';

const { width } = Dimensions.get('window');

const ProgressScreen = () => {
  const navigation = useNavigation();
  const [viewType, setViewType] = useState('Weekly');

  const chartData = {
    labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    datasets: [
      {
        data: [73.5, 73.0, 72.8, 73.2, 72.4, 72.2, 72.0],
        color: (opacity = 1) => `rgba(153, 71, 0, ${opacity})`,
        strokeWidth: 4,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(153, 71, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(88, 66, 53, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '3',
      stroke: '#FFFFFF',
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // solid background lines
      stroke: 'rgba(231, 232, 231, 1)',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FF794A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROGRESS</Text>
        <TouchableOpacity>
          <Icon name="ellipsis-vertical" size={24} color="#FF794A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          {/* View Toggle */}
          <View style={styles.viewToggle}>
            <View style={styles.toggleBackground}>
              <TouchableOpacity
                style={[styles.toggleButton, viewType === 'Weekly' && styles.activeToggleButton]}
                onPress={() => setViewType('Weekly')}
              >
                <Text style={[styles.toggleText, viewType === 'Weekly' && styles.activeToggleText]}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, viewType === 'Monthly' && styles.activeToggleButton]}
                onPress={() => setViewType('Monthly')}
              >
                <Text style={[styles.toggleText, viewType === 'Monthly' && styles.activeToggleText]}>Monthly</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weight Trend Chart Section */}
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleContainer}>
                <Text style={styles.chartLabel}>Weight Trend</Text>
                <View style={styles.chartValueRow}>
                  <Text style={styles.chartValue}>72.4</Text>
                  <Text style={styles.chartUnitText}>kg</Text>
                </View>
              </View>
              <View style={styles.trendBadge}>
                <Icon name="trending-down" size={16} color="rgba(153, 71, 0, 1)" />
                <Text style={styles.trendText}>-1.2kg</Text>
              </View>
            </View>

            <LineChart
              data={chartData}
              width={width - 80}
              height={184}
              chartConfig={chartConfig}
              bezier
              withInnerLines={false}
              withOuterLines={false}
              withHorizontalLabels={false}
              withVerticalLabels={true}
              style={{
                marginVertical: 8,
                borderRadius: 16,
                paddingRight: 40,
              }}
              getDotColor={(dataPoint, index) => index === 4 ? 'rgba(153, 71, 0, 1)' : 'transparent'}
              renderDotContent={({ x, y, index }) => {
                if (index === 4) {
                  return (
                    <View
                      key={index}
                      style={{
                        position: 'absolute',
                        top: y - 40,
                        left: x - 25,
                        backgroundColor: '#191C1C',
                        padding: 4,
                        borderRadius: 4,
                        width: 50,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>Nov 12</Text>
                    </View>
                  );
                }
                return null;
              }}
            />

            <View style={styles.daysRow}>
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, idx) => (
                <Text key={day} style={[styles.dayText, idx === 4 && styles.activeDayText]}>{day}</Text>
              ))}
            </View>
          </View>

          {/* Summary Grid Bento Style */}
          <View style={styles.gridSection}>
            <View style={styles.bentoCard}>
              <View style={styles.bentoHeader}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="rgba(153, 71, 0, 1)" />
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              </View>
              <View style={styles.bentoInfo}>
                <Text style={styles.bentoLabel}>Calories</Text>
                <View style={styles.bentoValueRow}>
                  <Text style={styles.bentoValue}>1,840</Text>
                  <Text style={styles.bentoUnit}>kcal</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '75%' }]} />
                </View>
              </View>
            </View>

            <View style={styles.bentoCard}>
              <View style={styles.bentoHeader}>
                <View style={styles.iconCircle}>
                  <Icon name="walk-outline" size={24} color="rgba(153, 71, 0, 1)" />
                </View>
              </View>
              <View style={styles.bentoInfo}>
                <Text style={styles.bentoLabel}>Daily Steps</Text>
                <View style={styles.bentoValueRow}>
                  <Text style={styles.bentoValue}>8,432</Text>
                </View>
                <Text style={styles.bentoSubtext}>+12% from yesterday</Text>
              </View>
            </View>
          </View>

          {/* Muscle Mass Hero Card */}
          <TouchableOpacity activeOpacity={0.9}>
            <LinearGradient
              colors={['rgba(153, 71, 0, 1)', 'rgba(255, 122, 0, 1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroLabel}>PERFORMANCE PEAK</Text>
                <Text style={styles.heroTitle}>Your muscle{'\n'}mass increased{'\n'}by 0.4% this{'\n'}week.</Text>
                <TouchableOpacity style={styles.heroButton} activeOpacity={0.8}>
                  <Text style={styles.heroButtonText}>View Full Insights</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Photo Gallery Pill */}
          <TouchableOpacity style={styles.photoGalleryPill} activeOpacity={0.7}>
            <Icon name="add" size={20} color="rgba(88, 66, 53, 1)" />
            <Text style={styles.photoGalleryText}>Photo Gallery</Text>
            <Icon name="camera-outline" size={20} color="rgba(88, 66, 53, 1)" />
          </TouchableOpacity>

          {/* Milestones Section */}
          <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Milestones</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.achievementList}>
              <TouchableOpacity style={styles.achievementCard}>
                <View style={styles.achievementIconBg}>
                  <Icon name="medal-outline" size={24} color="#EA580C" />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>7-Day Streak</Text>
                  <Text style={styles.achievementDesc}>You've hit your goals 7 days in a row!</Text>
                </View>
                <Text style={styles.achievementDate}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.achievementCard}>
                <View style={styles.achievementIconBg}>
                  <MaterialCommunityIcons name="weight-lifter" size={24} color="#EA580C" />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>Power Lifter</Text>
                  <Text style={styles.achievementDesc}>Reached 100kg squat personal best.</Text>
                </View>
                <Text style={styles.achievementDate}>Nov 10</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>


    </SafeAreaView>
  );
};

export default ProgressScreen;
