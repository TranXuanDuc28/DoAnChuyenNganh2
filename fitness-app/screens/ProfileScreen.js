import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
import { styles } from './styles/ProfileScreen.styles';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

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

  const getBMI = () => {
    if (!user?.profile?.height || !user?.healthMetrics?.currentWeight) return null;
    const heightInMeters = user.profile.height / 100;
    const weight = user.healthMetrics.currentWeight || user.profile.weight;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const profileStats = [
    {
      title: 'Workouts',
      value: '47',
      icon: 'fitness',
      color: colors.primary,
    },
    {
      title: 'Streak',
      value: '12 days',
      icon: 'flame',
      color: colors.warning,
    },
    {
      title: 'Calories Burned',
      value: '15,420',
      icon: 'flash',
      color: colors.danger,
    },
    {
      title: 'Distance',
      value: '125.6 km',
      icon: 'walk',
      color: colors.info,
    },
  ];

  const menuItems = [
    {
      id: 1,
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () => Alert.alert('Coming Soon', 'Edit profile feature will be available soon'),
    },
    {
      id: 2,
      title: 'Health Goals',
      icon: 'flag-outline',
      onPress: () => Alert.alert('Coming Soon', 'Health goals feature will be available soon'),
    },
    {
      id: 3,
      title: 'Workout History',
      icon: 'time-outline',
      onPress: () => Alert.alert('Coming Soon', 'Workout history feature will be available soon'),
    },
    {
      id: 4,
      title: 'Achievements',
      icon: 'trophy-outline',
      onPress: () => Alert.alert('Coming Soon', 'Achievements feature will be available soon'),
    },
    {
      id: 5,
      title: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => Alert.alert('Coming Soon', 'Notifications settings will be available soon'),
    },
    {
      id: 6,
      title: 'Privacy & Security',
      icon: 'shield-outline',
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
    },
    {
      id: 7,
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Coming Soon', 'Help & support will be available soon'),
    },
    {
      id: 8,
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('About', 'FitAI v1.0.0\nYour personal AI fitness companion'),
    },
  ];

  const renderStatCard = (stat) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
        <Icon name={stat.icon} size={24} color="#fff" />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statTitle}>{stat.title}</Text>
    </View>
  );

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <Icon name={item.icon} size={24} color={colors.textSecondary} />
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  const bmi = getBMI();

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Icon name="person-circle" size={80} color={colors.textSecondary} />
          <TouchableOpacity style={styles.editImageButton}>
            <Icon name="camera" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>
          {user?.profile?.firstName} {user?.profile?.lastName}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        {bmi && (
          <View style={styles.bmiContainer}>
            <Text style={styles.bmiLabel}>BMI</Text>
            <Text style={styles.bmiValue}>{bmi}</Text>
          </View>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          {profileStats.map((stat, index) => (
            <View key={index} style={styles.statCardContainer}>
              {renderStatCard(stat)}
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="settings" size={24} color={colors.primary} />
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="share" size={24} color={colors.success} />
          <Text style={styles.quickActionText}>Share App</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="star" size={24} color={colors.warning} />
          <Text style={styles.quickActionText}>Rate App</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map(renderMenuItem)}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={24} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>FitAI v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
