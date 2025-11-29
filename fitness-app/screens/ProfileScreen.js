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
import { Ionicons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import colors from '../theme/colors';
import { styles } from './styles/ProfileScreen.styles';

const ProfileScreen = () => {
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
        fitnessLevel: formData.fitnessLevel,
        fitnessGoals: formData.fitnessGoals,
        activityLevel: formData.activityLevel,
        workout_duration: parseInt(formData.workout_duration),
        dailyMeals: parseInt(formData.dailyMeals),
        budgetLevel: formData.budgetLevel,
        foodPreferences: formData.foodPreferences.split(',').map(item => item.trim()).filter(item => item),
        foodAllergies: formData.foodAllergies.split(',').map(item => item.trim()).filter(item => item)
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

      // Create form data
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
        // Update user with new image
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

  // Email Change Handler
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

  // Password Change Handler
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



  const renderChipSelector = (options, selectedValues, onToggle) => (
    <View style={styles.chipContainer}>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.chip,
            selectedValues.includes(option.value) && styles.chipSelected
          ]}
          onPress={() => onToggle(option.value)}
          disabled={!isEditing}
        >
          <Text style={[
            styles.chipText,
            selectedValues.includes(option.value) && styles.chipTextSelected
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <Icon name="person-circle" size={80} color={colors.textSecondary} />
            )}
            <TouchableOpacity
              style={styles.editImageButton}
              onPress={handlePickImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Icon name="camera" size={16} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.nameInput}
                value={formData.firstName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                placeholder="First Name"
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={styles.nameInput}
                value={formData.lastName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                placeholder="Last Name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          ) : (
            <>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </>
          )}

          {/* Edit/Save/Cancel Buttons */}
          <View style={styles.headerActions}>
            {!isEditing ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Icon name="create-outline" size={20} color={colors.white} />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={formData.age}
                onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
                keyboardType="number-pad"
                placeholder="Age"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.age}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            {isEditing ? (
              <View style={styles.genderSelector}>
                {['male', 'female', 'other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderOption,
                      formData.gender === g && styles.genderOptionSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, gender: g }))}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      formData.gender === g && styles.genderOptionTextSelected
                    ]}>
                      {g === 'male' ? 'Male' : g === 'female' ? 'Female' : 'Other'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.infoValue}>
                {user?.gender === 'male' ? 'Male' : user?.gender === 'female' ? 'Female' : 'Other'}
              </Text>
            )}
          </View>

          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Bio</Text>
            {isEditing ? (
              <TextInput
                style={styles.bioInput}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Write something about yourself..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={500}
              />
            ) : (
              <Text style={styles.bioText}>{user?.bio || 'No bio yet'}</Text>
            )}
          </View>

          {/* Email Change Button */}
          {!isEditing && (
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => setShowEmailModal(true)}
            >
              <Icon name="mail-outline" size={20} color={colors.primary} />
              <Text style={styles.changeButtonText}>Change Email</Text>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}

          {/* Password Change Button */}
          {!isEditing && (
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => setShowPasswordModal(true)}
            >
              <Icon name="lock-closed-outline" size={20} color={colors.primary} />
              <Text style={styles.changeButtonText}>Change Password</Text>
              <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Fitness Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Preferences</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Level</Text>
            {isEditing ? (
              <View style={styles.levelSelector}>
                {[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' }
                ].map(level => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.levelOption,
                      formData.fitnessLevel === level.value && styles.levelOptionSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, fitnessLevel: level.value }))}
                  >
                    <Text style={[
                      styles.levelOptionText,
                      formData.fitnessLevel === level.value && styles.levelOptionTextSelected
                    ]}>
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.infoValue}>
                {user?.fitnessLevel === 'beginner' ? 'Beginner' :
                  user?.fitnessLevel === 'intermediate' ? 'Intermediate' : 'Advanced'}
              </Text>
            )}
          </View>

          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Goals</Text>
            {renderChipSelector(fitnessGoalOptions, formData.fitnessGoals, toggleGoal)}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Workout Duration (min)</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={formData.workout_duration}
                onChangeText={(text) => setFormData(prev => ({ ...prev, workout_duration: text }))}
                keyboardType="number-pad"
                placeholder="60"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.workout_duration} min</Text>
            )}
          </View>
        </View>

        {/* Nutrition Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Preferences</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Meals per Day</Text>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={formData.dailyMeals}
                onChangeText={(text) => setFormData(prev => ({ ...prev, dailyMeals: text }))}
                keyboardType="number-pad"
                placeholder="3"
                placeholderTextColor={colors.textSecondary}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.dailyMeals} meals</Text>
            )}
          </View>

          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Food Preferences (comma separated)</Text>
            {isEditing ? (
              <TextInput
                style={styles.bioInput}
                value={formData.foodPreferences}
                onChangeText={(text) => setFormData(prev => ({ ...prev, foodPreferences: text }))}
                placeholder="e.g. Healthy, Low Carb, Vegetarian"
                placeholderTextColor={colors.textSecondary}
                multiline
              />
            ) : (
              <Text style={styles.bioText}>
                {formData.foodPreferences || 'None'}
              </Text>
            )}
          </View>

          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Allergies (comma separated)</Text>
            {isEditing ? (
              <TextInput
                style={styles.bioInput}
                value={formData.foodAllergies}
                onChangeText={(text) => setFormData(prev => ({ ...prev, foodAllergies: text }))}
                placeholder="e.g. Peanuts, Shellfish, Dairy"
                placeholderTextColor={colors.textSecondary}
                multiline
              />
            ) : (
              <Text style={styles.bioText}>
                {formData.foodAllergies || 'None'}
              </Text>
            )}
          </View>
        </View>

        {/* Logout Button */}
        {!isEditing && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out-outline" size={24} color={colors.danger} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>FitAI v1.0.0</Text>
        </View>

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;
