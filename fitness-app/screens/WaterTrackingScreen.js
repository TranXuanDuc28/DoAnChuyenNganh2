import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { aiAPI } from '../services/api';
import { styles } from './styles/WaterTrackingScreen.styles';

const WaterTrackingScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [waterData, setWaterData] = useState({
    totalAmount: 0,
    goal: 3000,
    entries: [],
  });
  const [logging, setLogging] = useState(false);

  const fetchWaterIntake = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await aiAPI.getWaterIntake({ date: today });
      if (response.data) {
        setWaterData({
          totalAmount: response.data.totalAmount || 0,
          goal: 3000, // Hardcoded for now or fetch from goals
          entries: response.data.entries || [],
        });
      }
    } catch (error) {
      console.error('Error fetching water intake:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWaterIntake();
    }, [])
  );

  const handleLogWater = async (amount, source = 'Quick Add') => {
    if (logging) return;
    setLogging(true);
    try {
      const response = await aiAPI.logWater({ amount });
      if (response.data.success || response.data.entry) {
        fetchWaterIntake();
      }
    } catch (error) {
      console.error('Error logging water:', error);
      Alert.alert('Error', 'Failed to log water intake.');
    } finally {
      setLogging(false);
    }
  };

  const renderProgressRing = () => {
    const size = 220;
    const strokeWidth = 20;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    const percentage = Math.min(100, (waterData.totalAmount / waterData.goal) * 100);
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.progressContainer}>
        <Svg width={size} height={size} style={styles.progressRing}>
          {/* Background Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#E0F2FE"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#38BDF8"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressLabel}>TOTAL INTAKE</Text>
          <Text style={styles.progressValue}>
            {waterData.totalAmount.toLocaleString()}
            <Text style={styles.progressUnit}>ml</Text>
          </Text>
          <Text style={styles.progressGoal}>Goal: {waterData.goal.toLocaleString()}ml</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#F97316" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WATER TRACKING</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="ellipsis-vertical" size={24} color="#F97316" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Progress Ring Section */}
        <View style={styles.heroSection}>
          {renderProgressRing()}
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddSection}>
          <TouchableOpacity 
            style={styles.quickAddCard}
            onPress={() => handleLogWater(250, 'Glass')}
            disabled={logging}
          >
            <View style={styles.quickAddIconBg}>
              <Icon name="water" size={24} color="#0EA5E9" />
            </View>
            <Text style={styles.quickAddValue}>+250ml</Text>
            <Text style={styles.quickAddLabel}>GLASS</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAddCard}
            onPress={() => handleLogWater(500, 'Bottle')}
            disabled={logging}
          >
            <View style={styles.quickAddIconBg}>
              <Icon name="beaker" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.quickAddValue}>+500ml</Text>
            <Text style={styles.quickAddLabel}>BOTTLE</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Log Section */}
        <View style={styles.logSection}>
          <View style={styles.logHeader}>
            <Text style={styles.logTitle}>Daily Log</Text>
            <TouchableOpacity>
              <Text style={styles.viewTrendsText}>View Trends</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 20 }} />
          ) : waterData.entries.length > 0 ? (
            waterData.entries.map((entry, index) => (
              <View key={entry.id || index} style={styles.logEntry}>
                <View style={styles.entryLeft}>
                  <View style={[styles.entryIconContainer, { backgroundColor: index % 2 === 0 ? '#E0F2FE' : '#FEF3C7' }]}>
                    <Icon 
                      name={index % 2 === 0 ? "water-outline" : "cafe-outline"} 
                      size={20} 
                      color={index % 2 === 0 ? "#0EA5E9" : "#D97706"} 
                    />
                  </View>
                  <View>
                    <Text style={styles.entryTitle}>{entry.amount}ml {index % 2 === 0 ? 'Hydration' : 'Refill'}</Text>
                    <Text style={styles.entrySubtitle}>{index % 2 === 0 ? 'Afternoon Run' : 'Routine'}</Text>
                  </View>
                </View>
                <Text style={styles.entryTime}>
                  {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hydration logged today yet.</Text>
            </View>
          )}
        </View>

        {/* Pro Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Fuel your focus with H2O.</Text>
            <Text style={styles.tipDescription}>
              Proper hydration increases metabolic efficiency by up to 30% during high-intensity training.
            </Text>
          </View>
          <View style={styles.tipWaterDrop}>
            <Icon name="water" size={80} color="rgba(255,255,255,0.2)" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WaterTrackingScreen;
