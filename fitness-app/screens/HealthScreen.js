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
      color: '#9C27B0',
    },
    {
      id: 2,
      type: 'heart',
      title: 'Heart Rate',
      value: '72 bpm',
      time: '2 hours ago',
      icon: 'heart',
      color: '#F44336',
    },
    {
      id: 3,
      type: 'stress',
      title: 'Stress Level',
      value: 'Low',
      time: '1 hour ago',
      icon: 'leaf',
      color: '#4CAF50',
    },
  ];

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'stats-chart' },
    { id: 'track', title: 'Track', icon: 'add-circle' },
    { id: 'insights', title: 'Insights', icon: 'bulb' },
  ];

  const renderHealthMetric = (key, metric) => {
    const percentage = Math.min((metric.value / metric.target) * 100, 100);
    const getStatusColor = (status) => {
      switch (status) {
        case 'good': return '#4CAF50';
        case 'normal': return '#2196F3';
        case 'low': return '#4CAF50';
        case 'progress': return '#FF9800';
        default: return '#666';
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
        <Icon name="chevron-forward" size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="settings" size={24} color="#007AFF" />
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

      <ScrollView style={styles.content}>
        {selectedTab === 'overview' && (
          <View>
            {/* Health Metrics Grid */}
            <View style={styles.metricsGrid}>
              {Object.entries(healthMetrics).map(([key, metric]) =>
                renderHealthMetric(key, metric)
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
              <Icon name="bed" size={24} color="#9C27B0" />
              <Text style={styles.trackButtonText}>Log Sleep</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trackButton}>
              <Icon name="heart" size={24} color="#F44336" />
              <Text style={styles.trackButtonText}>Log Heart Rate</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trackButton}>
              <Icon name="leaf" size={24} color="#4CAF50" />
              <Text style={styles.trackButtonText}>Log Stress Level</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trackButton}>
              <Icon name="scale" size={24} color="#FF9800" />
              <Text style={styles.trackButtonText}>Log Weight</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trackButton}>
              <Icon name="water" size={24} color="#2196F3" />
              <Text style={styles.trackButtonText}>Log Water Intake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.trackButton}>
              <Icon name="fitness" size={24} color="#607D8B" />
              <Text style={styles.trackButtonText}>Breathing Exercise</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedTab === 'insights' && (
          <View style={styles.insightsContainer}>
            <Text style={styles.sectionTitle}>Health Insights</Text>
            
            <View style={styles.insightCard}>
              <Icon name="trending-up" size={32} color="#4CAF50" />
              <Text style={styles.insightTitle}>Sleep Improvement</Text>
              <Text style={styles.insightDescription}>
                Your sleep quality has improved by 15% this week compared to last week.
              </Text>
            </View>

            <View style={styles.insightCard}>
              <Icon name="heart" size={32} color="#F44336" />
              <Text style={styles.insightTitle}>Heart Rate Stability</Text>
              <Text style={styles.insightDescription}>
                Your resting heart rate has been consistent at 72 bpm, which is excellent.
              </Text>
            </View>

            <View style={styles.insightCard}>
              <Icon name="bulb" size={32} color="#FF9800" />
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricTarget: {
    fontSize: 12,
    color: '#666',
  },
  recordsSection: {
    marginBottom: 20,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 14,
    color: '#666',
  },
  recordTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordTimeText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  trackContainer: {
    paddingVertical: 20,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 16,
  },
  insightsContainer: {
    paddingVertical: 20,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HealthScreen;
