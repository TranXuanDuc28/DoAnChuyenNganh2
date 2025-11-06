import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const RegisterScreen = ({ navigation, route }) => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get form data from onboarding or initialize empty
  const onboardingData = route?.params?.formData || {};
  
  const [formData, setFormData] = useState({
    firstName: onboardingData.firstName || '',
    lastName: onboardingData.lastName || '',
    email: onboardingData.email || '',
    password: onboardingData.password || '',
    confirmPassword: onboardingData.confirmPassword || '',
    age: onboardingData.age || '',
    gender: onboardingData.gender || 'male',
    height: onboardingData.height || '',
    weight: onboardingData.weight || '',
    fitnessLevel: onboardingData.fitnessLevel || 'beginner',
    fitnessGoals: onboardingData.fitnessGoals || [],
    activityLevel: onboardingData.activityLevel || 'moderately_active',
    currentWeight: onboardingData.currentWeight || '',
    bodyFatPercentage: onboardingData.bodyFatPercentage || '',
    restingHeartRate: onboardingData.restingHeartRate || '',
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async () => {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare user data for registration
      const userData = {
        email: formData.email,
        password: formData.password,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: parseInt(formData.age) || 0,
          gender: formData.gender,
          height: parseInt(formData.height) || 0,
          weight: parseInt(formData.weight) || 0,
          fitnessLevel: formData.fitnessLevel,
          fitnessGoals: formData.fitnessGoals,
          activityLevel: formData.activityLevel,
        },
        healthMetrics: {
          currentWeight: parseFloat(formData.currentWeight) || null,
          bodyFatPercentage: parseFloat(formData.bodyFatPercentage) || null,
          restingHeartRate: parseInt(formData.restingHeartRate) || null,
        }
      };

      const result = await register(userData);
      if (!result.success) {
        Alert.alert('Registration Failed', result.error);
      }
      // Navigation is handled automatically by AuthContext
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.password && 
           formData.confirmPassword &&
           formData.password === formData.confirmPassword;
  };

  return (
    <ImageBackground
      source={require('../image/banner.jpg')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.65)']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
              <Icon name="person-add" size={70} color={colors.primary} style={styles.logo} />
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join thousands on their fitness journey</Text>
            </View>

          <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={formData.firstName}
                    onChangeText={(text) => updateFormData('firstName', text)}
                    placeholder="First name"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    value={formData.lastName}
                    onChangeText={(text) => updateFormData('lastName', text)}
                    placeholder="Last name"
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email *</Text>
              <View style={styles.inputWrapper}>
                <Icon name="mail" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password *</Text>
              <View style={styles.inputWrapper}>
                <Icon name="lock-closed" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password *</Text>
              <View style={styles.inputWrapper}>
                <Icon name="lock-closed" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <Text style={styles.errorText}>⚠️ Passwords do not match</Text>
            )}

            <TouchableOpacity
              style={[
                styles.registerButton, 
                (!isFormValid() || isLoading) && styles.registerButtonDisabled
              ]}
              onPress={handleRegister}
              disabled={!isFormValid() || isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialButton}>
              <Icon name="logo-google" size={22} color="#DB4437" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Icon name="logo-apple" size={22} color={colors.text} />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inputIcon: {
    marginLeft: 16,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.black,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    padding: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: -15,
    marginBottom: 10,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonDisabled: {
    backgroundColor: colors.borderDark,
  },
  registerButtonText: {
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  termsText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});

export default RegisterScreen;
