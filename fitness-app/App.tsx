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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

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
import GoPremium from './screens/GoPremiumScreen';
import PlanComparisonScreen from './screens/PlanComparisonScreen';
import SubscriptionPlanScreen from './screens/SubscriptionPlanScreen';
import PaymentScreen from './screens/PaymentScreen';
import PaymentProcessingScreen from './screens/PaymentProcessingScreen';
import PaymentSuccessScreen from './screens/PaymentSuccessScreen';

import WorkoutHistoryDetailScreen from './screens/WorkoutHistoryDetailScreen';
import WorkoutCompleteScreen from './screens/WorkoutCompleteScreen';
import WorkoutReviewScreen from './screens/WorkoutReviewScreen';
import LogMealScreen from './screens/LogMealScreen';
import PoseGuideScreen from './screens/PoseGuideScreen';
import VideoPlayerScreen from './screens/VideoPlayerScreen';
import DashboardScreenNew from './screens/DashboardScreenNew';
import PostDetailsScreen from './screens/PostDetailsScreen';
import ProgressScreen from './screens/ProgressScreen';
import MealDetailScreen from './screens/MealDetailScreen';
import AllergyPreferenceScreen from './screens/AllergyPreferenceScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import ChallengeDetailScreen from './screens/ChallengeDetailScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import CreatePostScreen from './screens/CreatePostScreen';
import WaterTrackingScreen from './screens/WaterTrackingScreen';

// Import components
import CustomBottomNavBar from './components/CustomBottomNavBar';

// Import context
import { AuthProvider, useAuth } from './context/AuthContext';

// Import theme
import colors from './theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomBottomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{ title: 'Workouts' }}
      />
      <Tab.Screen
        name="Community"
        component={SocialScreen}
        options={{ title: 'Community' }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{ title: 'Nutrition' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
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
            name="Assistant"
            component={AssistantScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Pose"
            component={PoseScreen}
            options={{
              headerShown: false,
              header: () => null
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
            name="GoPremium"
            component={GoPremium}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="PlanComparisonScreen"
            component={PlanComparisonScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="SubscriptionPlanScreen"
            component={SubscriptionPlanScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="PaymentScreen"
            component={PaymentScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PaymentProcessingScreen"
            component={PaymentProcessingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PaymentSuccessScreen"
            component={PaymentSuccessScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="WorkoutHistoryDetail"
            component={WorkoutHistoryDetailScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="WorkoutComplete"
            component={WorkoutCompleteScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="WorkoutReview"
            component={WorkoutReviewScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="LogMeal"
            component={LogMealScreen}
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
          <Stack.Screen
            name="DashboardNew"
            component={DashboardScreenNew}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="PostDetails"
            component={PostDetailsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Progress"
            component={ProgressScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="MealDetail"
            component={MealDetailScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AllergyPreference"
            component={AllergyPreferenceScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Challenges"
            component={ChallengesScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ChallengeDetail"
            component={ChallengeDetailScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="CreatePost"
            component={CreatePostScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Health"
            component={HealthScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Statistics"
            component={StatisticsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="WaterTracking"
            component={WaterTrackingScreen}
            options={{
              headerShown: false,
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
