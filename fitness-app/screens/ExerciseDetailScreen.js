import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { workoutAPI } from '../services/api';
import { styles } from './styles/ExerciseDetailScreen.styles';

// Fallback images if backend doesn't provide one
const FALLBACK_HERO = { uri: 'file:///C:/Users/MSI/.gemini/antigravity/brain/7647c6b0-d41e-4c7a-b9d1-e8b86eacb17e/workout_hero_muscular_1775410935179.png' };
const FALLBACK_THUMB = { uri: 'file:///C:/Users/MSI/.gemini/antigravity/brain/7647c6b0-d41e-4c7a-b9d1-e8b86eacb17e/exercise_squat_thumb_1775410955415.png' };

const EQUIPMENT_ICONS = {
  'dumbbells': 'barbell',
  'barbell': 'remove',
  'bench': 'square-outline',
  'resistance band': 'infinite',
  'kettlebell': 'medical',
  'mat': 'reorder-four',
  'pull-up bar': 'stats-chart',
};

const ExerciseDetailScreen = ({ route, navigation }) => {
  const { exercise } = route.params;
  const [relatedExercises, setRelatedExercises] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    fetchRelatedExercises();
  }, [exercise.id]);

  const fetchRelatedExercises = async () => {
    // Try to find a valid category ID
    const categoryId = exercise.exerciseCategoryId || (exercise.categories && exercise.categories[0]?.id);
    
    if (!categoryId) return;

    setLoadingRelated(true);
    try {
      const { data } = await workoutAPI.getExercises({ categoryId, limit: 10 });
      // Filter out current exercise and take top 4
      const filtered = (data || [])
        .filter(ex => ex.id !== exercise.id)
        .slice(0, 4);
      setRelatedExercises(filtered);
    } catch (error) {
      console.error('Failed to load related exercises:', error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.topHeader}>
      <TouchableOpacity style={styles.brandRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Icon name="arrow-back" size={22} color="#FF6B35" />
        <Text style={styles.brandText}>FITLIFE</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
        <Icon name="notifications-outline" size={24} color="#111827" />
      </TouchableOpacity>
    </View>
  );

  const renderHero = () => {
    const calories = exercise.caloriesPerMinute
      ? Math.floor(exercise.caloriesPerMinute * (exercise.duration || 15))
      : 320;

    return (
      <View style={styles.heroSection}>
        <Image
          source={exercise.imageUrl ? { uri: exercise.imageUrl } : FALLBACK_HERO}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.8)']}
          style={styles.heroGradient}
        >
          <View style={styles.tagRow}>
            <View style={styles.strengthTag}>
              <Text style={styles.strengthTagText}>
                {(exercise.difficulty || 'BEGINNER').toUpperCase()} STRENGTH
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="time-outline" size={16} color="#FFF" />
              <Text style={styles.metaText}>{exercise.duration || 15} MINS</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="flame-outline" size={16} color="#FFF" />
              <Text style={styles.metaText}>{calories} KCAL</Text>
            </View>
          </View>
          <Text style={styles.workoutTitle}>{exercise.name?.toUpperCase() || 'EXERCISE'}</Text>
        </LinearGradient>
      </View>
    );
  };

  const renderObjective = () => (
    <View style={styles.objectiveContainer}>
      <View style={styles.objectiveCard}>
        <Text style={styles.sectionLabel}>THE OBJECTIVE</Text>
        <Text style={styles.objectiveBody}>
          {exercise.description || 'A targeted session designed to maximize results through perfect form and controlled execution. We focus on efficiency and peak muscle activation.'}
        </Text>
      </View>
    </View>
  );

  const renderIntensity = () => {
    const focusAreas = Array.isArray(exercise.muscleGroups) ? exercise.muscleGroups : ['FULL BODY'];
    const barCount = exercise.difficulty?.toLowerCase() === 'advanced' ? 5 : exercise.difficulty?.toLowerCase() === 'intermediate' ? 3 : 1;

    return (
      <View style={styles.intensitySection}>
        <View style={styles.intensityCard}>
          <View style={styles.intensityRow}>
            <Text style={styles.intensityLabel}>DIFFICULTY</Text>
            <View style={styles.intensityBarContainer}>
              {[1, 2, 3, 4, 5].map((idx) => (
                <View
                  key={idx}
                  style={[styles.intensityBar, idx <= barCount && styles.intensityBarActive]}
                />
              ))}
            </View>
          </View>

          <View style={styles.intensityRow}>
            <Text style={styles.intensityLabel}>FOCUS AREAS</Text>
            <View style={styles.focusRow}>
              {focusAreas.map(tag => (
                <View key={tag} style={styles.focusTag}>
                  <Text style={styles.focusTagText}>{tag.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEquipment = () => {
    const equipment = Array.isArray(exercise.equipment) ? exercise.equipment : [];

    return (
      <View style={styles.equipmentSection}>
        <View style={styles.equipmentHeader}>
          <Text style={styles.sectionTitle}>EQUIPMENT NEEDED</Text>
          <Text style={styles.itemCount}>{equipment.length} Items</Text>
        </View>

        <View style={styles.equipmentGrid}>
          {equipment.length > 0 ? (
            equipment.map((name, index) => (
              <View key={index} style={styles.equipmentItem}>
                <Icon
                  name={EQUIPMENT_ICONS[name.toLowerCase()] || 'fitness'}
                  size={28}
                  color="#FF6B35"
                  style={styles.equipmentIcon}
                />
                <Text style={styles.equipmentName}>{name.toUpperCase()}</Text>
              </View>
            ))
          ) : (
            <View style={styles.equipmentItem}>
              <Icon name="checkmark-circle-outline" size={28} color="#FF6B35" style={styles.equipmentIcon} />
              <Text style={styles.equipmentName}>NO EQUIPMENT</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderProgram = () => {
    if (relatedExercises.length === 0 && !loadingRelated) return null;

    return (
      <View style={styles.programSection}>
        <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>RECOMMENDED WORKOUTS</Text>

        {relatedExercises.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.exerciseCard}
            activeOpacity={0.9}
            onPress={() => navigation.push('ExerciseDetail', { exercise: item })}
          >
            <Image
              source={item.imageUrl ? { uri: item.imageUrl } : FALLBACK_THUMB}
              style={styles.exerciseThumb}
              resizeMode="cover"
            />
            <View style={styles.exerciseInfo}>
              <View style={styles.exerciseTopRow}>
                <Text style={styles.exerciseName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.exerciseNumber}>{index + 1 < 10 ? `0${index + 1}` : index + 1}</Text>
              </View>
              <Text style={styles.exerciseStats}>
                {item.duration || 15} MIN • {item.difficulty?.toUpperCase() || 'MODERATE'}
              </Text>
              <View style={styles.exerciseTip}>
                <Icon name="radio-button-on" size={10} color="#FF6B35" />
                <Text style={styles.exerciseTipText}>
                  {Array.isArray(item.tips) && item.tips.length > 0 ? item.tips[0] : 'FOCUS ON PERFECT FORM'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {loadingRelated && <ActivityIndicator color="#FF6B35" style={{ marginTop: 10 }} />}
      </View>
    );
  };
   

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      {renderHeader()}

      <ScrollView
        vertical
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderHero()}
        {renderObjective()}
        {renderIntensity()}
        {renderEquipment()}
        {renderProgram()}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PoseGuide', { exercise })}
        >
          <Text style={styles.startBtnText}>START WORKOUT</Text>
          <Icon name="play-forward" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExerciseDetailScreen;
