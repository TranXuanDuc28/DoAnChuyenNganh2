import { Buffer } from 'buffer';
global.Buffer = Buffer;
import process from 'process';
global.process = process;
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Import screens
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import NutritionScreen from './screens/NutritionScreen';
import HealthScreen from './screens/HealthScreen';
import ProfileScreen from './screens/ProfileScreen';
import AssistantScreen from './screens/AssistantScreen';
import ExerciseSelectionScreen from './screens/ExerciseSelectionScreen';
import CategoryExercisesScreen from './screens/CategoryExercisesScreen';
import ExerciseDetailScreen from './screens/ExerciseDetailScreen';
import WorkoutPlanDetailScreen from './screens/WorkoutPlanDetailScreen';
import WorkoutExerciseDetailScreen from './screens/WorkoutExerciseDetailScreen';
import SocialScreen from './screens/SocialScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import PoseScreen from './screens/PoseScreen';
import PoseHistory from './screens/PoseHistory';
import WorkoutHistoryDetailScreen from './screens/WorkoutHistoryDetailScreen';
import PoseGuideScreen from './screens/PoseGuideScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';

// Import context
import { AuthProvider, useAuth } from './context/AuthContext';

// Import theme
import colors from './theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Workout') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Nutrition') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Health') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Assistant') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'AIWorkout') {
            iconName = focused ? 'body' : 'body-outline';
          }

          return <Icon name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textWhite,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{ title: 'Assistant', headerShown: false }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{ title: 'Workouts', headerShown: false }}
      />
      <Tab.Screen
        name="AIWorkout"
        component={ExerciseSelectionScreen}
        options={{ title: 'AI Workout', headerShown: false }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{ title: 'Nutrition', headerShown: false }}
      />
      <Tab.Screen
        name="Health"
        component={HealthScreen}
        options={{ title: 'Health', headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Register"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textWhite,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen
            name="Pose"
            component={PoseScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: colors.textWhite,
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen
            name="PoseHistory"
            component={PoseHistory}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: colors.textWhite,
              headerTitleStyle: { fontWeight: 'bold' },
              title: 'Pose History',
            }}
          />
          <Stack.Screen
            name="CategoryExercises"
            component={CategoryExercisesScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ExerciseDetail"
            component={ExerciseDetailScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="WorkoutPlanDetail"
            component={WorkoutPlanDetailScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="WorkoutExerciseDetail"
            component={WorkoutExerciseDetailScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="WorkoutHistoryDetail"
            component={WorkoutHistoryDetailScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="PoseGuide"
            component={PoseGuideScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="VideoPlayer"
            component={VideoPlayerScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'fade_from_bottom',
            }}
          />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

const App = () => {
  // Listen for notifications
  useEffect(() => {
    // Notification received listener
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Notification response listener (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;

      // Handle navigation based on notification type
      if (data.screen === 'Workout') {
        // Navigate to Workout screen
        // Note: Navigation will be handled by the navigation container
        console.log('Navigate to Workout screen');
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
