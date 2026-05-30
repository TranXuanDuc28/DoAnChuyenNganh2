import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { LineChart } from 'react-native-chart-kit';
import { aiAPI, workoutAPI } from '../services/api';
import { styles } from './styles/NutritionScreen.styles';
import BarcodeScanner from '../components/BarcodeScanner';
import FoodDetailModal from '../components/FoodDetailModal';
import { useQuery } from '@tanstack/react-query';
import Skeleton from '../components/Skeleton';

const NutritionScreen = ({ navigation, route }) => {
  const [selectedView, setSelectedView] = useState('daily');


  // Modal States
  const [showScanner, setShowScanner] = useState(false);
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [scannedFood, setScannedFood] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh) {
        refetch();
        navigation.setParams({ refresh: false });
      }
    }, [route.params?.refresh, refetch])
  );

  const { 
    data: nutritionData, 
    isLoading: loading, 
    refetch,
    isRefetching: refreshing 
  } = useQuery({
    queryKey: ['nutritionData', selectedView],
    queryFn: async () => {
      const todayString = new Date().toISOString().split('T')[0];
      const [planResponse, logResponse, calorieResponse] = await Promise.all([
        aiAPI.getMealPlans(),
        aiAPI.getFoodLogs({ date: todayString }),
        workoutAPI.getTodayCalories()
      ]);

      let activePlan = null;
      let mealsArray = [];
      let goals = {
        calories: { consumed: 0, target: 1600 },
        protein: { consumed: 0, target: 120 },
        carbs: { consumed: 0, target: 200 },
        fat: { consumed: 0, target: 50 },
      };
      let burned = calorieResponse.data?.totalCalories || 220;

      if (planResponse.data.success && planResponse.data.mealPlans.length > 0) {
        activePlan = planResponse.data.mealPlans[0];
        let meals = activePlan.meals;
        if (typeof meals === 'string') meals = JSON.parse(meals);
        
        let dayIndex = 0;
        if (activePlan.startDate) {
          const startDate = new Date(activePlan.startDate);
          const today = new Date();
          startDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
          dayIndex = diffDays % (activePlan.duration || 7);
        }

        const todayData = Array.isArray(meals) ? meals[dayIndex] : { meals };
        if (todayData && todayData.meals) {
          const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
          let totalConsumed = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          
          if (logResponse.data.success && logResponse.data.data) {
            const logs = logResponse.data.data.logs || [];
            logs.forEach(log => {
              totalConsumed.calories += log.calories || 0;
              totalConsumed.protein += log.protein || 0;
              totalConsumed.carbs += log.carbs || 0;
              totalConsumed.fat += log.fat || 0;
            });
          }

          mealTypes.forEach((type) => {
            const meal = todayData.meals[type];
            if (meal) {
              const isLogged = logResponse.data.data?.logs?.some(l => l.mealType.toLowerCase() === type.toLowerCase()) || false;
              mealsArray.push({
                type: type,
                displayName: type.charAt(0).toUpperCase() + type.slice(1),
                name: meal.name,
                calories: meal.totalCalories || 0,
                protein: meal.macros?.protein || 0,
                carbs: meal.macros?.carbs || 0,
                fat: meal.macros?.fat || 0,
                time: meal.time || '09:00 AM',
                foods: meal.foods || [],
                logged: isLogged,
                icon: 'restaurant-outline',
                iconBg: '#F6F2F7',
                iconColor: '#A8390D',
              });
            }
          });

          goals = {
            calories: { consumed: totalConsumed.calories, target: activePlan.totalCalories || 1600 },
            protein: { consumed: totalConsumed.protein, target: activePlan.macronutrients?.protein?.grams || 120 },
            carbs: { consumed: totalConsumed.carbs, target: activePlan.macronutrients?.carbs?.grams || 200 },
            fat: { consumed: totalConsumed.fat, target: activePlan.macronutrients?.fat?.grams || 50 },
          };
        }
      }

      const weeklyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [1600, 1550, 1650, 1600, 1580, 1620, 1600] }]
      };

      return { activePlan, todayMeals: mealsArray, nutritionGoals: goals, burnedCalories: burned, weeklyData };
    }
  });

  const activePlan = nutritionData?.activePlan;
  const weeklyData = nutritionData?.weeklyData || {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [1600, 1550, 1650, 1600, 1580, 1620, 1600] }]
  };
  const todayMeals = nutritionData?.todayMeals || [];
  const nutritionGoals = nutritionData?.nutritionGoals || {
    calories: { consumed: 0, target: 1600 },
    protein: { consumed: 0, target: 120 },
    carbs: { consumed: 0, target: 200 },
    fat: { consumed: 0, target: 50 },
  };
  const burnedCalories = nutritionData?.burnedCalories || 0;

  const onRefresh = () => {
    refetch();
  };



  const getDefaultTime = (type) => {
    switch (type) {
      case 'breakfast': return '08:30 AM';
      case 'lunch': return '01:15 PM';
      case 'dinner': return '07:30 PM';
      case 'snack': return '04:00 PM';
      default: return '09:00 AM';
    }
  };

  const getMealIcon = (type) => {
    switch (type) {
      case 'breakfast': return 'sunny-outline';
      case 'lunch': return 'restaurant-outline';
      case 'dinner': return 'moon-outline';
      case 'snack': return 'fast-food-outline';
      default: return 'restaurant-outline';
    }
  };

  const getMealIconBg = (type) => {
    switch (type) {
      case 'breakfast': return '#FFF7ED';
      case 'lunch': return '#F0FDF4';
      case 'dinner': return '#EFF6FF';
      case 'snack': return '#FAF5FF';
      default: return '#F6F2F7';
    }
  };

  const getMealIconColor = (type) => {
    switch (type) {
      case 'breakfast': return '#F97316';
      case 'lunch': return '#22C55E';
      case 'dinner': return '#3B82F6';
      case 'snack': return '#A855F7';
      default: return '#A8390D';
    }
  };

  const handleMealPress = (mealData) => {
    navigation.navigate('MealDetail', { meal: mealData });
  };

  const toggleMealCompleted = async (type) => {
    try {
      const meal = todayMeals.find(m => m.type === type);
      if (!meal) return;

      if (!meal.logged) {
        // Logging the meal: Add to FoodLog
        const foodLogData = {
          foodName: meal.name,
          mealType: meal.type.charAt(0).toUpperCase() + meal.type.slice(1),
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          logDate: new Date().toISOString().split('T')[0],
          notes: 'Logged from AI Meal Plan'
        };

        const response = await aiAPI.addFoodLog(foodLogData);
        if (response.data.success) {
          refetch();
        }
      } else {
        // Unlogging the meal: Find the log and delete it
        const logResponse = await aiAPI.getFoodLogs({ date: new Date().toISOString().split('T')[0] });
        if (logResponse.data.success) {
          const logToDelete = logResponse.data.data.logs.find(
            l => l.mealType.toLowerCase() === type.toLowerCase() && l.foodName === meal.name
          );

          if (logToDelete) {
            const deleteResponse = await aiAPI.deleteFoodLog(logToDelete.id);
            if (deleteResponse.data.success) {
              refetch();
            }
          } else {
            refetch();
          }
        }
      }
    } catch (error) {
      console.error('Error toggling meal status:', error);
      Alert.alert('Error', 'Failed to update meal status. Please try again.');
    }
  };

  const handleBarcodeScanned = (foodData) => {
    setScannedFood(foodData);
    setShowFoodDetail(true);
  };

  const handleAddFoodFromModal = async (foodToAdd) => {
    try {
      const response = await aiAPI.addFoodLog(foodToAdd);
      if (response.data.success) {
        Alert.alert('Success', `${foodToAdd.name} added to ${foodToAdd.mealType}`);
        refetch();
      }
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  const renderCircularProgress = () => {
    const radius = 56;
    const stroke = 8;
    const normalizedRadius = 50;
    const circumference = normalizedRadius * 2 * Math.PI;

    const goal = nutritionGoals.calories.target;
    const consumed = nutritionGoals.calories.consumed;
    const burned = burnedCalories;
    const remaining = Math.max(0, goal - consumed + burned);

    const percentage = Math.min(100, (consumed / (goal + burned || 1)) * 100);
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.circleContainer}>
        {/* Background Circle */}
        <View style={styles.circleBackground} />

        <Svg height={112} width={112} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle
            stroke="#FF7849"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round" // Optional: makes ends rounded
            r={normalizedRadius - 4} // Offset for 8px stroke
            cx={56}
            cy={56}
          />
        </Svg>

        <View style={styles.circleValueContainer}>
          <Text style={styles.circleValue}>{remaining}</Text>
          <Text style={styles.circleLabel}>Left</Text>
        </View>
      </View>
    );
  };

  const renderMacroProgress = (label, consumed, target, color) => {
    const percentage = Math.min(100, (consumed / (target || 1)) * 100);
    return (
      <View style={styles.macroRow}>
        <View style={styles.macroHeader}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={styles.macroValue}>{consumed}g</Text>
        </View>
        <View style={styles.macroProgressBar}>
          <View style={[styles.macroProgressFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  const handleGenerateAIPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const response = await aiAPI.generateMealPlan({
        duration: 7,
        mealsPerDay: 4,
        dietaryRestrictions: [],
        cuisinePreferences: ['Vietnamese', 'Healthy'],
        allergies: []
      });
      if (response.data.success) {
        Alert.alert('Success', 'AI has generated a new meal plan for you!');
        refetch();
      }
    } catch (error) {
      console.error('AI Gen Error:', error);
      Alert.alert('AI Error', 'Failed to generate meal plan. Please check your network.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const renderDateSelector = () => {
    if (!activePlan) return null;

    const startDate = new Date(activePlan.startDate || new Date());
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < (activePlan.duration || 7); i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        name: weekDays[date.getDay()],
        date: date.getDate(),
        index: i,
        fullDate: date
      });
    }

    return (
      <View style={styles.dateSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateSelectorContent}>
          {days.map((day) => (
            <TouchableOpacity
              key={day.index}
              style={[styles.dayItem, selectedDayIndex === day.index && styles.dayItemActive]}
              onPress={() => setSelectedDayIndex(day.index)}
            >
              <Text style={[styles.dayName, selectedDayIndex === day.index && styles.dayNameActive]}>{day.name}</Text>
              <Text style={[styles.dateNumber, selectedDayIndex === day.index && styles.dateNumberActive]}>{day.date}</Text>
              {selectedDayIndex === day.index && <View style={styles.activeDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  const handleAddFood = () => {
    // Navigate to the new high-fidelity LogMeal screen
    navigation.navigate('LogMeal');
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('History')}>
          <Icon name="time-outline" size={28} color="#A8390D" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Nutrition</Text>
        
        <TouchableOpacity style={styles.headerIcon} onPress={handleOpenScanner}>
          <Icon name="barcode-outline" size={28} color="#A8390D" />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 10, backgroundColor: '#FBF8FC' }}>
        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity 
            style={[styles.tabButton, selectedView === 'daily' && styles.activeTabButton]}
            onPress={() => setSelectedView('daily')}
          >
            <Text style={[styles.tabText, selectedView === 'daily' && styles.activeTabText]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, selectedView === 'weekly' && styles.activeTabButton]}
            onPress={() => setSelectedView('weekly')}
          >
            <Text style={[styles.tabText, selectedView === 'weekly' && styles.activeTabText]}>Weekly</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {loading ? (
          <View style={{ paddingHorizontal: 20 }}>
            <Skeleton width="100%" height={200} borderRadius={20} style={{ marginBottom: 20 }} />
            <Skeleton width="100%" height={100} borderRadius={20} style={{ marginBottom: 20 }} />
            <Skeleton width={150} height={20} style={{ marginBottom: 15 }} />
            {[1, 2, 3].map(i => (
              <Skeleton key={i} width="100%" height={80} borderRadius={15} style={{ marginBottom: 10 }} />
            ))}
          </View>
        ) : selectedView === 'daily' ? (
          <>
            {/* Nutrition Summary Card */}
            <View style={styles.summaryCard}>
              {renderCircularProgress()}
              <View style={styles.statsContainer}>
                <Text style={styles.goalLabel}>Goal</Text>
                <View style={styles.goalValueMain}>
                  <Text style={styles.goalValue}>{nutritionGoals.calories.target.toLocaleString()}</Text>
                  <Text style={styles.goalUnit}>kcal</Text>
                </View>
                <View style={styles.bottomStats}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Consumed</Text>
                    <Text style={[styles.statValue, { color: '#A8390D' }]}>{nutritionGoals.calories.consumed}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Burned</Text>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>{burnedCalories}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Macros Card */}
            <View style={styles.macrosCard}>
              {renderMacroProgress('Protein', nutritionGoals.protein.consumed, nutritionGoals.protein.target, '#10B981')}
              {renderMacroProgress('Carbs', nutritionGoals.carbs.consumed, nutritionGoals.carbs.target, '#FF7849')}
              {renderMacroProgress('Fat', nutritionGoals.fat.consumed, nutritionGoals.fat.target, '#FBBF24')}
            </View>

            {/* Water Section */}
            <TouchableOpacity 
              style={styles.waterCard}
              onPress={() => navigation.navigate('WaterTracking')}
            >
              <View style={styles.waterInfo}>
                <View style={styles.waterIconContainer}>
                  <Icon name="water-outline" size={24} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.waterTitle}>Water</Text>
                  <Text style={styles.waterGoal}>Goal: 3000ml</Text>
                </View>
              </View>
              <View style={styles.waterProgress}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <View key={i} style={[styles.waterBar, i <= 6 && styles.waterBarActive]} />
                ))}
              </View>
            </TouchableOpacity>

            {/* Progress Impact Section */}
            <View style={styles.impactCard}>
              <Text style={styles.impactTitle}>Progress Impact</Text>
              <Text style={styles.impactDesc}>
                Your high-protein intake is accelerating muscle recovery.
              </Text>
              <View style={styles.impactStats}>
                <View style={styles.impactStatRow}>
                  <Text style={styles.impactStatLabel}>Body Fat</Text>
                  <View style={styles.impactStatValue}>
                    <Icon name="trending-down-outline" size={16} color="#A8390D" />
                    <Text style={styles.impactStatText}>-0.4%</Text>
                  </View>
                </View>
                <View style={styles.impactStatRow}>
                  <Text style={styles.impactStatLabel}>BMI</Text>
                  <View style={styles.impactStatValue}>
                    <Icon name="trending-down-outline" size={16} color="#A8390D" />
                    <Text style={styles.impactStatText}>-0.2</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.viewDashboardBtn} onPress={() => navigation.navigate('Progress')}>
                <Text style={styles.viewDashboardText}>View Progress Dashboard</Text>
                <Icon name="arrow-forward" size={16} color="#1B1B1E" />
              </TouchableOpacity>
            </View>

            {/* Today's Meals Header */}
            <View style={styles.mealsSectionHeader}>
              <Text style={styles.mealsSectionTitle}>Today&apos;s Meals</Text>
              <TouchableOpacity style={styles.addFoodLink} onPress={handleAddFood}>
                <View style={styles.addFoodIcon}>
                  <Icon name="add-outline" size={14} color="#A8390D" />
                </View>
                <Text style={styles.addFoodText}>Add Food</Text>
              </TouchableOpacity>
            </View>

            {/* Meal Cards */}
            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
              const meal = todayMeals.find(m => m.type === type.toLowerCase());

              if (!meal) {
                // Case: NO PLAN for this meal type -> Show "Log Meal" button to record something custom
                return (
                  <View key={type} style={[styles.mealCard, styles.notLoggedCard]}>
                    <View style={styles.mealCardHeader}>
                      <View style={styles.mealTitleRow}>
                        <View style={[styles.mealIconContainer, { backgroundColor: getMealIconBg(type) }]}>
                          <Icon name={getMealIcon(type)} size={22} color={getMealIconColor(type)} />
                        </View>
                        <View style={styles.mealInfoContainer}>
                          <Text style={styles.mealTypeTitle}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                          <Text style={styles.mealTimeText}>No plan for today</Text>
                        </View>
                      </View>
                      <View style={styles.mealCalorieContainer}>
                        <Text style={[styles.mealCalorieValue, { color: '#CBD5E1' }]}>---</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.logMealAction}
                      onPress={() => handleAddFood()} // Open scanner/picker for custom food
                    >
                      <View style={styles.logMealIconBox}>
                        <Icon name="add-outline" size={12} color="#FFFFFF" />
                      </View>
                      <Text style={styles.logMealActionText}>Log {type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.mealCard, !meal.logged && { borderLeftWidth: 4, borderLeftColor: '#FF7849' }]}
                  onPress={() => handleMealPress(meal)}
                >
                  <View style={styles.mealCardHeader}>
                    <View style={styles.mealTitleRow}>
                      <View style={[styles.mealIconContainer, { backgroundColor: meal.iconBg }]}>
                        <Icon name={meal.icon} size={22} color={meal.iconColor} />
                      </View>
                      <View style={styles.mealInfoContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.mealTypeTitle}>{meal.displayName}</Text>
                          {meal.logged && (
                            <Icon name="checkmark-circle" size={16} color="#10B981" />
                          )}
                        </View>
                        <View style={styles.mealMetaContainer}>
                          <Text style={styles.mealTimeText}>{meal.time}</Text>
                          <View style={styles.mealDotSeparator} />
                          <Text style={styles.mealMacrosMeta}>
                            P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.mealCalorieContainer}>
                      <Text style={[styles.mealCalorieValue, !meal.logged && { color: '#64748B' }]}>{meal.calories}</Text>
                      <Text style={styles.mealCalorieLabel}>kcal</Text>
                    </View>
                  </View>

                  <View style={styles.mealDivider} />

                  <View style={styles.foodItemsList}>
                    {(meal.foods && meal.foods.length > 0) ? meal.foods.map((food, index) => (
                      <View key={index} style={styles.foodItemRow}>
                        <View style={styles.foodItemTextGroup}>
                          <Text style={styles.foodItemName}>{food.name}</Text>
                          <Text style={styles.foodItemWeight}>{food.amount || '100g'}</Text>
                        </View>
                        <Text style={styles.foodItemKcal}>{food.calories} kcal</Text>
                      </View>
                    )) : (
                      <View style={styles.foodItemRow}>
                        <View style={styles.foodItemTextGroup}>
                          <Text style={styles.foodItemName}>{meal.name}</Text>
                          <Text style={styles.foodItemWeight}>Standard Serving</Text>
                        </View>
                        <Text style={styles.foodItemKcal}>{meal.calories} kcal</Text>
                      </View>
                    )}
                  </View>

                  {!meal.logged && (
                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, color: '#FF7849', fontWeight: '600' }}>Tap to mark as eaten →</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          /* High-Fidelity Weekly View */
          <View style={styles.weeklyScheduleContainer}>
            <View style={styles.weeklyHeader}>
              <Text style={styles.weeklyTitle}>
                {activePlan ? new Date(activePlan.startDate).toLocaleString('default', { month: 'long' }) : 'September'}
              </Text>
              <TouchableOpacity>
                <Text style={styles.viewAllLink}>View all</Text>
              </TouchableOpacity>
            </View>

            {renderDateSelector()}

            {!activePlan ? (
              <View style={styles.planEmptyState}>
                <Icon name="restaurant-outline" size={48} color="#A8390D" style={{ opacity: 0.2 }} />
                <Text style={styles.emptyStateTitle}>No Active Meal Plan</Text>
                <Text style={styles.emptyStateDesc}>
                  Generate a personalized AI meal plan to track your nutrition effectively.
                </Text>
                <TouchableOpacity
                  style={styles.generatePlanButton}
                  onPress={handleGenerateAIPlan}
                  disabled={isGeneratingPlan}
                >
                  {isGeneratingPlan ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Icon name="sparkles" size={20} color="#FFFFFF" />
                      <Text style={styles.generatePlanButtonText}>Generate AI Plan</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Meal Cards for Selected Day */}
                {(() => {
                  const dayData = Array.isArray(activePlan.meals) ? activePlan.meals[selectedDayIndex] : activePlan.meals;
                  if (!dayData || !dayData.meals) return null;

                  return ['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                    const meal = dayData.meals[type];
                    if (!meal) return null;

                    return (
                      <View key={type} style={styles.mealCard}>
                        <View style={styles.mealCardHeader}>
                          <View style={styles.mealTitleRow}>
                            <View style={[styles.mealIconContainer, { backgroundColor: getMealIconBg(type) }]}>
                              <Icon name={getMealIcon(type)} size={22} color={getMealIconColor(type)} />
                            </View>
                            <View style={styles.mealInfoContainer}>
                              <Text style={styles.mealTypeTitle}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                              <View style={styles.mealMetaContainer}>
                                <Text style={styles.mealTimeText}>{meal.time || getDefaultTime(type)}</Text>
                                <View style={styles.mealDotSeparator} />
                                <Text style={styles.mealMacrosMeta}>
                                  {meal.macros?.protein}g Protein
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View style={styles.mealCalorieContainer}>
                            <Text style={styles.mealCalorieValue}>{meal.totalCalories}</Text>
                            <Text style={styles.mealCalorieLabel}>kcal</Text>
                          </View>
                        </View>

                        <View style={styles.mealDivider} />

                        <View style={styles.foodItemsList}>
                          {meal.foods?.map((food, idx) => (
                            <View key={idx} style={styles.foodItemRow}>
                              <View style={styles.foodItemTextGroup}>
                                <Text style={styles.foodItemName}>{food.name}</Text>
                                <Text style={styles.foodItemWeight}>{food.amount || '1 serving'}</Text>
                              </View>
                              <Text style={styles.foodItemKcal}>{food.calories} kcal</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  });
                })()}

                <TouchableOpacity
                  style={styles.generateNewPlanBtn}
                  onPress={handleGenerateAIPlan}
                  disabled={isGeneratingPlan}
                >
                  {isGeneratingPlan ? (
                    <ActivityIndicator color="#FBF8FC" size="small" />
                  ) : (
                    <>
                      <Icon name="sparkles" size={20} color="#FBF8FC" />
                      <Text style={styles.generateNewPlanBtnText}>Generate New Plan</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Main Log Meal FAB */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.mainLogMealFab} onPress={handleAddFood}>
          <View style={styles.fabIconWrapper}>
            <Icon name="add-outline" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.fabLabel}>Log Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <FoodDetailModal
        visible={showFoodDetail}
        foodData={scannedFood}
        onClose={() => setShowFoodDetail(false)}
        onAddFood={handleAddFoodFromModal}
      />
    </View>
  );
};

export default NutritionScreen;