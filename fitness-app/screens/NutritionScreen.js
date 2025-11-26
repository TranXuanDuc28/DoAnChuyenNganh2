import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import colors from '../theme/colors';

const NutritionScreen = () => {
  const [selectedTab, setSelectedTab] = useState('today');

  const todayMeals = [
    {
      id: 1,
      type: 'Breakfast',
      name: 'Oatmeal with Berries',
      calories: 320,
      protein: 12,
      carbs: 58,
      fat: 8,
      time: '8:00 AM',
    },
    {
      id: 2,
      type: 'Lunch',
      name: 'Grilled Chicken Salad',
      calories: 450,
      protein: 35,
      carbs: 25,
      fat: 18,
      time: '1:00 PM',
    },
    {
      id: 3,
      type: 'Snack',
      name: 'Greek Yogurt',
      calories: 150,
      protein: 15,
      carbs: 12,
      fat: 5,
      time: '4:00 PM',
    },
  ];

  const nutritionGoals = {
    calories: { consumed: 920, target: 2000, unit: 'kcal' },
    protein: { consumed: 62, target: 150, unit: 'g' },
    carbs: { consumed: 95, target: 250, unit: 'g' },
    fat: { consumed: 31, target: 67, unit: 'g' },
    water: { consumed: 6, target: 8, unit: 'glasses' },
  };

  const tabs = [
    { id: 'today', title: 'Today', icon: 'calendar' },
    { id: 'log', title: 'Log Food', icon: 'add-circle' },
    { id: 'plans', title: 'Meal Plans', icon: 'restaurant' },
  ];

  const renderMealItem = ({ item }) => (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealTypeContainer}>
          <Text style={styles.mealType}>{item.type}</Text>
          <Text style={styles.mealTime}>{item.time}</Text>
        </View>
        <TouchableOpacity>
          <Icon name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.mealName}>{item.name}</Text>
      <View style={styles.mealMacros}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{item.calories}</Text>
          <Text style={styles.macroLabel}>Cal</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{item.protein}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{item.carbs}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{item.fat}g</Text>
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
      </View>
    </View>
  );

  const renderNutritionGoal = (key, goal) => {
    const percentage = Math.min((goal.consumed / goal.target) * 100, 100);
    return (
      <View style={styles.goalCard}>
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrition</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="barcode" size={24} color="#007AFF" />
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
              color={selectedTab === tab.id ? '#458094' : '#666'}
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

      <ScrollView style={styles.content}>
        {selectedTab === 'today' && (
          <View>
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
          </View>
        )}

        {selectedTab === 'log' && (
          <View style={styles.logContainer}>
            <Text style={styles.sectionTitle}>Log Food</Text>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <Text style={styles.searchPlaceholder}>Search for food...</Text>
            </View>
            <TouchableOpacity style={styles.scanButton}>
              <Icon name="camera" size={24} color="#fff" />
              <Text style={styles.scanButtonText}>Scan Barcode</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedTab === 'plans' && (
          <View style={styles.plansContainer}>
            <Text style={styles.sectionTitle}>Meal Plans</Text>
            <Text style={styles.comingSoon}>AI-powered meal plans coming soon!</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#458094',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
  },
  goalsSection: {
    marginBottom: 20,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  goalProgress: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  mealsSection: {
    marginBottom: 20,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeContainer: {
    flex: 1,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  mealName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  mealMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  quickActionButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
  },
  logContainer: {
    paddingVertical: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#666',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 16,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  plansContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  comingSoon: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default NutritionScreen;
