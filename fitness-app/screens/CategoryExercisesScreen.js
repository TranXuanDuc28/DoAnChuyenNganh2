import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import colors from '../theme/colors';
import { workoutAPI } from '../services/api';
import { styles } from './styles/CategoryExercisesScreen.styles';

const FILTERS = ['All Workouts', 'Beginner', 'Intermediate', 'Advanced'];

const CategoryExercisesScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Workouts');

  useEffect(() => {
    fetchExercises();
  }, [category.id]);

  const fetchExercises = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await workoutAPI.getExercises({ categoryId: category.id });
      console.log(`Loaded ${data?.length || 0} exercises for category ${category.name}`);
      setExercises(data || []);
    } catch (err) {
      console.error('Failed to load exercises:', err);
      setError('Không thể tải danh sách bài tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'Easy';
      case 'intermediate': return 'Med';
      case 'advanced': return 'Hard';
      case 'hardcore': return 'Extreme';
      default: return difficulty || 'N/A';
    }
  };

  // Filter exercises
  const filteredExercises = exercises.filter(ex => {
    if (activeFilter === 'All Workouts') return true;
    if (activeFilter === 'Beginner' && ex.difficulty?.toLowerCase() === 'beginner') return true;
    if (activeFilter === 'Intermediate' && ex.difficulty?.toLowerCase() === 'intermediate') return true;
    if (activeFilter === 'Advanced' && ex.difficulty?.toLowerCase() === 'advanced') return true;
    return false;
  });

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => navigation.navigate('ExerciseDetail', { exercise: item })}
      activeOpacity={0.8}
    >
      <View style={styles.exerciseCardImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.exerciseImage} resizeMode="cover" />
        ) : (
          <View style={[styles.exerciseImage, { backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' }]}>
            <Icon name="image-outline" size={48} color="#475569" />
          </View>
        )}
        
        {/* Difficulty Badge overlay */}
        {item.difficulty && (
          <View style={styles.difficultyBadgeImage}>
            <Text style={styles.difficultyBadgeTextImage}>{item.difficulty}</Text>
          </View>
        )}
      </View>

      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName} numberOfLines={1}>{item.name}</Text>
        
        <View style={styles.exerciseMeta}>
          <View style={styles.metaItem}>
            <Icon name="time-outline" size={16} color="#FF794A" />
            <Text style={styles.metaText}>
              {item.duration > 0 ? `${Math.floor(item.duration / 60)} MIN` : '15 MIN'}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Icon name="flame-outline" size={16} color="#FF794A" />
            <Text style={styles.metaText}>
              {item.caloriesPerMinute ? `${Math.floor(item.caloriesPerMinute * (item.duration > 0 ? item.duration / 60 : 15))} KCAL` : '320 KCAL'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Icon name="barbell-outline" size={16} color="#FF794A" />
            <Text style={styles.metaText}>{getDifficultyLabel(item.difficulty)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={{ marginBottom: 8 }}>
      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <Text style={styles.heroBackgroundText}>HIIT</Text>
        <View style={styles.heroContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>CATEGORY</Text>
          </View>
          <Text style={styles.heroTitle}>{category.name}</Text>
          <Text style={styles.heroDesc}>
            {category.description || 'High Intensity Interval Training designed to push your limits and maximize caloric burn in record time.'}
          </Text>
          <View style={styles.heroLinkContainer}>
            <Text style={styles.heroLinkText}>
              {category.englishName || 'HIITWORK.COM'}
            </Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          {FILTERS.map((filter, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backIconRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-back" size={24} color="#FF794A" />
          <Text style={styles.brandText}>FITLIFE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
          <Icon name="notifications-outline" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF794A" />
          <Text style={styles.emptyText}>Đang tải bài tập...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={{ marginTop: 16 }} onPress={fetchExercises}>
            <Text style={{ color: '#FF794A', fontWeight: 'bold' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="fitness-outline" size={64} color="#94A3B8" />
              <Text style={styles.emptyText}>Không tìm thấy bài tập nào.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Icon name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default CategoryExercisesScreen;
