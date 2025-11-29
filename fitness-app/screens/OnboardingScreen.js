import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { styles } from './styles/OnboardingScreen.styles';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation, route }) => {
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Get registration data from RegisterScreen
  const registrationData = route?.params?.registrationData || {};

  const [formData, setFormData] = useState({
    // Personal Info (from RegisterScreen)
    firstName: registrationData.firstName || '',
    lastName: registrationData.lastName || '',
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
    workoutDuration: '',

    // Health Info
    targetWeight: '',
    waistCircumference: '',
    hipCircumference: '',
    bodyFatPercentage: '',
    muscleMass: '',

    // Nutrition Preferences
    dailyMeals: '3',
    budgetLevel: 'medium',
    foodPreferences: '',
    foodAllergies: '',
  });

  const fitnessGoals = [
    { id: 'weight_loss', label: 'Weight Loss', icon: 'trending-down' },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: 'barbell' },
    { id: 'endurance', label: 'Endurance', icon: 'timer' },
    { id: 'strength', label: 'Strength', icon: 'fitness' },
    { id: 'flexibility', label: 'Flexibility', icon: 'body' },
    { id: 'general_fitness', label: 'General Fitness', icon: 'heart' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Validate required fields
      if (!formData.age || !formData.height || !formData.weight) {
        Alert.alert('Error', 'Please fill in your age, height, and weight');
        return;
      }

      if (formData.fitnessGoals.length === 0) {
        Alert.alert('Error', 'Please select at least one fitness goal');
        return;
      }

      setIsLoading(true);

      // Prepare user data for registration
      const userData = {
        email: formData.email,
        password: formData.password,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: parseInt(formData.age) || 0,
          gender: formData.gender,
          height: parseFloat(formData.height) || 0,
          weight: parseFloat(formData.weight) || 0,
          fitnessLevel: formData.fitnessLevel,
          fitnessGoals: formData.fitnessGoals,
          activityLevel: formData.activityLevel,
          workoutDuration: parseInt(formData.workoutDuration) || null,
        },
        healthMetrics: {
          targetWeight: parseFloat(formData.targetWeight) || null,
          waistCircumference: parseFloat(formData.waistCircumference) || null,
          hipCircumference: parseFloat(formData.hipCircumference) || null,
          bodyFatPercentage: parseFloat(formData.bodyFatPercentage) || null,
          muscleMass: parseFloat(formData.muscleMass) || null,
        },
        nutritionPreferences: {
          dailyMeals: parseInt(formData.dailyMeals) || 3,
          budgetLevel: formData.budgetLevel,
          foodPreferences: formData.foodPreferences,
          foodAllergies: formData.foodAllergies,
        }
      };

      const result = await register(userData);
      if (!result.success) {
        Alert.alert('Registration Failed', result.error);
      }
      // Navigation to home is handled automatically by AuthContext
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // const validateForm = () => {
  //   const { firstName, lastName, email, password, confirmPassword, age, height, weight } = formData;

  //   if (!firstName || !lastName || !email || !password) {
  //     Alert.alert('Error', 'Please fill in all required fields');
  //     return false;
  //   }

  //   if (password !== confirmPassword) {
  //     Alert.alert('Error', 'Passwords do not match');
  //     return false;
  //   }

  //   if (!age || !height || !weight) {
  //     Alert.alert('Error', 'Please fill in your physical information');
  //     return false;
  //   }

  //   return true;
  // };

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

  const renderPhysicalInfoStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Age *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.age}
          onChangeText={(text) => updateFormData('age', text)}
          placeholder="Enter your age"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Gender *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.gender}
            onValueChange={(value) => updateFormData('gender', value)}
            style={styles.picker}
            itemStyle={{ height: 50, color: colors.textPrimary }}
          >
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Height (cm) *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.height}
          onChangeText={(text) => updateFormData('height', text)}
          placeholder="Enter your height in cm"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Weight (kg) *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.weight}
          onChangeText={(text) => updateFormData('weight', text)}
          placeholder="Enter your weight in kg"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Fitness Level *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.fitnessLevel}
            onValueChange={(value) => updateFormData('fitnessLevel', value)}
            style={styles.picker}
            itemStyle={{ height: 50, color: colors.textPrimary }}
          >
            <Picker.Item label="Beginner" value="beginner" />
            <Picker.Item label="Intermediate" value="intermediate" />
            <Picker.Item label="Advanced" value="advanced" />
          </Picker>
        </View>
      </View>
    </ScrollView>
  );

  const renderFitnessGoalsStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>

      <View style={styles.goalsContainer}>
        {fitnessGoals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              formData.fitnessGoals.includes(goal.id) && styles.goalCardSelected
            ]}
            onPress={() => toggleFitnessGoal(goal.id)}
          >
            <Icon
              name={goal.icon}
              size={30}
              color={formData.fitnessGoals.includes(goal.id) ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.goalText,
              formData.fitnessGoals.includes(goal.id) && styles.goalTextSelected
            ]}>
              {goal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Activity Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.activityLevel}
            onValueChange={(value) => updateFormData('activityLevel', value)}
            style={styles.picker}
            itemStyle={{ height: 50, color: colors.textPrimary }}
          >
            <Picker.Item label="Sedentary" value="sedentary" />
            <Picker.Item label="Lightly Active" value="lightly_active" />
            <Picker.Item label="Moderately Active" value="moderately_active" />
            <Picker.Item label="Very Active" value="very_active" />
            <Picker.Item label="Extremely Active" value="extremely_active" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Workout Duration (minutes/day)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.workoutDuration}
          onChangeText={(text) => updateFormData('workoutDuration', text)}
          placeholder="How many minutes per day do you plan to workout?"
          keyboardType="numeric"
        />
        <Text style={styles.helperText}>
          Average time you plan to spend on workouts each day
        </Text>
      </View>
    </ScrollView>
  );

  const renderHealthInfoStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
      <Text style={styles.stepDescription}>
        This information helps us provide more accurate recommendations. You can update these later.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Target Weight (kg)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.targetWeight}
          onChangeText={(text) => updateFormData('targetWeight', text)}
          placeholder="Enter your target weight"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Waist Circumference (cm)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.waistCircumference}
          onChangeText={(text) => updateFormData('waistCircumference', text)}
          placeholder="Enter waist circumference"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Hip Circumference (cm)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.hipCircumference}
          onChangeText={(text) => updateFormData('hipCircumference', text)}
          placeholder="Enter hip circumference"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Body Fat Percentage (%)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.bodyFatPercentage}
          onChangeText={(text) => updateFormData('bodyFatPercentage', text)}
          placeholder="Enter body fat % (optional)"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Muscle Mass (kg)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.muscleMass}
          onChangeText={(text) => updateFormData('muscleMass', text)}
          placeholder="Enter muscle mass (optional)"
          keyboardType="numeric"
        />
      </View>
    </ScrollView>
  );

  const renderNutritionPreferencesStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Daily Meals</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.dailyMeals}
            onValueChange={(value) => updateFormData('dailyMeals', value)}
            style={styles.picker}
            itemStyle={{ height: 50, color: colors.textPrimary }}
          >
            <Picker.Item label="2 meals per day" value="2" />
            <Picker.Item label="3 meals per day" value="3" />
            <Picker.Item label="4 meals per day" value="4" />
            <Picker.Item label="5 meals per day" value="5" />
            <Picker.Item label="6 meals per day" value="6" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Budget Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.budgetLevel}
            onValueChange={(value) => updateFormData('budgetLevel', value)}
            style={styles.picker}
            itemStyle={{ height: 50, color: colors.textPrimary }}
          >
            <Picker.Item label="Low Budget" value="low" />
            <Picker.Item label="Medium Budget" value="medium" />
            <Picker.Item label="High Budget" value="high" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Food Preferences (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          value={formData.foodPreferences}
          onChangeText={(text) => updateFormData('foodPreferences', text)}
          placeholder="e.g., Healthy, High Protein, Low Carb, Vegetarian, Vegan, Keto"
          multiline
          numberOfLines={3}
        />
        <Text style={styles.helperText}>
          Enter your food preferences separated by commas
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Food Allergies (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          value={formData.foodAllergies}
          onChangeText={(text) => updateFormData('foodAllergies', text)}
          placeholder="e.g., Seafood, Dairy, Nuts, Eggs, Gluten, Soy"
          multiline
          numberOfLines={3}
        />
        <Text style={styles.helperText}>
          Enter any food allergies separated by commas
        </Text>
      </View>
    </ScrollView>
  );

  const steps = [
    {
      title: 'Physical Information',
      subtitle: 'Help us understand your body',
      render: renderPhysicalInfoStep,
    },
    {
      title: 'Fitness Goals',
      subtitle: 'What do you want to achieve?',
      render: renderFitnessGoalsStep,
    },
    {
      title: 'Nutrition Preferences',
      subtitle: 'Customize your meal plans',
      render: renderNutritionPreferencesStep,
    },
    {
      title: 'Health Information',
      subtitle: 'Current health metrics (Optional)',
      render: renderHealthInfoStep,
    },
  ];

  return (
    <ImageBackground
      source={require('../image/banner3.jpg')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.75)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / steps.length) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep + 1} of {steps.length}
            </Text>
          </View>

          <View style={styles.stepContent}>
            {steps[currentStep].render()}
          </View>

          <View style={styles.buttonContainer}>
            {currentStep > 0 ? (
              <TouchableOpacity
                style={styles.previousButton}
                onPress={handlePrevious}
              >
                <Text style={styles.previousButtonText}>Previous</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.previousButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={20} color={colors.textSecondary} />
                <Text style={styles.previousButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            {currentStep < steps.length - 1 ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Icon name="arrow-forward" size={20} color={colors.textOnPrimary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.completeButton, isLoading && styles.completeButtonDisabled]}
                onPress={handleComplete}
                disabled={isLoading}
              >
                <Text style={styles.completeButtonText}>
                  {isLoading ? 'Creating Account...' : 'Complete Registration'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export default OnboardingScreen;
