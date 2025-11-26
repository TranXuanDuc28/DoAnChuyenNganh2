import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import colors from '../theme/colors';
import { styles } from './styles/HealthScreen.styles';

const HealthScreen = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const healthMetrics = {
    sleep: { value: 7.5, unit: 'hrs', target: 8, status: 'good' },
    heartRate: { value: 72, unit: 'bpm', target: 60, status: 'normal' },
    stress: { value: 3, unit: '/10', target: 5, status: 'low' },
    steps: { value: 8450, unit: 'steps', target: 10000, status: 'good' },
    water: { value: 6, unit: 'glasses', target: 8, status: 'good' },
    weight: { value: 70.5, unit: 'kg', target: 68, status: 'progress' },
  };

  const recentRecords = [
    {
      id: 1,
      type: 'sleep',
      title: 'Sleep Quality',
      value: '7.5 hours',
      time: 'Last night',
      icon: 'bed',
      color: colors.primary,
    },
    {
      id: 2,
      type: 'heart',
      title: 'Heart Rate',
      value: '72 bpm',
      time: '2 hours ago',
      icon: 'heart',
      color: colors.iconDanger,
    },
    {
      id: 3,
      type: 'stress',
      title: 'Stress Level',
      value: 'Low',
      time: '1 hour ago',
      icon: 'leaf',
      color: colors.iconSuccess,
    },
  ];

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'stats-chart' },
    { id: 'track', title: 'Track', icon: 'add-circle' },
    { id: 'insights', title: 'Insights', icon: 'bulb' },
  ];

  const renderHealthMetric = (key, metric, index) => {
    const percentage = Math.min((metric.value / metric.target) * 100, 100);
    const getStatusColor = (status) => {
      switch (status) {
        case 'good': return colors.primary;
        case 'normal': return colors.iconSuccess;
        case 'low': return colors.iconSuccess;
        case 'progress': return colors.iconWarning;
        default: return colors.textSecondary;
      }
    };

    return (
      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          <Text style={styles.metricValue}>
            {metric.value} {metric.unit}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: getStatusColor(metric.status),
              },
            ]}
          />
        </View>
        <Text style={styles.metricTarget}>
          Target: {metric.target} {metric.unit}
        </Text>
      </View>
    );
  };

  const renderRecentRecord = ({ item }) => (
    <TouchableOpacity style={styles.recordCard}>
      <View style={[styles.recordIcon, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={24} color="#fff" />
      </View>
      <View style={styles.recordInfo}>
        <Text style={styles.recordTitle}>{item.title}</Text>
        <Text style={styles.recordValue}>{item.value}</Text>
      </View>
      <View style={styles.recordTime}>
        <Text style={styles.recordTimeText}>{item.time}</Text>
        <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="settings" size={24} color={colors.primary} />
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
              color={selectedTab === tab.id ? colors.textOnPrimary : colors.textSecondary}
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

      <ScrollView style={styles.content}>
        {selectedTab === 'overview' && (
          <View>
            {/* Health Metrics Grid */}
            <View style={styles.metricsGrid}>
              {Object.entries(healthMetrics).map(([key, metric], index) =>
                renderHealthMetric(key, metric, index)
              )}
            </View>

            {/* Recent Records */}
            <View style={styles.recordsSection}>
              <Text style={styles.sectionTitle}>Recent Records</Text>
              <FlatList
                data={recentRecords}
                renderItem={renderRecentRecord}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </View>
          </View>
        )}

        {selectedTab === 'track' && (
          <View style={styles.trackContainer}>
            <Text style={styles.sectionTitle}>Track Health Metrics</Text>

            <TouchableOpacity style={styles.trackButton}>
              <Icon name="bed" size={22} color={colors.iconDefault} />
              <Text style={styles.trackButtonText}>Log Sleep</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trackButton}>
              <Icon name="heart" size={22} color={colors.iconDefault} />
              <Text style={styles.trackButtonText}>Log Heart Rate</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trackButton}>
              <Icon name="leaf" size={22} color={colors.iconDefault} />
              <Text style={styles.trackButtonText}>Log Stress Level</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trackButton}>
              <Icon name="scale" size={22} color={colors.iconDefault} />
              <Text style={styles.trackButtonText}>Log Weight</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trackButton}>
              <Icon name="water" size={22} color={colors.iconDefault} />
              <Text style={styles.trackButtonText}>Log Water Intake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trackButton}>
              <Icon name="fitness" size={22} color={colors.iconDefault} />
              <Text style={styles.trackButtonText}>Breathing Exercise</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedTab === 'insights' && (
          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>Health Insights</Text>

            <View style={styles.insightCard}>
              <Icon name="trending-up" size={32} color={colors.success} />
              <Text style={styles.insightTitle}>Sleep Improvement</Text>
              <Text style={styles.insightDescription}>
                Your sleep quality has improved by 15% this week compared to last week.
              </Text>
            </View>

            <View style={styles.insightCard}>
              <Icon name="heart" size={32} color={colors.danger} />
              <Text style={styles.insightTitle}>Heart Rate Stability</Text>
              <Text style={styles.insightDescription}>
                Your resting heart rate has been consistent at 72 bpm, which is excellent.
              </Text>
            </View>

            <View style={styles.insightCard}>
              <Icon name="bulb" size={32} color={colors.warning} />
              <Text style={styles.insightTitle}>Recommendation</Text>
              <Text style={styles.insightDescription}>
                Try to increase your water intake to 8 glasses per day for better hydration.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HealthScreen;
