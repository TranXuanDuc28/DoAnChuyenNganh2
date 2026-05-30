import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from './styles/MealDetailScreen.styles';
import { aiAPI } from '../services/api';

const MealDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get meal data from params or use default (from UIDL)
  const { meal = {
    name: 'Glazed Salmon Bowl',
    displayName: 'LUNCH',
    type: 'lunch',
    calories: 485,
    protein: 34,
    fat: 22,
    carbs: 42,
    time: '01:15 PM',
    foods: [
      { name: 'Fresh Atlantic Salmon', amount: '150g', calories: 310, icon: 'fish' },
      { name: 'Ripe Avocado', amount: '1/2 Unit', calories: 120, icon: 'food-apple-outline' },
      { name: 'Cooked Red Quinoa', amount: '100g', calories: 140, icon: 'seed-outline' },
      { name: 'Baby Spinach', amount: '50g', calories: 15, icon: 'leaf-outline' },
      { name: 'Cucumber', amount: '80g', calories: 12, icon: 'shaved-ice' },
      { name: 'Soy-Honey Glaze', amount: '15ml', calories: 45, icon: 'bottle-tonic-plus-outline' }
    ],
    preparation: [
      {
        title: 'Prep the Base',
        desc: 'Rinse quinoa under cold water. Boil in salted water for 12-15 minutes until tender and fluffy. Let it cool slightly before plating.'
      },
      {
        title: 'Sear the Protein',
        desc: 'Season the salmon with salt and pepper. Heat a pan over medium-high heat with olive oil. Sear for 4 minutes skin-side down until crispy.'
      },
      {
        title: 'Assemble & Garnish',
        desc: 'Place quinoa as base. Slice avocado thinly and fan out. Add the salmon fillet and drizzle with lemon zest and fresh herbs.'
      }
    ]
  } } = route.params || {};

  const handleAddToLog = async () => {
    try {
      const foodLogData = {
        foodName: meal.name,
        mealType: (meal.type || 'lunch').charAt(0).toUpperCase() + (meal.type || 'lunch').slice(1),
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        logDate: new Date().toISOString().split('T')[0],
        notes: 'Logged from Meal Detail'
      };

      const response = await aiAPI.addFoodLog(foodLogData);
      if (response.data.success) {
        Alert.alert('Success', `${meal.name} has been added to your log.`);
        navigation.navigate('MainTabs', {
          screen: 'Nutrition',
          params: { refresh: true },
        });
      }
    } catch (error) {
      console.error('Error logging meal:', error);
      Alert.alert('Error', 'Failed to add meal to log.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FF794A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MEAL DETAIL</Text>
        <TouchableOpacity style={styles.saveButton}>
          <Icon name="heart-outline" size={20} color="#FF794A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.main}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000&auto=format&fit=crop' }}
              style={styles.heroImage}
              contentFit="cover"
              transition={200}
            />
            <View style={[styles.heroOverlay, { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0 }]}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{meal.displayName || 'LUNCH'}</Text>
              </View>
              <Text style={styles.mealTitle}>{meal.name}</Text>
            </View>
          </View>

          {/* Nutrition Summary */}
          <View style={styles.nutritionRow}>
            <View style={styles.caloriesCard}>
              <Text style={styles.caloriesValue}>{meal.calories}</Text>
              <Text style={styles.caloriesLabel}>CALORIES</Text>
            </View>
            <View style={styles.macroCol}>
              <View style={styles.macroCard}>
                <Text style={styles.macroLabel}>PROTEIN</Text>
                <Text style={styles.macroValue}>{meal.protein}g</Text>
              </View>
              <View style={styles.macroCard}>
                <Text style={styles.macroLabel}>FATS</Text>
                <Text style={styles.macroValue}>{meal.fat}g</Text>
              </View>
            </View>
          </View>

          {/* Carbohydrates Detail Card */}
          <View style={styles.carbDetailCard}>
            <View style={styles.carbIconContainer}>
              <MaterialCommunityIcons name="grid-large" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.carbInfo}>
              <Text style={styles.carbLabel}>CARBOHYDRATES</Text>
              <Text style={styles.carbValue}>{meal.carbs}g</Text>
              <View style={styles.carbProgressBar}>
                <View style={styles.carbProgressFill} />
              </View>
            </View>
          </View>

          {/* Ingredients Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.itemCountBadge}>
                <Text style={styles.itemCountText}>{(meal.foods || []).length} Items</Text>
              </View>
            </View>

            <View>
              {(meal.foods || []).map((food, idx) => (
                <View key={idx} style={styles.ingredientRow}>
                  <View style={styles.ingredientIconBg}>
                    <MaterialCommunityIcons
                      name={food.icon || 'food-variant'}
                      size={20}
                      color="#FF7A00"
                    />
                  </View>
                  <Text style={styles.ingredientName}>{food.name}</Text>
                  <Text style={styles.ingredientWeight}>{food.amount}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Preparation Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Preparation</Text>
            <View>
              {(meal.preparation || []).map((step, idx) => (
                <View key={idx} style={styles.preparationStep}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{idx + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDescription}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Footer Action */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addLogButton}
            onPress={handleAddToLog}
          >
            <Text style={styles.addLogButtonText}>Add to log</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MealDetailScreen;
