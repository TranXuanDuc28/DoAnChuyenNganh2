import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles/WorkoutCompleteScreen.styles';

const WorkoutCompleteScreen = ({ route, navigation }) => {
  // Extract summary data from route params
  const {
    calories = 350,
    duration = 45,
    exerciseCount = 6,
    plan = null, // Receive plan object
    sessionData = {}
  } = route.params || {};

  const handleDone = () => {
    navigation.navigate('WorkoutReview', {
      calories,
      duration,
      exerciseCount,
      plan, // Pass plan along to review
      sessionData
    });
  };

  const handleBack = () => {
    // If we have a plan, return to it, otherwise go to dashboard
    if (plan) {
      navigation.navigate('WorkoutPlanDetail', { plan });
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const handleViewDetails = () => {
    // Navigate to WorkoutHistoryDetail with the session data
    navigation.navigate('WorkoutHistoryDetail', { session: sessionData });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Icon name="chevron-back" size={24} color="#A8390D" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Summary</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Section */}
        <View style={styles.successSection}>
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={['#FFDBD0', '#FFE8E1']}
              style={StyleSheet.absoluteFill}
            />
            <Icon
              name="checkmark-circle"
              size={80}
              color="#A8390D"
            />
          </View>

          <Text style={styles.congratsTitle}>
            Workout Completed{"\n"}🎉
          </Text>

          <Text style={styles.congratsSubtitle}>
            You absolutely crushed it today.
          </Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsBlurBlob} />

          <View style={styles.statGroup}>
            <Text style={styles.statLabel}>Calories</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{calories}</Text>
              <Text style={styles.statUnit}>kcal</Text>
            </View>
          </View>

          <View style={styles.statGroup}>
            <Text style={styles.statLabel}>Duration</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{duration}</Text>
              <Text style={styles.statUnit}>min</Text>
            </View>
          </View>

          <View style={styles.statLastGroup}>
            <Text style={styles.statLabel}>Exercises</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{exerciseCount}</Text>
              <Text style={styles.statUnit}>completed</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewDetails}
        >
          <Text style={styles.primaryButtonText}>View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleDone}
        >
          <Text style={styles.secondaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkoutCompleteScreen;
