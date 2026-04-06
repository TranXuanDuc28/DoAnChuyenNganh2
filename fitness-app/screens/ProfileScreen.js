import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import colors from '../theme/colors';
import { styles } from './styles/ProfileScreen.styles';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Email change form
  const [newEmail, setNewEmail] = useState('');

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    bio: '',
    weight: '',
    height: '',
    fitnessLevel: '',
    fitnessGoals: [],
    activityLevel: '',
    workout_duration: '',
    dailyMeals: '',
    budgetLevel: '',
    foodPreferences: [],
    foodAllergies: []
  });

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        age: user.age?.toString() || '',
        gender: user.gender || 'male',
        bio: user.bio || '',
        weight: user.weight?.toString() || '',
        height: user.height?.toString() || '',
        fitnessLevel: user.fitnessLevel || 'beginner',
        fitnessGoals: user.fitnessGoals || [],
        activityLevel: user.activityLevel || 'moderately_active',
        workout_duration: user.workout_duration?.toString() || '60',
        dailyMeals: user.dailyMeals?.toString() || '3',
        budgetLevel: user.budgetLevel || 'medium',
        foodPreferences: Array.isArray(user.foodPreferences) ? user.foodPreferences.join(', ') : (user.foodPreferences || ''),
        foodAllergies: Array.isArray(user.foodAllergies) ? user.foodAllergies.join(', ') : (user.foodAllergies || '')
      });
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.firstName || !formData.lastName) {
        Alert.alert('Error', 'Please enter first and last name');
        return;
      }

      const age = parseInt(formData.age);
      if (isNaN(age) || age < 13 || age > 120) {
        Alert.alert('Error', 'Age must be between 13 and 120');
        return;
      }

      const workoutDuration = parseInt(formData.workout_duration);
      if (isNaN(workoutDuration) || workoutDuration < 15 || workoutDuration > 180) {
        Alert.alert('Error', 'Workout duration must be between 15 and 180 minutes');
        return;
      }

      if (formData.bio && formData.bio.length > 500) {
        Alert.alert('Error', 'Bio cannot exceed 500 characters');
        return;
      }

      setSaving(true);

      // Prepare update data
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        gender: formData.gender,
        bio: formData.bio,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        fitnessLevel: formData.fitnessLevel,
        fitnessGoals: formData.fitnessGoals,
        activityLevel: formData.activityLevel,
        workout_duration: parseInt(formData.workout_duration),
        dailyMeals: parseInt(formData.dailyMeals),
        budgetLevel: formData.budgetLevel,
        foodPreferences: typeof formData.foodPreferences === 'string' ? formData.foodPreferences.split(',').map(item => item.trim()).filter(item => item) : [],
        foodAllergies: typeof formData.foodAllergies === 'string' ? formData.foodAllergies.split(',').map(item => item.trim()).filter(item => item) : []
      };

      const response = await authAPI.updateProfile(updateData);

      if (response.data.user) {
        updateUser(response.data.user);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        age: user.age?.toString() || '',
        gender: user.gender || 'male',
        bio: user.bio || '',
        weight: user.weight?.toString() || '',
        height: user.height?.toString() || '',
        fitnessLevel: user.fitnessLevel || 'beginner',
        fitnessGoals: user.fitnessGoals || [],
        activityLevel: user.activityLevel || 'moderately_active',
        workout_duration: user.workout_duration?.toString() || '60',
        dailyMeals: user.dailyMeals?.toString() || '3',
        budgetLevel: user.budgetLevel || 'medium',
        foodPreferences: Array.isArray(user.foodPreferences) ? user.foodPreferences.join(', ') : (user.foodPreferences || ''),
        foodAllergies: Array.isArray(user.foodAllergies) ? user.foodAllergies.join(', ') : (user.foodAllergies || '')
      });
    }
    setIsEditing(false);
  };

  const toggleGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter(g => g !== goal)
        : [...prev.fitnessGoals, goal]
    }));
  };

  // Image Upload Handler
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Camera roll permission required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleUploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUploadImage = async (imageUri) => {
    try {
      setUploadingImage(true);

      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type
      });

      const response = await authAPI.uploadProfileImage(formData);

      if (response.data.imageUrl) {
        const updatedUser = { ...user, profileImage: response.data.imageUrl };
        updateUser(updatedUser);
        Alert.alert('Success', 'Profile image updated successfully');
      }
    } catch (error) {
      console.error('Upload image error:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangeEmail = async () => {
    try {
      if (!newEmail) {
        Alert.alert('Error', 'Please enter new email');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        Alert.alert('Error', 'Invalid email format');
        return;
      }

      setSaving(true);
      const response = await authAPI.updateProfile({ email: newEmail });

      if (response.data.user) {
        updateUser(response.data.user);
        setShowEmailModal(false);
        setNewEmail('');
        Alert.alert('Success', 'Email updated successfully');
      }
    } catch (error) {
      console.error('Change email error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update email');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordForm;

      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert('Error', 'New password must be at least 6 characters');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        return;
      }

      setSaving(true);
      await authAPI.changePassword(currentPassword, newPassword);

      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const fitnessGoalOptions = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'general_fitness', label: 'General Fitness' }
  ];


  const renderEditMode = () => {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        {/* Custom Edit Header */}
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={handleCancel} disabled={saving}>
            <Text style={styles.editHeaderCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.editHeaderTitle}>Fitness</Text>
          <TouchableOpacity style={styles.editHeaderSaveBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.editHeaderSaveText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Avatar Section */}
          <View style={styles.editProfileInfo}>
            <TouchableOpacity style={styles.editAvatarContainer} onPress={handlePickImage} disabled={uploadingImage}>
              {uploadingImage ? (
                <View style={[styles.editAvatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f3f5' }]}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.editAvatar} />
              ) : (
                <Icon name="person-circle" size={100} color="#cbd5e1" />
              )}
              <View style={styles.editCameraBadge}>
                <Icon name="camera-outline" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.editName}>Edit Profile</Text>
            <Text style={styles.editMemberSince}>Kinetic Member Since 2023</Text>
          </View>

          <View style={styles.editFormContainer}>
            {/* First & Last Name */}
            <View style={styles.editInputGroup}>
              <Text style={styles.editLabel}>First Name</Text>
              <TextInput
                style={styles.editInput}
                value={formData.firstName}
                onChangeText={(t) => setFormData(p => ({ ...p, firstName: t }))}
              />
            </View>
            <View style={styles.editInputGroup}>
              <Text style={styles.editLabel}>Last Name</Text>
              <TextInput
                style={styles.editInput}
                value={formData.lastName}
                onChangeText={(t) => setFormData(p => ({ ...p, lastName: t }))}
              />
            </View>

            {/* Personal Information */}
            <View style={styles.editSectionContainer}>
              <View style={styles.editSectionHeader}>
                <View style={styles.editSectionLine} />
                <Text style={styles.editSectionTitle}>Personal Information</Text>
              </View>
              <View style={styles.editCardGray}>
                <View style={styles.editRow}>
                  <Text style={styles.editGrayLabel}>Age</Text>
                  <TextInput style={styles.editValueText} value={formData.age} onChangeText={(t) => setFormData(p => ({ ...p, age: t }))} keyboardType="number-pad" placeholder="22" />
                </View>
                <View style={styles.editRow}>
                  <Text style={styles.editGrayLabel}>Gender</Text>
                  <View style={styles.editToggleGroup}>
                    {['male', 'female', 'other'].map(g => (
                      <TouchableOpacity key={g} style={[styles.editTogglePill, formData.gender === g && styles.editTogglePillActive]} onPress={() => setFormData(p => ({ ...p, gender: g }))}>
                        <Text style={[styles.editToggleText, formData.gender === g && styles.editToggleTextActive]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.editCircleSquaresRow}>
                  <View style={styles.editCircleBox}>
                    <Text style={styles.editCircleLabel}>Height</Text>
                    <View style={styles.editCircleValue}>
                      <TextInput style={styles.editCircleNumber} value={formData.height} onChangeText={(t) => setFormData(p => ({ ...p, height: t }))} keyboardType="number-pad" placeholder="0" textAlign="center" />
                      <Text style={styles.editCircleUnit}>cm</Text>
                    </View>
                  </View>
                  <View style={styles.editCircleBox}>
                    <Text style={styles.editCircleLabel}>Weight</Text>
                    <View style={styles.editCircleValue}>
                      <TextInput style={styles.editCircleNumber} value={formData.weight} onChangeText={(t) => setFormData(p => ({ ...p, weight: t }))} keyboardType="decimal-pad" placeholder="0" textAlign="center" />
                      <Text style={styles.editCircleUnit}>kg</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Fitness Preferences */}
            <View style={styles.editSectionContainer}>
              <View style={styles.editSectionHeader}>
                <View style={styles.editSectionLine} />
                <Text style={styles.editSectionTitle}>Fitness Preferences</Text>
              </View>

              <View style={styles.editActivityCardsRow}>
                <TouchableOpacity style={styles.editActivityCardOrange} onPress={() => {
                  const levels = ['beginner', 'intermediate', 'advanced'];
                  const next = levels[(levels.indexOf(formData.fitnessLevel) + 1) % 3];
                  setFormData(p => ({ ...p, fitnessLevel: next }));
                }}>
                  <Icon name="barbell" size={24} color="#ffffff" style={styles.editActivityIcon} />
                  <Text style={styles.editActivityLabelWhite}>Level</Text>
                  <Text style={styles.editActivityValueWhite}>{formData.fitnessLevel ? formData.fitnessLevel.charAt(0).toUpperCase() + formData.fitnessLevel.slice(1) : ''}</Text>
                </TouchableOpacity>

                <View style={styles.editActivityCard}>
                  <Icon name="time-outline" size={24} color="#1c1917" style={styles.editActivityIcon} />
                  <Text style={styles.editActivityLabel}>Duration (min)</Text>
                  <TextInput style={styles.editActivityValue} value={formData.workout_duration} onChangeText={(t) => setFormData(p => ({ ...p, workout_duration: t }))} keyboardType="number-pad" />
                </View>
              </View>

              <TouchableOpacity style={styles.editActivityCard} onPress={() => {
                const levels = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'super_active'];
                let currentIndex = levels.indexOf(formData.activityLevel);
                if (currentIndex === -1) currentIndex = 0;
                const next = levels[(currentIndex + 1) % 5];
                setFormData(p => ({ ...p, activityLevel: next }));
              }}>
                <Icon name="flash" size={24} color="#1c1917" style={styles.editActivityIcon} />
                <Text style={styles.editActivityLabel}>Intensity / Activity</Text>
                <Text style={styles.editActivityValue}>{formData.activityLevel?.replace('_', ' ')?.toUpperCase() || 'MODERATELY ACTIVE'}</Text>
              </TouchableOpacity>
            </View>

            {/* Dietary Tags */}
            <View style={styles.editSectionContainer}>
              <View style={styles.editSectionHeader}>
                <View style={styles.editSectionLine} />
                <Text style={styles.editSectionTitle}>Dietary Tags</Text>
              </View>

              <View style={styles.editSmallInputGroup}>
                <Text style={styles.editGrayLabel}>Meals per Day</Text>
                <TextInput style={styles.editMealsInput} value={formData.dailyMeals} onChangeText={(t) => setFormData(p => ({ ...p, dailyMeals: t }))} keyboardType="number-pad" />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editGrayLabel}>Food Preferences (comma separated)</Text>
                <TextInput style={[styles.editInput, { marginTop: 8 }]} multiline value={formData.foodPreferences} onChangeText={(t) => setFormData(p => ({ ...p, foodPreferences: t }))} placeholder="e.g. Vegetarian" />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editGrayLabel}>Allergies (comma separated)</Text>
                <TextInput style={[styles.editInput, { marginTop: 8 }]} multiline value={formData.foodAllergies} onChangeText={(t) => setFormData(p => ({ ...p, foodAllergies: t }))} placeholder="e.g. Dairy, Gluten" />
              </View>

              <View style={{ marginTop: 16 }}>
                <Text style={styles.editSectionHeader}>
                  <View style={styles.editSectionLine} />
                  <Text style={styles.editSectionTitle}>  Nutrition Preferences</Text>
                </Text>
                <View style={styles.editTagPillsContainer}>
                  {['High Protein', 'Vegan', 'Keto', 'Gluten Free', 'Intermittent Fasting'].map(tag => {
                    const isActive = typeof formData.foodPreferences === 'string' && formData.foodPreferences.includes(tag);
                    return (
                      <TouchableOpacity key={tag} style={[styles.editNutritionPill, isActive && styles.editNutritionPillActive]} onPress={() => {
                        let currentPrefs = typeof formData.foodPreferences === 'string' ? formData.foodPreferences.split(',').map(s => s.trim()).filter(s => s) : [];
                        if (isActive) {
                          currentPrefs = currentPrefs.filter(s => s !== tag);
                        } else {
                          currentPrefs.push(tag);
                        }
                        setFormData(p => ({ ...p, foodPreferences: currentPrefs.join(', ') }));
                      }}>
                        <Text style={[styles.editNutritionPillText, isActive && styles.editNutritionPillTextActive]}>{tag}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Deactivate Account */}
            <TouchableOpacity style={styles.editDeactivateBtn} onPress={() => {
              Alert.alert('Deactivate Account', 'Are you sure you want to deactivate your account? This action cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Deactivate', style: 'destructive', onPress: () => {
                    // Normally you would call a deactivate API here
                    // For now just logout as a proxy
                    logout();
                  }
                }
              ])
            }}>
              <Text style={styles.editDeactivateText}>Deactivate Account</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View>
    );
  };

  const renderViewMode = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLogoContent}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.headerAvatar} />
          ) : (
            <Icon name="person-circle" size={36} color="#9ca3af" />
          )}
          <Text style={styles.logoText}>AI COACH</Text>
        </View>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Icon name="settings-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Profile Details Sections */}
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatarContainer}>
          <View style={styles.gradientBorder}>
            <View style={styles.profileAvatarInner}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.profileAvatar} />
              ) : (
                <Icon name="person" size={100} color="#cbd5e1" style={{ marginTop: 10, alignSelf: 'center' }} />
              )}
            </View>
          </View>
        </View>

        <Text style={styles.profileName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>

        <TouchableOpacity style={styles.editProfileBtnFull} onPress={() => setIsEditing(true)}>
          <Icon name="create-outline" size={20} color="#fff" />
          <Text style={styles.editProfileTextFull}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Bento Grid */}
      <View style={styles.bentoContainer}>
        {/* Personal Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="scan-outline" size={16} color="#ff794a" />
            <Text style={styles.cardHeaderTitle}>Personal Info</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{user?.age}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{user?.gender === 'male' ? 'Male' : user?.gender === 'female' ? 'Female' : 'Other'}</Text>
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowEmailModal(true)}>
            <View style={styles.actionBtnContent}>
              <Icon name="mail-outline" size={18} color="#ff794a" />
              <Text style={styles.actionBtnText}>Change Email</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowPasswordModal(true)}>
            <View style={styles.actionBtnContent}>
              <Icon name="lock-closed-outline" size={18} color="#ff794a" />
              <Text style={styles.actionBtnText}>Change Password</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Fitness Level Card */}
        <View style={styles.cardOrange}>
          <View style={styles.cardHeader}>
            <Icon name="flash" size={16} color="#ffffff" />
            <Text style={styles.cardHeaderTitleWhite}>Fitness Level</Text>
          </View>
          <View>
            <Text style={styles.fitnessLevelText}>
              {user?.fitnessLevel === 'beginner' ? 'BEGINNER' :
                user?.fitnessLevel === 'intermediate' ? 'INTERMEDIATE' : 'ADVANCED'}
            </Text>
            <Text style={styles.fitnessLevelSub}>Top 5% of community users</Text>
          </View>
        </View>

        {/* Goals Card */}
        <View style={styles.card}>
          <View style={styles.goalsHeaderContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="disc-outline" size={16} color="#ff794a" />
              <Text style={styles.cardHeaderTitle}>Fitness Goals</Text>
            </View>
            <View style={styles.goalsHeaderRight}>
              <Text style={styles.goalsHeaderRightText}>{(user?.fitnessGoals || []).length} ACTIVE</Text>
            </View>
          </View>

          <View style={styles.chipContainer}>
            {fitnessGoalOptions.filter(o => (user?.fitnessGoals || []).includes(o.value)).map(option => (
              <View key={option.value} style={styles.chip}>
                <Text style={styles.chipText}>{option.label}</Text>
              </View>
            ))}
            {(!user?.fitnessGoals || user.fitnessGoals.length === 0) && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>No active goals</Text>
              </View>
            )}
          </View>
        </View>

        {/* Nutrition Card */}
        <View style={styles.cardDark}>
          <View style={styles.nutritionDecor} />
          <View style={styles.cardHeader}>
            <Icon name="restaurant-outline" size={16} color="#ff794a" />
            <Text style={styles.cardHeaderTitleDark}>Nutrition Preferences</Text>
          </View>

          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionCol}>
              <Text style={styles.nutritionLabelDark}>Dietary Focus</Text>
              <View style={styles.focusItem}>
                <View style={styles.focusIconBox}>
                  <Icon name="leaf-outline" size={20} color="#ffffff" />
                </View>
                <View>
                  <Text style={styles.focusTitle}>{user?.foodPreferences || 'Plant-Forward'}</Text>
                  <Text style={styles.focusSub}>High Protein Focus</Text>
                </View>
              </View>
            </View>
            <View style={styles.nutritionCol}>
              <Text style={styles.nutritionLabelDark}>Restrictions</Text>
              <View style={styles.restrictionsRow}>
                {typeof user?.foodAllergies === 'string' && user.foodAllergies.trim() !== '' ? user.foodAllergies.split(',').map((allergy, i) => (
                  <View key={i} style={styles.restrictionChip}>
                    <Text style={styles.restrictionText}>{allergy.trim() || 'None'}</Text>
                  </View>
                )) : Array.isArray(user?.foodAllergies) && user.foodAllergies.length > 0 ? user.foodAllergies.map((allergy, i) => (
                  <View key={i} style={styles.restrictionChip}>
                    <Text style={styles.restrictionText}>{allergy || 'None'}</Text>
                  </View>
                )) : (
                  <>
                    <View style={styles.restrictionChip}><Text style={styles.restrictionText}>Gluten-Free</Text></View>
                    <View style={styles.restrictionChip}><Text style={styles.restrictionText}>No Dairy</Text></View>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Premium Banner */}
        <TouchableOpacity 
          style={styles.premiumBanner}
          onPress={() => navigation.navigate('GoPremium')}
        >
          <Icon name="star" size={100} color="#ffffff" style={styles.premiumDecor} />
          <View style={styles.premiumBannerTextContainer}>
            <View style={styles.premiumTitleRow}>
              <Icon name="star" size={14} color="#ffffff" />
              <Text style={styles.premiumTitle}>Go Premium</Text>
            </View>
            <Text style={styles.premiumSub}>Unlock advanced analytics,{'\n'}custom meal plans & exclusive workout series.</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#ffffff" />
        </TouchableOpacity>

      </View>

      <View style={styles.logoutBtnContainer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {isEditing ? renderEditMode() : renderViewMode()}

      {/* Email Change Modal */}
      <Modal
        visible={showEmailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Email</Text>

            <Text style={styles.modalLabel}>Current Email</Text>
            <Text style={styles.currentValue}>{user?.email}</Text>

            <Text style={styles.modalLabel}>New Email</Text>
            <TextInput
              style={styles.modalInput}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter new email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowEmailModal(false);
                  setNewEmail('');
                }}
                disabled={saving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleChangeEmail}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <Text style={styles.modalLabel}>Current Password</Text>
            <TextInput
              style={styles.modalInput}
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, currentPassword: text }))}
              placeholder="Enter current password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />

            <Text style={styles.modalLabel}>New Password</Text>
            <TextInput
              style={styles.modalInput}
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, newPassword: text }))}
              placeholder="Enter new password (min 6 chars)"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />

            <Text style={styles.modalLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.modalInput}
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm(prev => ({ ...prev, confirmPassword: text }))}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                disabled={saving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleChangePassword}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;