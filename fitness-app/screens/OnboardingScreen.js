import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { styles } from './styles/OnboardingScreen.styles';

const { width } = Dimensions.get('window');
const OnboardingScreen = ({ navigation, route }) => {
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Get registration data from RegisterScreen
  const registrationData = route?.params?.registrationData || {};

  const [formData, setFormData] = useState({
    // Formatted name
    fullName: (registrationData.firstName || '') + (registrationData.firstName && registrationData.lastName ? ' ' : '') + (registrationData.lastName || ''),
    email: registrationData.email || '',
    password: registrationData.password || '',

    // Physical Info
    age: '',
    gender: 'male',
    height: '',
    weight: '',

    // Fitness Info
    fitnessLevel: 'beginner',
    fitnessGoals: [],
    activityLevel: 'moderately_active',
    workoutDuration: '30', // Defaulting to 30

    // Health Info
    targetWeight: '',
    bodyFatPercentage: '',

    // Nutrition Preferences
    dailyMeals: '3',
    foodPreferences: '',
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleFitnessGoal = (goalId) => {
    setFormData(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goalId)
        ? prev.fitnessGoals.filter(id => id !== goalId)
        : [...prev.fitnessGoals, goalId]
    }));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.fullName.trim() || !formData.age) {
        Alert.alert('Missing Field', 'Please enter your name and age.');
        return;
      }
    }
    if (currentStep === 1) {
      if (!formData.height || !formData.weight) {
        Alert.alert('Missing Field', 'Please enter your height and weight.');
        return;
      }
      if (formData.fitnessGoals.length === 0) {
        Alert.alert('Missing Selection', 'Please select at least one fitness focus.');
        return;
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      const [firstName, ...lastNameParts] = formData.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || '';

      const userData = {
        email: formData.email,
        password: formData.password,
        profile: {
          firstName: firstName,
          lastName: lastName,
          age: parseInt(formData.age) || 0,
          gender: formData.gender,
          height: parseFloat(formData.height) || 0,
          weight: parseFloat(formData.weight) || 0,
          fitnessLevel: formData.fitnessLevel,
          fitnessGoals: formData.fitnessGoals,
          activityLevel: formData.activityLevel,
          workoutDuration: parseInt(formData.workoutDuration) || 30,
        },
        healthMetrics: {
          targetWeight: parseFloat(formData.targetWeight) || null,
          waistCircumference: null,
          hipCircumference: null,
          bodyFatPercentage: parseFloat(formData.bodyFatPercentage) || null,
          muscleMass: null,
        },
        nutritionPreferences: {
          dailyMeals: parseInt(formData.dailyMeals) || 3,
          budgetLevel: 'medium',
          foodPreferences: formData.foodPreferences,
          foodAllergies: '',
        }
      };

      const result = await register(userData);
      if (!result.success) {
        Alert.alert('Registration Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fitnessGoalsList = [
    { id: 'weight_loss', label: 'Weight Loss', description: 'Burn calories and lean out.', icon: 'flame' },
    { id: 'muscle_gain', label: 'Muscle Gain', description: 'Hypertrophy and strength focus.', icon: 'barbell' },
    { id: 'endurance', label: 'Endurance', description: 'Stamina and cardiovascular health.', icon: 'pulse' },
    { id: 'strength', label: 'Strength', description: 'Increase raw strength', icon: 'fitness' },
    { id: 'flexibility', label: 'Flexibility', description: 'Improve body flexibility', icon: 'body' },
    { id: 'general_fitness', label: 'General Fitness', description: 'Stay fit daily', icon: 'heart' },
  ];

  const renderStep0 = () => (
    <ScrollView style={styles.stepContainer} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <View style={styles.editorialHeaderSection}>
        <Text style={styles.mainTitle}>THE BASICS</Text>
        <Text style={styles.mainSubtitle}>Let's start with who you are.</Text>
      </View>

      <View style={styles.avatarContainer}>
        {/* Placeholder for avatar - could be replaced with Image later */}
        <Icon name="person" size={60} color="#ABADAF" />
        <View style={styles.avatarCameraIcon}>
          <Icon name="camera" size={20} color="#000" />
        </View>
      </View>

      <View style={styles.inputFieldsContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>FULL NAME</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={formData.fullName}
              onChangeText={(text) => updateFormData('fullName', text)}
              placeholder="Enter your name"
              placeholderTextColor="#ABADAF"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>AGE</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={formData.age}
              onChangeText={(text) => updateFormData('age', text)}
              placeholder="How many years?"
              placeholderTextColor="#ABADAF"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.genderContainer}>
          <Text style={styles.inputLabel}>GENDER</Text>
          <View style={styles.genderButtonsRow}>
            <TouchableOpacity
              style={[styles.genderButton, formData.gender === 'male' && styles.genderButtonActive]}
              onPress={() => updateFormData('gender', 'male')}
            >
              <Text style={[styles.genderButtonText, formData.gender === 'male' && styles.genderButtonTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, formData.gender === 'female' && styles.genderButtonActive]}
              onPress={() => updateFormData('gender', 'female')}
            >
              <Text style={[styles.genderButtonText, formData.gender === 'female' && styles.genderButtonTextActive]}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.stepContainer} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
      <View style={styles.editorialHeaderSection}>
        <Text style={styles.mainTitle}>YOUR{'\n'}METRICS</Text>
        <Text style={styles.mainSubtitle}>Precision data for precision results.</Text>
      </View>

      <View style={styles.inputFieldsContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>HEIGHT</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={formData.height}
              onChangeText={(text) => updateFormData('height', text)}
              placeholder="180"
              placeholderTextColor="#ABADAF"
              keyboardType="numeric"
            />
            <Text style={styles.inputUnit}>CM</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>WEIGHT</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={formData.weight}
              onChangeText={(text) => updateFormData('weight', text)}
              placeholder="75"
              placeholderTextColor="#ABADAF"
              keyboardType="numeric"
            />
            <Text style={styles.inputUnit}>KG</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>SELECT YOUR FOCUS</Text>
      </View>

      <View style={styles.goalsWrapper}>
        {fitnessGoalsList.map((goal) => {
          const isSelected = formData.fitnessGoals.includes(goal.id);
          return (
            <TouchableOpacity
              key={goal.id}
              style={[styles.goalCard, isSelected && styles.goalCardSelected]}
              onPress={() => toggleFitnessGoal(goal.id)}
            >
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalTitle}>{goal.label}</Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </View>
              <View style={styles.goalIconContainer}>
                <Icon name={goal.icon} size={24} color={isSelected ? '#FF7043' : '#7A422D'} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  const levelOptions = [
    { id: 'beginner', label: 'BEGINNER', description: 'Starting out', icon: 'walk' },
    { id: 'intermediate', label: 'INTERMEDIATE', description: 'Consistent trainer', icon: 'flash', recommended: true },
    { id: 'advanced', label: 'ADVANCED', description: 'Elite athlete', icon: 'medal' },
  ];

  const renderStep2 = () => (
    <ScrollView style={styles.stepContainer} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
      <View style={styles.editorialHeaderSection}>
        <View style={styles.stepBadgeContainer}>
          <Text style={styles.stepBadgeText}>STEP 03 / 04</Text>
        </View>
        <View style={styles.levelTitleRow}>
          <Text style={styles.levelTitleBlack}>YOUR </Text>
          <Text style={styles.levelTitleOrange}>LEVEL</Text>
        </View>
        <Text style={styles.mainSubtitle}>Where does your journey begin?</Text>
      </View>

      <View style={{ gap: 8 }}>
        {levelOptions.map(level => {
          const isSelected = formData.fitnessLevel === level.id;
          return (
            <TouchableOpacity
              key={level.id}
              style={[styles.levelCard, isSelected && styles.levelCardSelected]}
              onPress={() => updateFormData('fitnessLevel', level.id)}
            >
              <View style={[styles.levelIconCircle, isSelected && styles.levelIconCircleSelected]}>
                <Icon name={level.icon} size={24} color={isSelected ? '#FFFFFF' : '#FF7043'} />
              </View>
              <Text style={styles.levelTitle}>{level.label}</Text>
              <Text style={styles.levelDescription}>{level.description}</Text>

              {level.recommended && isSelected && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContainer} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
      <View style={styles.editorialHeaderSection}>
        <Text style={styles.mainTitle}>FINISHING{'\n'}UP</Text>
        <Text style={styles.mainSubtitle}>Just a few more details.</Text>
      </View>

      <View style={styles.inputFieldsContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>ACTIVITY LEVEL</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.activityLevel}
              onValueChange={(value) => updateFormData('activityLevel', value)}
              style={styles.picker}
            >
              <Picker.Item label="Sedentary" value="sedentary" />
              <Picker.Item label="Lightly Active" value="lightly_active" />
              <Picker.Item label="Moderately Active" value="moderately_active" />
              <Picker.Item label="Very Active" value="very_active" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>DAILY MEALS</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.dailyMeals}
              onValueChange={(value) => updateFormData('dailyMeals', value)}
              style={styles.picker}
            >
              <Picker.Item label="2 meals per day" value="2" />
              <Picker.Item label="3 meals per day" value="3" />
              <Picker.Item label="4 meals per day" value="4" />
              <Picker.Item label="5 meals per day" value="5" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>TARGET WEIGHT</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={formData.targetWeight}
              onChangeText={(text) => updateFormData('targetWeight', text)}
              placeholder="Optional"
              placeholderTextColor="#ABADAF"
              keyboardType="numeric"
            />
            <Text style={styles.inputUnit}>KG</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerTopBar}>
        <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
          <Icon name="arrow-back" size={24} color="#EA580C" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>FITLIFE</Text>
        </View>
      </View>

      <View style={styles.content}>
        {currentStep === 0 && renderStep0()}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </View>

      <View style={styles.fixedActionBottomArea}>
        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
          onPress={currentStep < 3 ? handleNext : handleComplete}
          disabled={isLoading}
        >
          <Text style={currentStep < 3 ? styles.nextButtonText : styles.completeButtonText}>
            {isLoading ? 'CREATING...' : currentStep === 2 ? 'FINISH SETUP' : currentStep === 3 ? 'COMPLETE' : 'NEXT'}
          </Text>
        </TouchableOpacity>

        <View style={styles.paginationContainer}>
          <View style={currentStep === 0 ? styles.paginationDotActive : styles.paginationDotInactive} />
          <View style={currentStep === 1 ? styles.paginationDotActive : styles.paginationDotInactive} />
          <View style={currentStep === 2 ? styles.paginationDotActive : styles.paginationDotInactive} />
          <View style={currentStep === 3 ? styles.paginationDotActive : styles.paginationDotInactive} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
