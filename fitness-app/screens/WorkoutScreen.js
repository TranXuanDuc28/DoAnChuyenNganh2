import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import { workoutAPI } from '../services/api';
import { styles } from './styles/WorkoutScreen.styles';

const WorkoutScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseCategories, setExerciseCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // AI Workout Plan states
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Workout location preferences
  const [workoutAtGym, setWorkoutAtGym] = useState(true);
  const [workoutAtHome, setWorkoutAtHome] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError('');
      try {
        const { data } = await workoutAPI.getExerciseCategories();
        const normalized = (data || []).map((item) => ({
          id: item.id,
          name: item.name,
          englishName: item.englishName || item.english_name,
          imageUrl: item.imageUrl || item.image_url,
          imageKey: item.imageKey || item.image_key,
          backgroundColor: item.backgroundColor || item.background_color || '#f1f5f9',
          exerciseCount: Number(item.exerciseCount ?? 0),
        }));
        setExerciseCategories(normalized);
      } catch (error) {
        console.error('Failed to load exercise categories', error);
        setCategoriesError('Unable to load exercise categories. Pull down to retry.');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch workout plans
  useEffect(() => {
    if (selectedTab === 'plans') {
      fetchWorkoutPlans();
    }
  }, [selectedTab]);

  const fetchWorkoutPlans = async () => {
    setPlansLoading(true);
    try {
      // Fetch active plan
      const activeResponse = await workoutAPI.getActiveWorkoutPlan();
      if (activeResponse.data.success && activeResponse.data.data) {
        setActiveWorkoutPlan(activeResponse.data.data);
      }

      // Fetch all plans
      const allPlansResponse = await workoutAPI.getAllWorkoutPlans();
      if (allPlansResponse.data.success) {
        setWorkoutPlans(allPlansResponse.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load workout plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleGenerateWorkoutPlan = async () => {
    // Validate that at least one location is selected
    if (!workoutAtGym && !workoutAtHome) {
      alert('Please select at least one workout location (At Gym or At Home)');
      return;
    }

    setGeneratingPlan(true);
    try {
      const preferences = {
        duration: 4, // 4 weeks
        frequency: 4, // 4 workouts per week
        goal: 'general_fitness',
        focusAreas: [],
        workoutLocation: {
          atGym: workoutAtGym,
          atHome: workoutAtHome
        }
      };

      const response = await workoutAPI.generateAIWorkoutPlan(preferences);

      if (response.data.success) {
        setActiveWorkoutPlan(response.data.data);
        await fetchWorkoutPlans(); // Refresh list
        alert('Workout plan created successfully!');
      }
    } catch (error) {
      console.error('Failed to generate workout plan:', error);
      alert('Failed to create workout plan. Please try again.');
    } finally {
      setGeneratingPlan(false);
    }
  };


  // History state
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch history when tab changes
  useEffect(() => {
    if (selectedTab === 'history') {
      fetchHistory();
    }
  }, [selectedTab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await workoutAPI.getWorkoutHistory();
      if (response.data.success) {
        setRecentWorkouts(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const tabs = [
    { id: 'plans', title: 'Plans', icon: 'list' },
    { id: 'history', title: 'History', icon: 'time' },
    { id: 'exercises', title: 'Exercises', icon: 'fitness' },
  ];

  const renderAIWorkoutPlan = () => {
    if (!activeWorkoutPlan) {
      return (
        <View style={styles.emptyPlanContainer}>
          <Icon name="fitness-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyPlanTitle}>No Workout Plan Yet</Text>
          <Text style={styles.emptyPlanText}>
            Create a personalized AI workout plan based on your goals and preferences
          </Text>

          {/* Workout Location Checkboxes */}
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Where do you want to workout?</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setWorkoutAtGym(!workoutAtGym)}
              >
                <View style={[styles.checkbox, workoutAtGym && styles.checkboxChecked]}>
                  {workoutAtGym && <Icon name="checkmark" size={16} color={colors.textOnPrimary} />}
                </View>
                <Icon name="barbell" size={20} color={colors.white} style={styles.checkboxIcon} />
                <Text style={styles.checkboxLabel}>At Gym</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setWorkoutAtHome(!workoutAtHome)}
              >
                <View style={[styles.checkbox, workoutAtHome && styles.checkboxChecked]}>
                  {workoutAtHome && <Icon name="checkmark" size={16} color={colors.textOnPrimary} />}
                </View>
                <Icon name="home" size={20} color={colors.white} style={styles.checkboxIcon} />
                <Text style={styles.checkboxLabel}>At Home</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateWorkoutPlan}
            disabled={generatingPlan}
          >
            {generatingPlan ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <>
                <Icon name="sparkles" size={20} color={colors.textOnPrimary} />
                <Text style={styles.generateButtonText}>Generate AI Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    const currentDay = activeWorkoutPlan.currentDay;
    const progressPercentage = activeWorkoutPlan.progressPercentage || 0;

    return (
      <View>
        {/* Active Plan Card */}
        <TouchableOpacity
          style={styles.activePlanCard}
          onPress={() => navigation.navigate('WorkoutPlanDetail', { plan: activeWorkoutPlan })}
        >
          <View style={styles.planHeader}>
            <View style={styles.planIconContainer}>
              <Icon name="barbell" size={28} color={colors.primary} />
            </View>
            <View style={styles.planHeaderInfo}>
              <Text style={styles.planName}>{activeWorkoutPlan.name}</Text>
              <Text style={styles.planMeta}>
                {activeWorkoutPlan.duration} weeks • {activeWorkoutPlan.frequency} sessions/week
              </Text>
            </View>
            {activeWorkoutPlan.aiGenerated && (
              <View style={styles.aiBadge}>
                <Icon name="sparkles" size={12} color={colors.textOnPrimary} />
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {activeWorkoutPlan.completedDays}/{activeWorkoutPlan.totalDays} days completed
            </Text>
          </View>

          {/* Current Day */}
          {currentDay && (
            <View style={styles.currentDayContainer}>
              <View style={styles.currentDayHeader}>
                <Icon name="today" size={18} color={colors.primary} />
                <Text style={styles.currentDayLabel}>Today</Text>
              </View>
              <Text style={styles.currentDayName}>{currentDay.dayName}</Text>
              <Text style={styles.currentDayFocus}>{currentDay.focusArea}</Text>
              <View style={styles.currentDayStats}>
                <View style={styles.currentDayStat}>
                  <Icon name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.currentDayStatText}>{currentDay.totalDuration} min</Text>
                </View>
                <View style={styles.currentDayStat}>
                  <Icon name="flame-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.currentDayStatText}>{currentDay.estimatedCalories} cal</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.planFooter}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="chevron-forward" size={18} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Generate New Plan Button */}
        <TouchableOpacity
          style={styles.generateNewButton}
          onPress={handleGenerateWorkoutPlan}
          disabled={generatingPlan}
        >
          <Icon name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.generateNewButtonText}>Create New Plan</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRecentWorkout = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyIcon}>
        <Icon name="checkmark-circle" size={24} color={colors.success} />
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle}>{item.name}</Text>
        <Text style={styles.historySubtitle}>{item.date}</Text>
      </View>
      <View style={styles.historyStats}>
        <Text style={styles.historyDuration}>{item.duration}</Text>
        <Text style={styles.historyCalories}>{item.calories} cal</Text>
      </View>
    </View>
  );

  const getCategoryImageSource = (category) => {
    if (category.imageUrl) {
      return { uri: category.imageUrl };
    }
    return null;
  };

  const renderExerciseCategory = ({ item }) => {
    const imageSource = getCategoryImageSource(item);

    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => {
          navigation.navigate('CategoryExercises', { category: item });
        }}
      >
        <View style={styles.categoryIconContainer}>
          {imageSource ? (
            <View style={styles.muscleImageWrapper}>
              <Image
                source={imageSource}
                style={styles.muscleImage}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.muscleIconPlaceholder}>
              <Icon name="body-outline" size={32} color={colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          {item.englishName && (
            <Text style={styles.categoryEnglishName}>{item.englishName}</Text>
          )}
          {item.exerciseCount > 0 && (
            <Text style={styles.categorySubtext}>
              {item.exerciseCount} exercises
            </Text>
          )}
        </View>
        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const filteredCategories = useMemo(
    () =>
      exerciseCategories.filter((category) => {
        const query = searchQuery.toLowerCase();
        return (
          category.name?.toLowerCase().includes(query) ||
          category.englishName?.toLowerCase().includes(query)
        );
      }),
    [exerciseCategories, searchQuery]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workouts</Text>

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
              size={18}
              color={selectedTab === tab.id ? colors.textOnPrimary : colors.textSecondary}
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

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedTab === 'plans' && (
          <View>
            {plansLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading plans...</Text>
              </View>
            ) : (
              renderAIWorkoutPlan()
            )}
          </View>
        )}

        {selectedTab === 'history' && (
          <View>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {historyLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : recentWorkouts.length > 0 ? (
              <FlatList
                data={recentWorkouts}
                renderItem={({ item }) => (
                  <View style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Icon name="checkmark-circle" size={24} color={colors.success} />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle}>{item.name}</Text>
                      <Text style={styles.historySubtitle}>
                        {new Date(item.date).toLocaleDateString('vi-VN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      {item.planName && (
                        <Text style={[styles.historySubtitle, { fontSize: 12, color: colors.primary }]}>
                          {item.planName} - {item.dayName}
                        </Text>
                      )}
                      {(item.sets || item.weight) && (
                        <Text style={[styles.historySubtitle, { fontSize: 11, color: colors.textSecondary }]}>
                          {item.sets && item.reps ? `${item.sets} sets × ${item.reps} reps` : ''}
                          {item.weight ? ` • ${item.weight}kg` : ''}
                        </Text>
                      )}
                    </View>
                    <View style={styles.historyStats}>
                      <Text style={styles.historyDuration}>{item.duration}</Text>
                      <Text style={styles.historyCalories}>{item.calories} cal</Text>
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.emptyState}>No recent workouts found</Text>
            )}
          </View>
        )}

        {selectedTab === 'exercises' && (
          <View>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {categoriesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : categoriesError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{categoriesError}</Text>
              </View>
            ) : (
              <FlatList
                data={filteredCategories}
                renderItem={renderExerciseCategory}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.categoryList}
                ListEmptyComponent={
                  <Text style={styles.emptyState}>No matching categories found.</Text>
                }
              />
            )}
          </View>
        )}
      </ScrollView>

    </View>
  );
};

export default WorkoutScreen;
