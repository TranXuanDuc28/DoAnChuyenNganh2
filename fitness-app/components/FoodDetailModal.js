import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles/FoodDetailModal.styles';

const FoodDetailModal = ({ visible, foodData, onClose, onAddFood }) => {
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState('breakfast');

  useEffect(() => {
    if (visible) {
      setServings(1);
    }
  }, [visible]);

  if (!foodData) return null;

  // Real-time calculated values based on servings
  const calculatedCalories = Math.round(foodData.calories * servings);
  const calculatedProtein = Math.round(foodData.protein * servings);
  const calculatedCarbs = Math.round(foodData.carbs * servings);
  const calculatedFat = Math.round(foodData.fat * servings);

  const handleIncrement = () => setServings(prev => parseFloat((prev + 0.5).toFixed(1)));
  const handleDecrement = () => setServings(prev => prev > 0.5 ? parseFloat((prev - 0.5).toFixed(1)) : 0.5);

  const handleAddFood = () => {
    const foodToAdd = {
      ...foodData,
      servingAmount: servings,
      mealType,
      calories: calculatedCalories,
      protein: calculatedProtein,
      carbs: calculatedCarbs,
      fat: calculatedFat,
    };
    onAddFood(foodToAdd);
    onClose();
  };

  const MacroCard = ({ label, value, max, color }) => (
    <View style={styles.macroCard}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{value}g</Text>
      </View>
      <View style={[styles.progressBarBg, { width: '100%' }]}>
        <View 
          style={[
            styles.progressBarFill, 
            { backgroundColor: color, width: `${Math.min(100, (value / max) * 100)}%` }
          ]} 
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <StatusBar barStyle="light-content" />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Banner Image */}
          <View>
            <Image 
              source={{ uri: foodData.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80' }} 
              style={styles.imageBanner} 
            />
            <LinearGradient
              colors={['transparent', 'rgba(251, 248, 252, 0.8)', '#FFFFFF']}
              style={styles.imageOverlay}
            />
            
            {/* Header Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={onClose}>
                <Icon name="chevron-back" size={20} color="#1B1B1E" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Icon name="heart-outline" size={20} color="#1B1B1E" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.categoryLabel}>{foodData.brand || 'Premium Selection'}</Text>
              <View style={styles.titleRow}>
                <Text style={styles.foodName} numberOfLines={2}>{foodData.name}</Text>
                <View style={styles.calorieGroup}>
                  <Text style={styles.calorieValue}>{calculatedCalories}</Text>
                  <Text style={styles.calorieLabel}>Kcal</Text>
                </View>
              </View>
            </View>

            {/* Macros Section */}
            <View style={styles.macrosSection}>
              <MacroCard label="Protein" value={calculatedProtein} max={50} color="#FF7849" />
              <MacroCard label="Carbs" value={calculatedCarbs} max={100} color="#78574A" />
              <MacroCard label="Fat" value={calculatedFat} max={40} color="#F4B400" />
            </View>

            {/* Portion Control */}
            <View style={styles.portionSection}>
              <Text style={styles.sectionTitle}>Portion Control</Text>
              <View style={styles.portionControl}>
                <TouchableOpacity style={styles.portionButton} onPress={handleDecrement}>
                  <Icon name="remove" size={24} color="#A8390D" />
                </TouchableOpacity>
                <View style={styles.portionDisplay}>
                  <Text style={styles.portionValue}>{servings}</Text>
                  <Text style={styles.portionLabel}>Servings</Text>
                </View>
                <TouchableOpacity style={styles.portionButton} onPress={handleIncrement}>
                  <Icon name="add" size={24} color="#A8390D" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Nutrition Facts */}
            <View style={styles.nutritionFactsSection}>
              <View style={styles.factsHeader}>
                <Text style={styles.factsTitle}>Nutrition Facts</Text>
                <Text style={styles.factsSubtitle}>per {foodData.servingSize || 'serving'}</Text>
              </View>
              <View>
                <View style={styles.factRow}>
                  <Text style={styles.factLabel}>Dietary Fiber</Text>
                  <Text style={styles.factValue}>{foodData.fiber || 0}g</Text>
                </View>
                <View style={styles.factRow}>
                  <Text style={styles.factLabel}>Sugars</Text>
                  <Text style={styles.factValue}>{foodData.sugar || 0}g</Text>
                </View>
                <View style={styles.factRow}>
                  <Text style={styles.factLabel}>Sodium</Text>
                  <Text style={styles.factValue}>{foodData.sodium || 0}mg</Text>
                </View>
              </View>
            </View>

            {/* Badges */}
            <View style={styles.badgesContainer}>
              {foodData.protein > 10 && (
                <View style={[styles.badge, { backgroundColor: '#FFDBCE' }]}>
                  <Text style={[styles.badgeText, { color: '#2D150C' }]}>High Protein</Text>
                </View>
              )}
              {foodData.fiber > 5 && (
                <View style={[styles.badge, { backgroundColor: '#E4E2E2' }]}>
                  <Text style={[styles.badgeText, { color: '#1B1C1C' }]}>High Fiber</Text>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: '#EAE7EB' }]}>
                <Text style={[styles.badgeText, { color: '#58423B' }]}>Nutrient Dense</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Floating Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
            <Icon name="add-circle" size={24} color="#681C00" />
            <Text style={styles.addButtonText}>Add to Meal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FoodDetailModal;
