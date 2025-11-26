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
    // =====================================
    // 🎯 START FEATURE — chức năng hệ thống
    // =====================================
    {
      id: 'start-pose',
      name: 'Bắt đầu nhận diện',
      color: colors.iconInfo,
      gradient: [colors.iconInfo, colors.iconSuccess],
      icon: '🚀',
      description: 'Khởi động camera và bắt đầu phân tích tư thế',
      mode: 'system', // 🚀 Thêm loại chức năng
    },

    // =====================================
    // 🧘 Yoga – Nhận diện bằng ảnh (image)
    // =====================================
    {
      id: 'Tree_Pose',
      name: 'Tree Pose',
      color: colors.primary,
      gradient: [colors.warning, colors.iconWarning],
      icon: '🌳',
      description: 'Tư thế cái cây - cải thiện thăng bằng và sức mạnh chân',
      mode: 'image',
    },
    {
      id: 'Half_Moon_Pose',
      name: 'Half Moon Pose',
      color: colors.primary,
      gradient: [colors.warning, colors.iconWarning],
      icon: '🌙',
      description: 'Tư thế bán nguyệt - tăng sức mạnh chân và cải thiện thăng bằng',
      mode: 'image',
    },
    {
      id: 'Butterfly_Pose',
      name: 'Butterfly Pose',
      color: colors.primary,
      gradient: [colors.warning, colors.iconWarning],
      icon: '🦋',
      description: 'Tư thế con bướm - mở hông và kéo giãn đùi trong',
      mode: 'image',
    },
    {
      id: 'Downward_Facing_Dog',
      name: 'Downward Facing Dog',
      color: colors.primary,
      gradient: [colors.warning, colors.iconWarning],
      icon: '🐶',
      description: 'Tư thế chó úp mặt - kéo giãn và tăng sức mạnh toàn thân',
      mode: 'image',
    },
    {
      id: 'Dancer_Pose',
      name: 'Dancer Pose',
      color: colors.primary,
      gradient: [colors.warning, colors.iconWarning],
      icon: '💃',
      description: 'Tư thế vũ công - tăng sự dẻo dai và tập trung',
      mode: 'image',
    },
    {
      id: 'Triangle_Pose',
      name: 'Triangle Pose',
      color: colors.primary,
      gradient: [colors.warning, colors.iconWarning],
      icon: '🔺',
      description: 'Tư thế tam giác - kéo giãn hai bên thân và mạnh chân',
      mode: 'image',
    },
    {
      id: 'Goddess_Pose',
      name: 'Goddess Pose',
      color: colors.primary,
      gradient: [colors.warning, colors.iconWarning],
      icon: '👑',
      description: 'Tư thế nữ thần - tăng sức mạnh thân dưới',
      mode: 'image',
    },
    {
      id: 'Warrior_Pose',
      name: 'Warrior Pose',
      color: colors.primary,
      gradient: [colors.warning, colors.iconWarning],
      icon: '⚔️',
      description: 'Tư thế chiến binh - tăng sức mạnh và độ bền',
      mode: 'image',
    },

    // =====================================
    // 🏋️ Bài tập động – cần video (video)
    // =====================================
    {
      id: 'push-ups',
      name: 'Push Ups',
      color: colors.primary,
      gradient: [colors.primaryDark, colors.primary],
      icon: '🏋️',
      description: 'Chống đẩy',
      mode: 'video',
    },
    {
      id: 'squats',
      name: 'Squats',
      color: colors.primary,
      gradient: [colors.primaryDark, colors.primary],
      icon: '🦵',
      description: 'Ngồi xổm',
      mode: 'video',
    },
    {
      id: 'plank',
      name: 'Plank',
      color: colors.iconSuccess,
      gradient: [colors.warning, colors.iconWarning],
      icon: '🤸',
      description: 'Tư thế Tấm ván',
      mode: 'video',
    },
    {
      id: 'jumping-jack',
      name: 'Jumping Jack',
      color: colors.primary,
      gradient: [colors.primaryDark, colors.primary],
      icon: '🤸',
      description: 'Nhảy dây',
      mode: 'video',
    },
  ];

  const handleExercisePress = (exercise) => {
    if (exercise.id === 'start-pose') {
      navigation.navigate('Pose');
    } else {
      navigation.navigate('PoseHistory', {
        exerciseName: exercise.id,
        exerciseTitle: exercise.name,
        exerciseMode: exercise.mode,
      });
    }
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
