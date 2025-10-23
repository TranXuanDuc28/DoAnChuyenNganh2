import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Physical Info
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    
    // Fitness Info
    fitnessLevel: 'beginner',
    fitnessGoals: [],
    activityLevel: 'moderately_active',
    
    // Health Info
    currentWeight: '',
    bodyFatPercentage: '',
    restingHeartRate: '',
  });

  const fitnessGoals = [
    { id: 'weight_loss', label: 'Weight Loss', icon: 'trending-down' },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: 'barbell' },
    { id: 'endurance', label: 'Endurance', icon: 'timer' },
    { id: 'strength', label: 'Strength', icon: 'fitness' },
    { id: 'flexibility', label: 'Flexibility', icon: 'body' },
    { id: 'general_fitness', label: 'General Fitness', icon: 'heart' },
  ];
  ;

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
      // Validate form data
      // if (!validateForm()) {
      //   return;
      // }

      // Navigate to login or register
      navigation.navigate('Register', { formData });
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
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

  const WelcomeStep = () => (
    <View style={styles.stepContainer}>
      <Icon name="fitness" size={80} color="#007AFF" style={styles.welcomeIcon} />
      <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
      <Text style={styles.stepDescription}>
        Get personalized workout plans, nutrition advice, and health insights powered by AI.
        Let's create your perfect fitness journey!
      </Text>
    </View>
  );

  const PersonalInfoStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>First Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.firstName}
          onChangeText={(text) => updateFormData('firstName', text)}
          placeholder="Enter your first name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Last Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.lastName}
          onChangeText={(text) => updateFormData('lastName', text)}
          placeholder="Enter your last name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.email}
          onChangeText={(text) => updateFormData('email', text)}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.password}
          onChangeText={(text) => updateFormData('password', text)}
          placeholder="Create a password"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.confirmPassword}
          onChangeText={(text) => updateFormData('confirmPassword', text)}
          placeholder="Confirm your password"
          secureTextEntry
        />
      </View>
    </ScrollView>
  );

  const PhysicalInfoStep = () => (
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
          >
            <Picker.Item label="Beginner" value="beginner" />
            <Picker.Item label="Intermediate" value="intermediate" />
            <Picker.Item label="Advanced" value="advanced" />
          </Picker>
        </View>
      </View>
    </ScrollView>
  );

  const FitnessGoalsStep = () => (
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
              color={formData.fitnessGoals.includes(goal.id) ? '#007AFF' : '#666'} 
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
          >
            <Picker.Item label="Sedentary" value="sedentary" />
            <Picker.Item label="Lightly Active" value="lightly_active" />
            <Picker.Item label="Moderately Active" value="moderately_active" />
            <Picker.Item label="Very Active" value="very_active" />
            <Picker.Item label="Extremely Active" value="extremely_active" />
          </Picker>
        </View>
      </View>
    </ScrollView>
  );

  const HealthInfoStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
      <Text style={styles.stepDescription}>
        This information helps us provide more accurate recommendations. You can update these later.
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Current Weight (kg)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.currentWeight}
          onChangeText={(text) => updateFormData('currentWeight', text)}
          placeholder="Enter your current weight"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Body Fat Percentage</Text>
        <TextInput
          style={styles.textInput}
          value={formData.bodyFatPercentage}
          onChangeText={(text) => updateFormData('bodyFatPercentage', text)}
          placeholder="Enter body fat % (optional)"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Resting Heart Rate (bpm)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.restingHeartRate}
          onChangeText={(text) => updateFormData('restingHeartRate', text)}
          placeholder="Enter resting heart rate"
          keyboardType="numeric"
        />
      </View>
    </ScrollView>
  );

  const CompletionStep = () => (
    <View style={styles.stepContainer}>
      <Icon name="checkmark-circle" size={80} color="#4CAF50" style={styles.completionIcon} />
      <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
      <Text style={styles.stepDescription}>
        You're all set! Your AI fitness coach is ready to help you achieve your goals.
      </Text>
    </View>
  );

  const steps = [
    {
      title: 'Welcome to FitAI',
      subtitle: 'Your personal AI fitness companion',
      component: WelcomeStep,
    },
    {
      title: 'Personal Information',
      subtitle: 'Tell us about yourself',
      component: PersonalInfoStep,
    },
    {
      title: 'Physical Information',
      subtitle: 'Help us understand your body',
      component: PhysicalInfoStep,
    },
    {
      title: 'Fitness Goals',
      subtitle: 'What do you want to achieve?',
      component: FitnessGoalsStep,
    },
    {
      title: 'Health Information',
      subtitle: 'Current health metrics',
      component: HealthInfoStep,
    },
    {
      title: 'All Set!',
      subtitle: 'Ready to start your fitness journey',
      component: CompletionStep,
    },
  ];

  return (
    <LinearGradient
      colors={['#007AFF', '#0056CC']}
      style={styles.container}
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
          {React.createElement(steps[currentStep].component)}
        </View>

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.previousButton}
              onPress={handlePrevious}
            >
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          {currentStep < steps.length - 1 ? (
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Icon name="arrow-forward" size={20} color="#007AFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={handleComplete}
            >
              <Text style={styles.completeButtonText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  welcomeIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  completionIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  goalCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#fff',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  goalTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  previousButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  previousButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 2,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
