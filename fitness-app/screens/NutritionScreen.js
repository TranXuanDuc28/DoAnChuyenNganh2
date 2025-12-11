import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { aiAPI } from '../services/api';
import colors from '../theme/colors';
import BarcodeScanner from '../components/BarcodeScanner';
import FoodDetailModal from '../components/FoodDetailModal';
import { styles } from './styles/NutritionScreen.styles';


const NutritionScreen = () => {
  const [selectedTab, setSelectedTab] = useState('today');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mealPlans, setMealPlans] = useState([]);
  const [currentMealPlan, setCurrentMealPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [todayMeals, setTodayMeals] = useState([]);
  const [completedMeals, setCompletedMeals] = useState({}); // Track completed meals by ID
  const [nutritionGoals, setNutritionGoals] = useState({
    calories: { consumed: 0, target: 2000, unit: 'kcal' },
    protein: { consumed: 0, target: 150, unit: 'g' },
    carbs: { consumed: 0, target: 250, unit: 'g' },
    fat: { consumed: 0, target: 67, unit: 'g' },
    water: { consumed: 0, target: 8, unit: 'glasses' },
  });
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannedFood, setScannedFood] = useState(null);
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [loggedFoods, setLoggedFoods] = useState([]); // Foods logged manually

  const tabs = [
    { id: 'today', title: 'Today', icon: 'calendar' },
    { id: 'log', title: 'Log Food', icon: 'add-circle' },
    { id: 'plans', title: 'Meal Plans', icon: 'restaurant' },
  ];

  useEffect(() => {
    if (selectedTab === 'plans') {
      fetchMealPlans();
    } else if (selectedTab === 'today') {
      fetchTodayMeals();
    }
  }, [selectedTab]);

  useEffect(() => {
    // Fetch today's meals on initial load
    fetchTodayMeals();
  }, []);

  const calculateCurrentDay = (mealPlan) => {
    if (!mealPlan || !mealPlan.createdAt) return 1;

    const startDate = new Date(mealPlan.createdAt);
    const today = new Date();

    // Calculate days difference
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Calculate current day number (1-based, cycling through the plan)
    const totalDays = mealPlan.duration || 7;
    const currentDay = (diffDays % totalDays) + 1;

    return currentDay;
  };

  const fetchTodayMeals = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.getMealPlans();

      if (response.data.success && response.data.mealPlans.length > 0) {
        const activePlan = response.data.mealPlans[0]; // Most recent plan
        const currentDayNumber = calculateCurrentDay(activePlan);

        console.log('Active meal plan:', activePlan.name);
        console.log('Current day number:', currentDayNumber);

        // Parse meals
        let meals = activePlan.meals;
        if (typeof meals === 'string') {
          try {
            meals = JSON.parse(meals);
          } catch (error) {
            console.error('Error parsing meals:', error);
            return;
          }
        }

        // Find today's meals
        let todayData = null;
        if (Array.isArray(meals)) {
          // New format: array of days
          todayData = meals.find(day => day.dayNumber === currentDayNumber);
        } else if (typeof meals === 'object' && meals !== null) {
          // Old format: single day object
          todayData = {
            dayNumber: 1,
            meals: meals,
            dailyTotals: {
              calories: activePlan.totalCalories || 0,
              protein: activePlan.macronutrients?.protein?.grams || 0,
              carbs: activePlan.macronutrients?.carbs?.grams || 0,
              fat: activePlan.macronutrients?.fat?.grams || 0
            }
          };
        }

        if (todayData && todayData.meals) {
          // Convert meals object to array format
          const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
          const mealsArray = [];
          let totalTarget = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          };

          mealTypes.forEach((type, index) => {
            const meal = todayData.meals[type];
            if (meal) {
              const mealId = `${currentDayNumber}-${type}`;
              mealsArray.push({
                id: mealId,
                type: type.charAt(0).toUpperCase() + type.slice(1),
                name: meal.name,
                calories: meal.totalCalories || 0,
                protein: meal.macros?.protein || 0,
                carbs: meal.macros?.carbs || 0,
                fat: meal.macros?.fat || 0,
                time: meal.time || '',
                completed: completedMeals[mealId] || false,
              });

              // Sum up daily targets (total of all meals)
              totalTarget.calories += meal.totalCalories || 0;
              totalTarget.protein += meal.macros?.protein || 0;
              totalTarget.carbs += meal.macros?.carbs || 0;
              totalTarget.fat += meal.macros?.fat || 0;
            }
          });

          setTodayMeals(mealsArray);

          // Calculate consumed based on completed meals
          const totalConsumed = mealsArray.reduce((acc, meal) => {
            if (meal.completed) {
              acc.calories += meal.calories;
              acc.protein += meal.protein;
              acc.carbs += meal.carbs;
              acc.fat += meal.fat;
            }
            return acc;
          }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

          // Update nutrition goals with targets from daily totals
          setNutritionGoals({
            calories: {
              consumed: totalConsumed.calories,
              target: totalTarget.calories || activePlan.totalCalories || 2000,
              unit: 'kcal'
            },
            protein: {
              consumed: totalConsumed.protein,
              target: totalTarget.protein || activePlan.macronutrients?.protein?.grams || 150,
              unit: 'g'
            },
            carbs: {
              consumed: totalConsumed.carbs,
              target: totalTarget.carbs || activePlan.macronutrients?.carbs?.grams || 250,
              unit: 'g'
            },
            fat: {
              consumed: totalConsumed.fat,
              target: totalTarget.fat || activePlan.macronutrients?.fat?.grams || 67,
              unit: 'g'
            },
            water: { consumed: 0, target: 8, unit: 'glasses' },
          });
        }
      }
    } catch (error) {
      console.error('Error fetching today meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      console.log('Fetching meal plans...');
      const response = await aiAPI.getMealPlans();
      console.log('Meal plans response:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        console.log('Found meal plans:', response.data.mealPlans.length);
        setMealPlans(response.data.mealPlans);
        // Set the most recent meal plan as current
        if (response.data.mealPlans.length > 0) {
          console.log('Setting current meal plan:', response.data.mealPlans[0].name);
          setCurrentMealPlan(response.data.mealPlans[0]);
        } else {
          console.log('No meal plans found');
        }
      } else {
        console.log('Response success is false');
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert('Error', 'Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMealPlan = async () => {
    try {
      setGenerating(true);

      Alert.alert(
        'Generate Meal Plan',
        'AI will analyze your profile and create a personalized meal plan. This may take a minute.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Generate',
            onPress: async () => {
              try {
                const response = await aiAPI.generateMealPlan({});

                if (response.data.success) {
                  Alert.alert('Success', 'Your personalized meal plan has been generated!');
                  await fetchMealPlans();
                  setCurrentMealPlan(response.data.mealPlan);
                } else {
                  Alert.alert('Error', response.data.error || 'Failed to generate meal plan');
                }
              } catch (error) {
                console.error('Error generating meal plan:', error);
                const errorMessage = error.response?.data?.error || error.message || 'Failed to generate meal plan';
                Alert.alert('Error', errorMessage);
              } finally {
                setGenerating(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      setGenerating(false);
    }
  };

  const handleDeleteMealPlan = async (id) => {
    Alert.alert(
      'Delete Meal Plan',
      'Are you sure you want to delete this meal plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await aiAPI.deleteMealPlan(id);
              await fetchMealPlans();
              if (currentMealPlan?.id === id) {
                setCurrentMealPlan(null);
              }
              Alert.alert('Success', 'Meal plan deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete meal plan');
            }
          }
        }
      ]
    );
  };

  const toggleMealCompleted = (mealId) => {
    setCompletedMeals(prev => {
      const newCompleted = {
        ...prev,
        [mealId]: !prev[mealId]
      };

      // Update todayMeals state
      const updatedMeals = todayMeals.map(meal =>
        meal.id === mealId
          ? { ...meal, completed: !meal.completed }
          : meal
      );
      setTodayMeals(updatedMeals);

      // Recalculate consumed values
      const totalConsumed = updatedMeals.reduce((acc, meal) => {
        if (meal.completed) {
          acc.calories += meal.calories;
          acc.protein += meal.protein;
          acc.carbs += meal.carbs;
          acc.fat += meal.fat;
        }
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

      // Update nutrition goals
      setNutritionGoals(prev => ({
        calories: { ...prev.calories, consumed: totalConsumed.calories },
        protein: { ...prev.protein, consumed: totalConsumed.protein },
        carbs: { ...prev.carbs, consumed: totalConsumed.carbs },
        fat: { ...prev.fat, consumed: totalConsumed.fat },
        water: prev.water,
      }));

      return newCompleted;
    });
  };

  const handleBarcodeScanned = (foodData) => {
    console.log('Food scanned:', foodData);
    setScannedFood(foodData);
    setShowFoodDetail(true);
  };


  const handleAddFood = async (foodData) => {
    console.log('Adding food:', foodData);

    try {
      // Prepare data for API
      const foodLogData = {
        foodName: foodData.name,
        brand: foodData.brand || null,
        barcode: foodData.barcode || null,
        mealType: foodData.mealType || 'snack',
        servingSize: foodData.servingSize || '100g',
        servingAmount: foodData.servingAmount || 1.0,
        calories: foodData.calories || 0,
        protein: foodData.protein || 0,
        carbs: foodData.carbs || 0,
        fat: foodData.fat || 0,
        fiber: foodData.fiber || 0,
        sugar: foodData.sugar || 0,
        sodium: foodData.sodium || 0,
        imageUrl: foodData.imageUrl || null,
        ingredients: foodData.ingredients || null,
        logDate: new Date().toISOString().split('T')[0],
        logTime: new Date().toTimeString().split(' ')[0],
      };

      // Save to database
      const response = await aiAPI.addFoodLog(foodLogData);

      if (response.data.success) {
        const savedFood = response.data.data;

        // Add to logged foods state
        const newFood = {
          id: savedFood.id,
          name: savedFood.foodName,
          brand: savedFood.brand,
          barcode: savedFood.barcode,
          mealType: savedFood.mealType,
          servingSize: savedFood.servingSize,
          servingAmount: savedFood.servingAmount,
          calories: savedFood.calories,
          protein: savedFood.protein,
          carbs: savedFood.carbs,
          fat: savedFood.fat,
          timestamp: savedFood.createdAt,
        };

        setLoggedFoods(prev => [...prev, newFood]);

        // Update nutrition goals
        setNutritionGoals(prev => ({
          calories: {
            ...prev.calories,
            consumed: prev.calories.consumed + savedFood.calories
          },
          protein: {
            ...prev.protein,
            consumed: prev.protein.consumed + savedFood.protein
          },
          carbs: {
            ...prev.carbs,
            consumed: prev.carbs.consumed + savedFood.carbs
          },
          fat: {
            ...prev.fat,
            consumed: prev.fat.consumed + savedFood.fat
          },
          water: prev.water,
        }));

        Alert.alert('Success', `${savedFood.foodName} added to ${savedFood.mealType}!`);
      }
    } catch (error) {
      console.error('Error adding food log:', error);
      Alert.alert('Error', 'Failed to add food to diary. Please try again.');
    }
  };

  const handleDeleteLoggedFood = (foodId) => {
    const food = loggedFoods.find(f => f.id === foodId);
    if (!food) return;

    Alert.alert(
      'Delete Food',
      `Remove ${food.name} from your log?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from database
              await aiAPI.deleteFoodLog(foodId);

              // Remove from logged foods
              setLoggedFoods(prev => prev.filter(f => f.id !== foodId));

              // Update nutrition goals
              setNutritionGoals(prev => ({
                calories: {
                  ...prev.calories,
                  consumed: Math.max(0, prev.calories.consumed - food.calories)
                },
                protein: {
                  ...prev.protein,
                  consumed: Math.max(0, prev.protein.consumed - food.protein)
                },
                carbs: {
                  ...prev.carbs,
                  consumed: Math.max(0, prev.carbs.consumed - food.carbs)
                },
                fat: {
                  ...prev.fat,
                  consumed: Math.max(0, prev.fat.consumed - food.fat)
                },
                water: prev.water,
              }));

              Alert.alert('Success', 'Food removed from diary');
            } catch (error) {
              console.error('Error deleting food log:', error);
              Alert.alert('Error', 'Failed to delete food entry.');
            }
          }
        }
      ]
    );
  };


  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedTab === 'today') {
      await fetchTodayMeals();
    } else if (selectedTab === 'plans') {
      await fetchMealPlans();
    }
    setRefreshing(false);
  };


  const renderMealItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.mealCard,
        item.completed && styles.mealCardCompleted
      ]}
      onPress={() => toggleMealCompleted(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.mealHeader}>
        <View style={styles.mealTypeContainer}>
          <Text style={[
            styles.mealType,
            item.completed && styles.mealTypeCompleted
          ]}>
            {item.type}
          </Text>
          <Text style={styles.mealTime}>{item.time}</Text>
        </View>
        <TouchableOpacity
          onPress={() => toggleMealCompleted(item.id)}
          style={styles.checkboxContainer}
        >
          <Icon
            name={item.completed ? "checkmark-circle" : "ellipse-outline"}
            size={28}
            color={item.completed ? "#4CAF50" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
      <Text style={[
        styles.mealName,
        item.completed && styles.mealNameCompleted
      ]}>
        {item.name}
      </Text>
      <View style={styles.mealMacros}>
        <View style={styles.macroItem}>
          <Text style={[
            styles.macroValue,
            item.completed && styles.macroValueCompleted
          ]}>
            {item.calories}
          </Text>
          <Text style={styles.macroLabel}>Cal</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[
            styles.macroValue,
            item.completed && styles.macroValueCompleted
          ]}>
            {item.protein}g
          </Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[
            styles.macroValue,
            item.completed && styles.macroValueCompleted
          ]}>
            {item.carbs}g
          </Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[
            styles.macroValue,
            item.completed && styles.macroValueCompleted
          ]}>
            {item.fat}g
          </Text>
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
      </View>
      {item.completed && (
        <View style={styles.completedBadge}>
          <Icon name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderNutritionGoal = (key, goal) => {
    const percentage = Math.min((goal.consumed / goal.target) * 100, 100);
    return (
      <View style={styles.goalCard} key={key}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          <Text style={styles.goalProgress}>
            {goal.consumed}/{goal.target} {goal.unit}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: percentage >= 100 ? '#4CAF50' : '#007AFF',
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderMealPlanDetail = (mealPlan) => {
    if (!mealPlan || !mealPlan.meals) {
      return (
        <View style={styles.emptyState}>
          <Icon name="restaurant-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No meal plan selected</Text>
          <Text style={styles.emptyStateSubtext}>Generate a meal plan to get started</Text>
        </View>
      );
    }

    // Parse meals if it's a string (from database)
    let meals = mealPlan.meals;
    if (typeof meals === 'string') {
      try {
        meals = JSON.parse(meals);
      } catch (error) {
        console.error('Error parsing meals:', error);
        return (
          <View style={styles.emptyState}>
            <Icon name="alert-circle-outline" size={64} color="#f44336" />
            <Text style={styles.emptyStateText}>Error loading meal plan</Text>
            <Text style={styles.emptyStateSubtext}>Invalid meal data format</Text>
          </View>
        );
      }
    }

    // New format: meals is an array of days
    // Old format: meals is an object with meal types (breakfast, lunch, etc.)
    let days = [];

    if (Array.isArray(meals)) {
      // New format: already an array of days
      days = meals;
    } else if (typeof meals === 'object' && meals !== null) {
      // Old format: convert object to single day array
      days = [{
        dayNumber: 1,
        date: 'Day 1',
        meals: meals,
        dailyTotals: {
          calories: mealPlan.totalCalories || 0,
          protein: mealPlan.macronutrients?.protein?.grams || 0,
          carbs: mealPlan.macronutrients?.carbs?.grams || 0,
          fat: mealPlan.macronutrients?.fat?.grams || 0
        }
      }];
    }

    if (days.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="restaurant-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No meals in this plan</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.mealPlanContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.mealPlanHeader}>
          <Text style={styles.mealPlanTitle}>{mealPlan.name}</Text>
          <Text style={styles.mealPlanDescription}>{mealPlan.description}</Text>
          <View style={styles.mealPlanStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mealPlan.totalCalories || 0}</Text>
              <Text style={styles.statLabel}>Daily Calories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mealPlan.macronutrients?.protein?.grams || 0}g</Text>
              <Text style={styles.statLabel}>Protein</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mealPlan.macronutrients?.carbs?.grams || 0}g</Text>
              <Text style={styles.statLabel}>Carbs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mealPlan.macronutrients?.fat?.grams || 0}g</Text>
              <Text style={styles.statLabel}>Fat</Text>
            </View>
          </View>
          <View style={styles.durationBadge}>
            <Icon name="calendar" size={16} color="#007AFF" />
            <Text style={styles.durationText}>{mealPlan.duration} Day Plan</Text>
          </View>
        </View>

        {/* Render each day */}
        {days.map((day, dayIndex) => {
          const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

          // Calculate if this day is in the past
          const currentDayNumber = calculateCurrentDay(mealPlan);
          const dayNumber = day.dayNumber || dayIndex + 1;
          const isPastDay = dayNumber < currentDayNumber;

          return (
            <View key={dayIndex} style={[styles.dayContainer, isPastDay && { opacity: 0.6 }]}>
              <View style={styles.dayHeader}>
                <Text style={[styles.dayTitle, isPastDay && { textDecorationLine: 'line-through' }]}>
                  Day {dayNumber}
                </Text>
                {day.dailyTotals && (
                  <Text style={[styles.dayCalories, isPastDay && { textDecorationLine: 'line-through' }]}>
                    {day.dailyTotals.calories} cal
                  </Text>
                )}
              </View>

              {mealTypes.map((mealType) => {
                const meal = day.meals?.[mealType];
                if (!meal) return null;

                return (
                  <View key={mealType} style={styles.aiMealCard}>
                    <View style={styles.aiMealHeader}>
                      <Text style={[styles.aiMealType, isPastDay && { textDecorationLine: 'line-through' }]}>
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </Text>
                      <Text style={[styles.aiMealTime, isPastDay && { textDecorationLine: 'line-through' }]}>
                        {meal.time}
                      </Text>
                    </View>

                    <Text style={[styles.aiMealName, isPastDay && { textDecorationLine: 'line-through' }]}>
                      {meal.name}
                    </Text>
                    {meal.description && (
                      <Text style={[styles.aiMealDescription, isPastDay && { textDecorationLine: 'line-through' }]}>
                        {meal.description}
                      </Text>
                    )}

                    <View style={styles.aiMealMacros}>
                      <View style={styles.macroItem}>
                        <Text style={[styles.macroValue, isPastDay && { textDecorationLine: 'line-through' }]}>
                          {meal.totalCalories}
                        </Text>
                        <Text style={styles.macroLabel}>Cal</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={[styles.macroValue, isPastDay && { textDecorationLine: 'line-through' }]}>
                          {meal.macros?.protein}g
                        </Text>
                        <Text style={styles.macroLabel}>Protein</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={[styles.macroValue, isPastDay && { textDecorationLine: 'line-through' }]}>
                          {meal.macros?.carbs}g
                        </Text>
                        <Text style={styles.macroLabel}>Carbs</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={[styles.macroValue, isPastDay && { textDecorationLine: 'line-through' }]}>
                          {meal.macros?.fat}g
                        </Text>
                        <Text style={styles.macroLabel}>Fat</Text>
                      </View>
                    </View>

                    {meal.foods && meal.foods.length > 0 && (
                      <View style={styles.foodsList}>
                        <Text style={styles.foodsListTitle}>Foods:</Text>
                        {meal.foods.map((food, index) => (
                          <View key={index} style={styles.foodItem}>
                            <Text style={[styles.foodName, isPastDay && { textDecorationLine: 'line-through' }]}>
                              • {food.name}
                            </Text>
                            <Text style={[styles.foodAmount, isPastDay && { textDecorationLine: 'line-through' }]}>
                              {food.amount} ({food.calories} cal)
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {meal.instructions && meal.instructions.length > 0 && (
                      <View style={styles.instructionsList}>
                        <Text style={styles.instructionsTitle}>Instructions:</Text>
                        {meal.instructions.map((instruction, index) => (
                          <Text key={index} style={[styles.instructionText, isPastDay && { textDecorationLine: 'line-through' }]}>
                            {index + 1}. {instruction}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMealPlan(mealPlan.id)}
        >
          <Icon name="trash-outline" size={20} color="#fff" />
          <Text style={styles.deleteButtonText}>Delete This Plan</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Food Detail Modal */}
      <FoodDetailModal
        visible={showFoodDetail}
        foodData={scannedFood}
        onClose={() => {
          setShowFoodDetail(false);
          setScannedFood(null);
        }}
        onAddFood={handleAddFood}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrition</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowBarcodeScanner(true)}
        >
          <Icon name="barcode" size={24} color={colors.primary} />
        </TouchableOpacity>
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
              size={20}
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

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'today' && (
          <View>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading today's meals...</Text>
              </View>
            ) : todayMeals.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="restaurant-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No meal plan found</Text>
                <Text style={styles.emptyStateSubtext}>Generate a meal plan to see today's meals</Text>
                <TouchableOpacity
                  style={[styles.generateButton, { marginTop: 20 }]}
                  onPress={() => setSelectedTab('plans')}
                >
                  <Icon name="sparkles" size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>Go to Meal Plans</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Nutrition Goals */}
                <View style={styles.goalsSection}>
                  <Text style={styles.sectionTitle}>Today's Goals</Text>
                  {Object.entries(nutritionGoals).map(([key, goal]) =>
                    renderNutritionGoal(key, goal)
                  )}
                </View>

                {/* Meals */}
                <View style={styles.mealsSection}>
                  <Text style={styles.sectionTitle}>Today's Meals</Text>
                  <FlatList
                    data={todayMeals}
                    renderItem={renderMealItem}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                  />
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickActionButton}>
                    <Icon name="add" size={24} color="#007AFF" />
                    <Text style={styles.quickActionText}>Add Meal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickActionButton}>
                    <Icon name="water" size={24} color="#2196F3" />
                    <Text style={styles.quickActionText}>Log Water</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {selectedTab === 'log' && (
          <View style={styles.logContainer}>
            <Text style={styles.sectionTitle}>Log Food</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <Text style={styles.searchPlaceholder}>Search for food...</Text>
            </View>

            {/* Scan Barcode Button */}
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setShowBarcodeScanner(true)}
            >
              <Icon name="camera" size={24} color="#fff" />
              <Text style={styles.scanButtonText}>Scan Barcode</Text>
            </TouchableOpacity>

            {/* Logged Foods List */}
            {loggedFoods.length > 0 && (
              <View style={styles.loggedFoodsSection}>
                <Text style={styles.sectionTitle}>Today's Logged Foods</Text>
                {loggedFoods.map((food) => (
                  <View key={food.id} style={styles.loggedFoodCard}>
                    <View style={styles.loggedFoodHeader}>
                      <View style={styles.loggedFoodInfo}>
                        <Text style={styles.loggedFoodName}>{food.name}</Text>
                        <Text style={styles.loggedFoodMeal}>
                          {food.mealType.charAt(0).toUpperCase() + food.mealType.slice(1)} • {food.servingAmount}× {food.servingSize}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteLoggedFood(food.id)}>
                        <Icon name="trash-outline" size={20} color="#dc3545" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.loggedFoodMacros}>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{food.calories}</Text>
                        <Text style={styles.macroLabel}>Cal</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{food.protein}g</Text>
                        <Text style={styles.macroLabel}>Protein</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{food.carbs}g</Text>
                        <Text style={styles.macroLabel}>Carbs</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{food.fat}g</Text>
                        <Text style={styles.macroLabel}>Fat</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Empty State */}
            {loggedFoods.length === 0 && (
              <View style={styles.emptyLogState}>
                <Icon name="restaurant-outline" size={64} color="#ccc" />
                <Text style={styles.emptyStateText}>No foods logged yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Scan a barcode or search to add food
                </Text>
              </View>
            )}
          </View>
        )}

        {selectedTab === 'plans' && (
          <View style={styles.plansContainer}>
            <View style={styles.plansHeader}>
              <Text style={styles.sectionTitle}>AI Meal Plans</Text>
              <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerateMealPlan}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="sparkles" size={20} color="#fff" />
                    <Text style={styles.generateButtonText}>Generate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading meal plans...</Text>
              </View>
            ) : (
              renderMealPlanDetail(currentMealPlan)
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NutritionScreen;