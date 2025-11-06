import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';

const ExerciseSelectionScreen = () => {
  const navigation = useNavigation();

  const exercises = [
    {
      id: 'push-ups',
      name: 'Push Ups',
      color: colors.primary,
      gradient: [colors.primaryDark, colors.primary],
      icon: '🏋️',
      description: 'Chống đẩy',
    },
    {
      id: 'squats',
      name: 'Squats',
      color: colors.primary,
      gradient: [colors.primaryDark, colors.primary],
      icon: '🦵',
      description: 'Ngồi xổm',
    },
    {
      id: 'plank',
      name: 'Plank',
      color: colors.iconSuccess,
      gradient: [colors.success, colors.iconSuccess],
      icon: '🤸',
      description: 'Tư thế Tấm ván',
    },
    {
      id: 'plank-to-downward-dog',
      name: 'Plank to Downward Dog',
      color: colors.iconWarning,
      gradient: [colors.warning, colors.iconWarning],
      icon: '🧘',
      description: 'Tư thế Tấm ván sang Chó úp mặt',
    },
    {
      id: 'jumping-jack',
      name: 'Jumping Jack',
      color: colors.primary,
      gradient: [colors.primaryDark, colors.primary],
      icon: '🤸',
      description: 'Nhảy dây',
    },
  ];

  const handleExercisePress = (exercise) => {
    navigation.navigate('Pose', { exerciseName: exercise.id, exerciseTitle: exercise.name });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
      >
        <Text style={styles.title}>AI Workout</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {exercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => handleExercisePress(exercise)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={exercise.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <View style={styles.exerciseIconContainer}>
                  <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },
  exerciseCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cardGradient: {
    minHeight: 140,
    padding: 20,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseIcon: {
    fontSize: 40,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  arrow: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default ExerciseSelectionScreen;

