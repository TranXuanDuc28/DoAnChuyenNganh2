import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import colors from '../theme/colors';
import { workoutAPI } from '../services/api';
import { styles } from './styles/CategoryExercisesScreen.styles';

const CategoryExercisesScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => {
        navigation.navigate('ExerciseDetail', { exercise: item });
      }}
    >
      <View style={styles.exerciseImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.exerciseImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.exerciseImagePlaceholder}>
            <Icon name="fitness-outline" size={32} color={colors.textSecondary} />
          </View>
        )}
      </View>

      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        
        {item.description && (
          <Text style={styles.exerciseDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.exerciseMeta}>
          {item.difficulty && (
            <View style={styles.metaItem}>
              <Icon
                name="speedometer-outline"
                size={14}
                color={getDifficultyColor(item.difficulty)}
              />
              <Text style={[styles.metaText, { color: getDifficultyColor(item.difficulty) }]}>
                {getDifficultyLabel(item.difficulty)}
              </Text>
            </View>
          )}

          {item.sets && item.reps && (
            <View style={styles.metaItem}>
              <Icon name="repeat-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>
                {item.sets} × {item.reps}
              </Text>
            </View>
          )}

          {item.duration > 0 && (
            <View style={styles.metaItem}>
              <Icon name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{item.duration}s</Text>
            </View>
          )}

          {item.caloriesPerMinute > 0 && (
            <View style={styles.metaItem}>
              <Icon name="flame-outline" size={14} color={colors.iconWarning} />
              <Text style={styles.metaText}>
                {item.caloriesPerMinute} cal/phút
              </Text>
            </View>
          )}
        </View>

        {item.equipment && Array.isArray(item.equipment) && item.equipment.length > 0 && (
          <View style={styles.equipmentContainer}>
            <Icon name="barbell-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.equipmentText} numberOfLines={1}>
              {item.equipment.join(', ')}
            </Text>
          </View>
        )}
      </View>

      <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

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
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{category.name}</Text>
          {category.englishName && (
            <Text style={styles.headerSubtitle}>{category.englishName}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={fetchExercises}>
          <Icon name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải bài tập...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color={colors.iconDanger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchExercises}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="fitness-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                Chưa có bài tập nào trong danh mục này
              </Text>
            </View>
          }
          ListHeaderComponent={
            exercises.length > 0 ? (
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  {exercises.length} bài tập
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default CategoryExercisesScreen;

/*
// Styles moved to ./styles/CategoryExercisesScreen.styles.js
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  listHeader: {
    marginBottom: 12,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  exerciseImageContainer: {
    marginRight: 12,
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  exerciseImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.cardDarkLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  equipmentText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
*/

