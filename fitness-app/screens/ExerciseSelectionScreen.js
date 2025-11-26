import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import { styles } from './styles/ExerciseSelectionScreen.styles';

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

export default ExerciseSelectionScreen;

