import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { aiAPI, nutritionAPI } from '../services/api';
import styles from './styles/LogMealScreen.styles';

const { width } = Dimensions.get('window');

const LogMealScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Recent');
  const [selectedItems, setSelectedItems] = useState([]);
  const [foodData, setFoodData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState(false);
  const [waterAmount, setWaterAmount] = useState('250'); // Default 250ml
  const isWaterMode = route.params?.type === 'water';

  // Set initial state based on mode
  useEffect(() => {
    if (isWaterMode) {
      setSearchQuery('');
      setActiveTab('Recent');
    }
  }, [isWaterMode]);

  // Fetch initial data based on tab
  useEffect(() => {
    if (activeTab === 'Recent') {
      fetchRecentFoods();
    } else if (activeTab === 'Suggested') {
      fetchSuggestedFoods();
    }
  }, [activeTab]);

  const fetchRecentFoods = async () => {
    setLoading(true);
    try {
      // Fetch user's logs from the last 7 days to show as "recent"
      const response = await aiAPI.getFoodLogs({ limit: 20 });
      if (response.data.success) {
        // Map logs back to a unique list of food items
        const logs = response.data.data.logs || [];
        const uniqueFoods = [];
        const seenNames = new Set();

        logs.forEach(log => {
          if (!seenNames.has(log.foodName)) {
            seenNames.add(log.foodName);
            uniqueFoods.push({
              id: log.id,
              name: log.foodName,
              calories: log.calories,
              protein: log.protein,
              carbs: log.carbs,
              fat: log.fat,
              portion: log.amount || '1 portion',
              mealType: log.mealType,
              image: null // Real logs usually don't have images unless stored
            });
          }
        });
        setFoodData(uniqueFoods);
      }
    } catch (error) {
      console.error('Error fetching recent foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedFoods = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getMealPlans();
      if (response.data.success && response.data.mealPlans && response.data.mealPlans.length > 0) {
        const activePlan = response.data.mealPlans.find(p => p.isActive) || response.data.mealPlans[0];
        // Extract a few foods from the current day's plan
        const today = new Date().getDay(); // 0-6
        const dayMeals = activePlan.meals[today]?.meals || activePlan.meals[0]?.meals || {};

        const suggested = Object.keys(dayMeals).map(type => {
          const meal = dayMeals[type];
          return {
            id: `suggested-${type}`,
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            portion: 'Standard Serving',
            mealType: type,
            image: null
          };
        });
        setFoodData(suggested);
      }
    } catch (error) {
      console.error('Error fetching suggested foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      if (activeTab === 'Recent') fetchRecentFoods();
      return;
    }

    setLoading(true);
    try {
      const response = await nutritionAPI.searchFoods(searchQuery);
      if (response.data) {
        // Standardize search results to our UI format
        const results = (response.data.foods || response.data || []).map((item, index) => ({
          id: item.id || `search-${index}`,
          name: item.name || item.food_name,
          calories: item.calories || item.nf_calories || 0,
          protein: item.protein || item.nf_protein || 0,
          carbs: item.carbs || item.nf_total_carbohydrate || 0,
          fat: item.fat || item.nf_total_fat || 0,
          portion: item.serving_qty ? `${item.serving_qty} ${item.serving_unit}` : '100g',
          image: item.image_url || item.photo?.thumb || null
        }));
        setFoodData(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search for foods.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (item) => {
    const isSelected = selectedItems.find(i => i.id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleLogWater = async () => {
    const amount = parseFloat(waterAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid water amount in ml.');
      return;
    }

    setLogging(true);
    try {
      // API expects amount in ml (or adjusted per backend logic)
      // Based on Dashboard, displayWater is usually in Liters, but backend often stores ml
      const response = await aiAPI.logWater({ amount });
      if (response.data.success || response.data.entry) {
        Alert.alert('Success', `Logged ${amount}ml of water!`, [
          { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Nutrition', params: { refresh: true } }) }
        ]);
      }
    } catch (error) {
      console.error('Water logging error:', error);
      Alert.alert('Error', 'Failed to log water. Please try again.');
    } finally {
      setLogging(false);
    }
  };

  const handleLogSelected = async () => {
    if (isWaterMode) {
      await handleLogWater();
      return;
    }

    if (selectedItems.length === 0) return;
    setLogging(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Log each selected item
      const logPromises = selectedItems.map(item => {
        const logData = {
          foodName: item.name,
          mealType: item.mealType || 'Snack', // Default to snack if not specified
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          amount: item.portion,
          logDate: today,
          notes: 'Added from Log Meal screen'
        };
        return aiAPI.addFoodLog(logData);
      });

      await Promise.all(logPromises);

      Alert.alert('Success', `Successfully logged ${selectedItems.length} items!`, [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Nutrition', params: { refresh: true } }) }
      ]);
    } catch (error) {
      console.error('Logging error:', error);
      Alert.alert('Error', 'Failed to log some items. Please try again.');
    } finally {
      setLogging(false);
    }
  };

  const totalCalories = selectedItems.reduce((sum, item) => sum + (item.calories || 0), 0);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header & Search */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleGroup}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Icon name="chevron-back-outline" size={24} color="#A8390D" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isWaterMode ? 'Log Hydration' : 'Log Meal'}</Text>
          </View>
        </View>

        {!isWaterMode && (
          <View style={styles.searchContainer}>
            <Icon name="search-outline" size={20} color="#58423B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search food..."
              placeholderTextColor="#58423B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.barcodeIcon} onPress={handleSearch}>
              <Icon name="arrow-forward-outline" size={20} color="#A8390D" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tabs - only show for food */}
      {!isWaterMode && (
        <View style={styles.tabsContainer}>
          {['Recent', 'Suggested', 'Favorites'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
      >
        {isWaterMode ? (
          <View style={{ paddingVertical: 20 }}>
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: '#F3E8FF',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                shadowColor: '#9333EA',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 15,
                elevation: 4
              }}>
                <Icon name="water" size={60} color="#9333EA" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#2C2F31' }}>Hydration</Text>
              <Text style={{ color: '#6B7280', marginTop: 4 }}>How much water did you drink?</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
              {['250', '500', '750', '1000'].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => setWaterAmount(amount)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 20,
                    backgroundColor: waterAmount === amount ? '#9333EA' : '#F6F2F7',
                    borderWidth: 1,
                    borderColor: waterAmount === amount ? '#9333EA' : '#E5E7EB'
                  }}
                >
                  <Text style={{
                    fontWeight: '700',
                    color: waterAmount === amount ? '#FFFFFF' : '#2C2F31'
                  }}>
                    {amount}ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#2C2F31', marginBottom: 12 }}>Custom Amount (ml)</Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F6F2F7',
                borderRadius: 20,
                paddingHorizontal: 20,
                height: 60,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}>
                <TextInput
                  style={{ flex: 1, fontSize: 18, color: '#2C2F31', fontWeight: '600' }}
                  keyboardType="numeric"
                  value={waterAmount}
                  onChangeText={setWaterAmount}
                  placeholder="Enter amount..."
                />
                <Text style={{ color: '#6B7280', fontWeight: '700' }}>ml</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#A8390D" />
                <Text style={{ marginTop: 12, color: '#A8390D', fontWeight: '600' }}>Fetching your data...</Text>
              </View>
            ) : foodData.length === 0 ? (
              <View style={{ padding: 60, alignItems: 'center' }}>
                <Icon name="restaurant-outline" size={64} color="#A8390D" style={{ opacity: 0.2 }} />
                <Text style={{ marginTop: 16, color: '#58423B', fontSize: 16, fontWeight: '700' }}>No items found</Text>
                <Text style={{ marginTop: 8, color: '#ABADAF', textAlign: 'center' }}>Try searching for a different food or check your recent logs.</Text>
              </View>
            ) : (
              <View style={styles.foodList}>
                {foodData.map((food) => {
                  const isSelected = selectedItems.find(i => i.id === food.id);
                  return (
                    <TouchableOpacity
                      key={food.id}
                      style={[styles.foodCard, isSelected && styles.selectedCard]}
                      onPress={() => toggleSelection(food)}
                    >
                      <View style={styles.foodInfoGroup}>
                        <View style={styles.foodImageContainer}>
                          {food.image ? (
                            <Image source={{ uri: food.image }} style={styles.foodImage} />
                          ) : (
                            <View style={[styles.foodImage, { backgroundColor: '#F6F2F7', alignItems: 'center', justifyContent: 'center' }]}>
                              <Icon name="restaurant-outline" size={20} color="#A8390D" />
                            </View>
                          )}
                        </View>
                        <View style={styles.foodTextDetails}>
                          <Text style={styles.foodName}>{food.name}</Text>
                          <Text style={styles.foodMeta}>{Math.round(food.calories)} kcal • {food.portion}</Text>
                          <Text style={[styles.foodMacros, isSelected && styles.selectedMacros]}>
                            P: {Math.round(food.protein)}g | C: {Math.round(food.carbs)}g | F: {Math.round(food.fat)}g
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.addIconButton, isSelected && styles.selectedAddButton]}>
                        <Icon
                          name={isSelected ? "checkmark-outline" : "add-outline"}
                          size={22}
                          color={isSelected ? "#FFFFFF" : "#A8390D"}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Footer Button */}
      {(selectedItems.length > 0 || isWaterMode) && (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[
              styles.footerButton, 
              logging && { opacity: 0.7 },
              isWaterMode && { backgroundColor: '#9333EA' }
            ]}
            onPress={handleLogSelected}
            disabled={logging}
          >
            {logging ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : isWaterMode ? (
              <>
                <Text style={[styles.footerButtonText, { color: '#FFFFFF' }]}>
                  Log {waterAmount}ml Water
                </Text>
                <Icon name="water-outline" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </>
            ) : (
              <>
                <Text style={styles.footerButtonText}>
                  Add Selected ({selectedItems.length} items)
                </Text>
                <Text style={styles.footerDot}>•</Text>
                <Text style={styles.footerKcal}>{Math.round(totalCalories)} kcal</Text>
                <Icon name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LogMealScreen;
