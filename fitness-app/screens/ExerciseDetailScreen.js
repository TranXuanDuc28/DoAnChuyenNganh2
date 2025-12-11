import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons as Icon } from '@expo/vector-icons';
import colors from '../theme/colors';
import { styles } from './styles/ExerciseDetailScreen.styles';

const { width } = Dimensions.get('window');

const ExerciseDetailScreen = ({ route, navigation }) => {
  const { exercise } = route.params;
  const [activeTab, setActiveTab] = useState('instructions'); // instructions, tips

  // Debug: Log exercise data to check if instructions and tips exist
  console.log('Exercise data:', {
    name: exercise.name,
    hasInstructions: !!exercise.instructions,
    instructionsLength: exercise.instructions?.length || 0,
    instructions: exercise.instructions,
    hasTips: !!exercise.tips,
    tipsLength: exercise.tips?.length || 0,
    tips: exercise.tips
  });

  // Create video player instance only if videoUrl exists
  const player = exercise.videoUrl
    ? useVideoPlayer(exercise.videoUrl, player => {
      player.loop = true;
    })
    : null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return colors.iconSuccess;
      case 'intermediate':
        return colors.iconWarning;
      case 'advanced':
        return colors.iconDanger;
      default:
        return colors.textSecondary;
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung bình';
      case 'advanced':
        return 'Nâng cao';
      default:
        return difficulty;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chi tiết bài tập</Text>

        <TouchableOpacity style={styles.headerButton}>
          <Icon name="heart-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Video */}
        <View style={styles.videoContainer}>
          {exercise.videoUrl && player ? (
            <VideoView
              player={player}
              style={styles.exerciseVideo}
              contentFit="contain"
              nativeControls
            />
          ) : exercise.imageUrl ? (
            <Image
              source={{ uri: exercise.imageUrl }}
              style={styles.exerciseVideo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Icon name="videocam-outline" size={80} color={colors.textSecondary} />
              <Text style={styles.placeholderText}>Chưa có video hướng dẫn</Text>
            </View>
          )}
        </View>

        {/* Exercise Info */}
        <View style={styles.infoSection}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>

          {exercise.description && (
            <Text style={styles.exerciseDescription}>{exercise.description}</Text>
          )}

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            {exercise.difficulty && (
              <View style={styles.statItem}>
                <Icon
                  name="speedometer-outline"
                  size={20}
                  color={getDifficultyColor(exercise.difficulty)}
                />
                <Text style={[styles.statLabel, { color: getDifficultyColor(exercise.difficulty) }]}>
                  {getDifficultyLabel(exercise.difficulty)}
                </Text>
              </View>
            )}

            {exercise.sets && exercise.reps && (
              <View style={styles.statItem}>
                <Icon name="repeat-outline" size={20} color={colors.primary} />
                <Text style={styles.statValue}>
                  {exercise.sets} × {exercise.reps}
                </Text>
              </View>
            )}

            {exercise.duration > 0 && (
              <View style={styles.statItem}>
                <Icon name="time-outline" size={20} color={colors.primary} />
                <Text style={styles.statValue}>{exercise.duration}s</Text>
              </View>
            )}
          </View>

          {/* Additional Info */}
          {exercise.restTime > 0 && (
            <View style={styles.infoRow}>
              <Icon name="pause-circle-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>Thời gian nghỉ: {exercise.restTime}s</Text>
            </View>
          )}

          {exercise.caloriesPerMinute > 0 && (
            <View style={styles.infoRow}>
              <Icon name="flame-outline" size={18} color={colors.iconWarning} />
              <Text style={styles.infoText}>
                Calories: ~{exercise.caloriesPerMinute} cal/phút
              </Text>
            </View>
          )}

          {exercise.equipment && Array.isArray(exercise.equipment) && exercise.equipment.length > 0 && (
            <View style={styles.infoRow}>
              <Icon name="barbell-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Thiết bị: {exercise.equipment.join(', ')}
              </Text>
            </View>
          )}

          {/* Muscle Groups */}
          {exercise.categories && Array.isArray(exercise.categories) && exercise.categories.length > 0 && (
            <View style={styles.muscleSection}>
              <Text style={styles.sectionTitle}>Nhóm cơ</Text>
              <View style={styles.muscleTagsContainer}>
                {exercise.categories.map((category) => (
                  <View key={category.id} style={styles.muscleTag}>
                    <Text style={styles.muscleTagText}>{category.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'instructions' && styles.activeTab]}
            onPress={() => setActiveTab('instructions')}
          >
            <Text style={[styles.tabText, activeTab === 'instructions' && styles.activeTabText]}>
              Hướng dẫn
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tips' && styles.activeTab]}
            onPress={() => setActiveTab('tips')}
          >
            <Text style={[styles.tabText, activeTab === 'tips' && styles.activeTabText]}>
              Lưu ý
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'instructions' && (
            <View>
              {exercise.instructions && Array.isArray(exercise.instructions) && exercise.instructions.length > 0 ? (
                exercise.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Chưa có hướng dẫn chi tiết</Text>
              )}
            </View>
          )}

          {activeTab === 'tips' && (
            <View>
              {exercise.tips && Array.isArray(exercise.tips) && exercise.tips.length > 0 ? (
                exercise.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Icon name="checkmark-circle" size={20} color={colors.iconSuccess} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Chưa có lưu ý nào</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.startButton}>
          <Icon name="play" size={24} color="#fff" />
          <Text style={styles.startButtonText}>Bắt đầu tập luyện</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExerciseDetailScreen;

