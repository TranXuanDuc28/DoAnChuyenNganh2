import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

const FoodDetailModal = ({ visible, foodData, onClose, onAddFood }) => {
  const [servingAmount, setServingAmount] = useState('1');
  const [mealType, setMealType] = useState('breakfast');

  if (!foodData) return null;

  const handleAddFood = () => {
    const amount = parseFloat(servingAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid serving amount');
      return;
    }

    // Calculate nutrition based on serving amount
    const multiplier = amount;
    const foodToAdd = {
      ...foodData,
      servingAmount: amount,
      mealType,
      calories: Math.round(foodData.calories * multiplier),
      protein: Math.round(foodData.protein * multiplier),
      carbs: Math.round(foodData.carbs * multiplier),
      fat: Math.round(foodData.fat * multiplier),
      fiber: Math.round(foodData.fiber * multiplier),
      sugar: Math.round(foodData.sugar * multiplier),
      sodium: Math.round(foodData.sodium * multiplier),
    };

    onAddFood(foodToAdd);
    onClose();
  };

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: 'sunny' },
    { id: 'lunch', label: 'Lunch', icon: 'restaurant' },
    { id: 'dinner', label: 'moon', icon: 'moon' },
    { id: 'snack', label: 'Snack', icon: 'fast-food' },
  ];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Food Details</Text>
          <TouchableOpacity onPress={handleAddFood}>
            <Text style={styles.addButton}>Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Food Image */}
          {foodData.imageUrl && (
            <Image source={{ uri: foodData.imageUrl }} style={styles.foodImage} />
          )}

          {/* Food Name & Brand */}
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{foodData.name}</Text>
            {foodData.brand && (
              <Text style={styles.foodBrand}>{foodData.brand}</Text>
            )}
            <View style={styles.barcodeContainer}>
              <Icon name="barcode-outline" size={16} color="#666" />
              <Text style={styles.barcodeText}>{foodData.barcode}</Text>
            </View>
          </View>

          {/* Serving Size Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Serving Amount</Text>
            <View style={styles.servingInputContainer}>
              <TouchableOpacity
                style={styles.servingButton}
                onPress={() => {
                  const current = parseFloat(servingAmount) || 1;
                  if (current > 0.5) setServingAmount((current - 0.5).toString());
                }}
              >
                <Icon name="remove" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TextInput
                style={styles.servingInput}
                value={servingAmount}
                onChangeText={setServingAmount}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <Text style={styles.servingUnit}>× {foodData.servingSize}</Text>
              <TouchableOpacity
                style={styles.servingButton}
                onPress={() => {
                  const current = parseFloat(servingAmount) || 1;
                  setServingAmount((current + 0.5).toString());
                }}
              >
                <Icon name="add" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Nutrition Facts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition Facts (per {foodData.servingSize})</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionCard}>
                <Icon name="flame" size={32} color="#FF6B6B" />
                <Text style={styles.nutritionValue}>{foodData.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionCard}>
                <Icon name="fitness" size={32} color="#4ECDC4" />
                <Text style={styles.nutritionValue}>{foodData.protein}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionCard}>
                <Icon name="nutrition" size={32} color="#FFD93D" />
                <Text style={styles.nutritionValue}>{foodData.carbs}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionCard}>
                <Icon name="water" size={32} color="#95E1D3" />
                <Text style={styles.nutritionValue}>{foodData.fat}g</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>

            {/* Additional Nutrition */}
            <View style={styles.additionalNutrition}>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionRowLabel}>Fiber</Text>
                <Text style={styles.nutritionRowValue}>{foodData.fiber}g</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionRowLabel}>Sugar</Text>
                <Text style={styles.nutritionRowValue}>{foodData.sugar}g</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionRowLabel}>Sodium</Text>
                <Text style={styles.nutritionRowValue}>{foodData.sodium}mg</Text>
              </View>
            </View>
          </View>

          {/* Meal Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add to Meal</Text>
            <View style={styles.mealTypeContainer}>
              {mealTypes.map((meal) => (
                <TouchableOpacity
                  key={meal.id}
                  style={[
                    styles.mealTypeButton,
                    mealType === meal.id && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setMealType(meal.id)}
                >
                  <Icon
                    name={meal.icon}
                    size={24}
                    color={mealType === meal.id ? '#fff' : '#007AFF'}
                  />
                  <Text
                    style={[
                      styles.mealTypeText,
                      mealType === meal.id && styles.mealTypeTextActive,
                    ]}
                  >
                    {meal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ingredients */}
          {foodData.ingredients && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text style={styles.ingredientsText}>{foodData.ingredients}</Text>
            </View>
          )}
        </ScrollView>

        {/* Add Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addFoodButton} onPress={handleAddFood}>
            <Icon name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.addFoodButtonText}>Add to {mealTypes.find(m => m.id === mealType)?.label}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  foodImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e0e0e0',
  },
  foodInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  foodBrand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  barcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  barcodeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  servingInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  servingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  servingInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    minWidth: 60,
    marginHorizontal: 12,
  },
  servingUnit: {
    fontSize: 16,
    color: '#666',
    marginRight: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nutritionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  additionalNutrition: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  nutritionRowLabel: {
    fontSize: 16,
    color: '#666',
  },
  nutritionRowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mealTypeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  mealTypeTextActive: {
    color: '#fff',
  },
  ingredientsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
  },
  addFoodButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FoodDetailModal;





