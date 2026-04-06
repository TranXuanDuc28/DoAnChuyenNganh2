import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import styles from './styles/LogMealScreen.styles';

const { width } = Dimensions.get('window');

const LogMealScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Recent');
  const [selectedItems, setSelectedItems] = useState([]);

  // Mock data based on the user-provided design
  const quickAddItems = [
    { id: 'q1', name: 'Egg', icon: 'egg' },
    { id: 'q2', name: 'Chicken', icon: 'restaurant' },
    { id: 'q3', name: 'Rice', icon: 'leaf' },
    { id: 'q4', name: 'Avocado', icon: 'nutrition' },
  ];

  const recentFoods = [
    {
      id: 'f1',
      name: 'Oatmeal',
      calories: 150,
      portion: '1 bowl',
      protein: 5,
      carbs: 27,
      fat: 3,
      image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=100&q=80',
    },
    {
      id: 'f2',
      name: 'Greek Yogurt',
      calories: 120,
      portion: '150g',
      protein: 15,
      carbs: 6,
      fat: 4,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100&q=80',
    },
    {
      id: 'f3',
      name: 'Whole Eggs',
      calories: 140,
      portion: '2 units',
      protein: 12,
      carbs: 1,
      fat: 10,
      image: 'https://images.unsplash.com/photo-1582722872445-44c59ebc41dd?w=100&q=80',
    },
    {
      id: 'f4',
      name: 'Strawberries',
      calories: 32,
      portion: '100g',
      protein: 1,
      carbs: 8,
      fat: 0,
      image: 'https://images.unsplash.com/photo-1464965224031-937d0f946830?w=100&q=80',
    },
    {
      id: 'f5',
      name: 'Skimmed Milk',
      calories: 80,
      portion: '200ml',
      protein: 8,
      carbs: 12,
      fat: 0,
      image: 'https://images.unsplash.com/photo-1563636619-e910f01ff148?w=100&q=80',
    },
  ];

  const toggleSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const totalCalories = recentFoods
    .filter(food => selectedItems.includes(food.id))
    .reduce((sum, food) => sum + food.calories, 0);

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
            <Text style={styles.headerTitle}>Log Meal</Text>
          </View>
          <TouchableOpacity onPress={() => {}} style={styles.backButton}>
            <Icon name="search-outline" size={24} color="#A8390D" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color="#58423B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food..."
            placeholderTextColor="#58423B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.barcodeIcon}>
            <Icon name="barcode-outline" size={20} color="#58423B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['Recent', 'Favorites', 'Suggested'].map((tab) => (
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

      {/* Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
      >
        {/* Quick Add Section */}
        <View style={styles.quickAddSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAddScroll}>
            {quickAddItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.quickAddItem}>
                <Text style={styles.quickAddName}>{item.name}</Text>
                <View style={styles.quickAddIcon}>
                   <Icon name="add-outline" size={10} color="#FFFFFF" style={{ alignSelf: 'center', marginTop: 1 }} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Food List */}
        <View style={styles.foodList}>
          {recentFoods.map((food) => {
            const isSelected = selectedItems.includes(food.id);
            return (
              <TouchableOpacity 
                key={food.id} 
                style={[styles.foodCard, isSelected && styles.selectedCard]}
                onPress={() => toggleSelection(food.id)}
              >
                <View style={styles.foodInfoGroup}>
                  <View style={styles.foodImageContainer}>
                    <Image source={{ uri: food.image }} style={styles.foodImage} />
                  </View>
                  <View style={styles.foodTextDetails}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodMeta}>{food.calories} kcal • {food.portion}</Text>
                    <Text style={[styles.foodMacros, isSelected && styles.selectedMacros]}>
                      P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
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
      </ScrollView>

      {/* Floating Footer Button */}
      {selectedItems.length > 0 && (
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.footerButton} onPress={handleGoBack}>
            <Text style={styles.footerButtonText}>
              Add Selected ({selectedItems.length} items)
            </Text>
            <Text style={styles.footerDot}>•</Text>
            <Text style={styles.footerKcal}>{totalCalories} kcal</Text>
            <Icon name="arrow-forward-outline" size={18} color="#681C00" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LogMealScreen;
