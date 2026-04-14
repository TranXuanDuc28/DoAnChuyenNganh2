import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import styles from './styles/AllergyPreferenceScreen.styles';

const DIETARY_FOCUS = [
  { id: 'keto', title: 'Keto', sub: 'High fat, low carb focus', icon: 'restaurant-outline' },
  { id: 'vegan', title: 'Vegan', sub: 'Plant-based lifestyle', icon: 'leaf-outline' },
  { id: 'paleo', title: 'Paleo', sub: 'Whole food foundations', icon: 'fish-outline' },
  { id: 'vegetarian', title: 'Vegetarian', sub: 'No meat, dairy okay', icon: 'sunny-outline' },
];

const EXCLUSIONS = [
  { id: 'nut-free', title: 'Nut-free', sub: 'Peanuts, tree nuts, etc.', icon: 'flash' },
  { id: 'gluten-free', title: 'Gluten-free', sub: 'Wheat, barley, rye', icon: 'pizza-outline' },
  { id: 'dairy-free', title: 'Dairy-free', sub: 'Lactose intolerance support', icon: 'water-outline' },
];

const AllergyPreferenceScreen = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  
  const [selectedFocus, setSelectedFocus] = useState(user?.foodPreferences?.[0] || 'keto');
  const [allergies, setAllergies] = useState({
    'nut-free': user?.foodAllergies?.includes('nut-free') || false,
    'gluten-free': user?.foodAllergies?.includes('gluten-free') || false,
    'dairy-free': user?.foodAllergies?.includes('dairy-free') || false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.foodPreferences && user.foodPreferences.length > 0) {
        setSelectedFocus(user.foodPreferences[0].toLowerCase());
      }
      const allergyMap = {};
      EXCLUSIONS.forEach(ex => {
        allergyMap[ex.id] = user.foodAllergies?.includes(ex.id) || false;
      });
      setAllergies(allergyMap);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      const activeAllergies = Object.keys(allergies).filter(key => allergies[key]);
      
      const updateData = {
        foodPreferences: [selectedFocus],
        foodAllergies: activeAllergies
      };

      const response = await authAPI.updateProfile(updateData);

      if (response.data.user) {
        updateUser(response.data.user);
        Alert.alert('Success', 'Your nutrition profile has been updated.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Update preferences error:', error);
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergy = (id) => {
    setAllergies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#191C1C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PREFERENCES</Text>
        <TouchableOpacity style={styles.optionsBtn}>
          <Icon name="ellipsis-vertical" size={20} color="#191C1C" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageContainer}>
            <Icon name="restaurant" size={200} color="#FF794A" />
          </View>
          <View>
            <Text style={styles.heroTitle}>Tailor{'\n'}Your Fuel</Text>
            <Text style={styles.heroSub}>
              Define your dietary boundaries to optimize your meal recommendations.
            </Text>
          </View>
        </View>

        {/* Dietary Focus */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Dietary Focus</Text>
          <View style={styles.bentoGrid}>
            {DIETARY_FOCUS.map((focus) => (
              <TouchableOpacity
                key={focus.id}
                style={[
                  styles.bentoCard,
                  selectedFocus === focus.id && styles.bentoCardSelected
                ]}
                onPress={() => setSelectedFocus(focus.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardIconContainer}>
                  <Icon name={focus.icon} size={28} color={selectedFocus === focus.id ? "#FF794A" : "#64748B"} />
                  {selectedFocus === focus.id ? (
                    <View style={styles.checkCircle}>
                      <Icon name="checkmark" size={14} color="#FFF" />
                    </View>
                  ) : (
                    <View style={styles.emptyCircle} />
                  )}
                </View>
                <Text style={styles.cardTitle}>{focus.title}</Text>
                <Text style={styles.cardSub}>{focus.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exclusions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Exclusions & Allergies</Text>
          <View style={styles.allergyList}>
            {EXCLUSIONS.map((item) => (
              <View key={item.id} style={styles.allergyItem}>
                <View style={styles.allergyIconBox}>
                  <Icon name={item.icon} size={24} color="#FF794A" />
                </View>
                <View style={styles.allergyInfo}>
                  <Text style={styles.allergyName}>{item.title}</Text>
                  <Text style={styles.allergySub}>{item.sub}</Text>
                </View>
                <Switch
                  trackColor={{ false: "#E2E8F0", true: "#FF794A" }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E2E8F0"
                  onValueChange={() => toggleAllergy(item.id)}
                  value={allergies[item.id]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity 
          style={styles.updateBtn} 
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.updateBtnText}>Update Nutrition Profile</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Changes will take effect in your next daily meal plan generation.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AllergyPreferenceScreen;
