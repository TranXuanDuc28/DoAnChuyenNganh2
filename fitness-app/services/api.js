import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Determine a sensible default base URL for development environments.
// - iOS simulator and web: localhost works
// - Android emulator (AVD): use 10.0.2.2 to reach host machine
// - Physical device: replace REACT_NATIVE_API_HOST with your machine IP (e.g. 192.168.x.x)
const DEV_API_HOST = typeof process !== 'undefined' && process.env && process.env.REACT_NATIVE_API_HOST
  ? process.env.REACT_NATIVE_API_HOST
  : (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

// NGROK URL for mobile testing - update this when ngrok restarts
const NGROK_URL = 'https://unpriggish-conductorial-lilah.ngrok-free.dev';

const BASE_URL = __DEV__
  ? `${NGROK_URL}/api`  // Using ngrok for mobile device testing
  : 'https://your-production-api.com/api';

// Export BASE_URL for use in other files
export const API_BASE_URL = BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Increased timeout for pose evaluation (images can take longer)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helpful debug log so you can see which host is being used in Metro/device logs
console.debug('[api] BASE_URL ->', BASE_URL);

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: (token) => api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  completeOnboarding: (onboardingData, token) => api.put('/auth/onboarding', onboardingData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (imageData) => api.post('/users/avatar', imageData),
  getFriends: () => api.get('/users/friends'),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
  sendFriendRequest: (userId) => api.post(`/users/friends/request`, { userId }),
  acceptFriendRequest: (requestId) => api.post(`/users/friends/accept`, { requestId }),
  declineFriendRequest: (requestId) => api.post(`/users/friends/decline`, { requestId }),
};

// Workout API
export const workoutAPI = {
  getWorkouts: (params) => api.get('/workouts', { params }),
  getWorkout: (id) => api.get(`/workouts/${id}`),
  createWorkout: (workoutData) => api.post('/workouts', workoutData),
  updateWorkout: (id, workoutData) => api.put(`/workouts/${id}`, workoutData),
  deleteWorkout: (id) => api.delete(`/workouts/${id}`),
  startWorkoutSession: (workoutId) => api.post(`/workouts/${workoutId}/start`),
  updateWorkoutSession: (sessionId, data) => api.put(`/workouts/sessions/${sessionId}`, data),
  completeWorkoutSession: (sessionId, data) => api.post(`/workouts/sessions/${sessionId}/complete`, data),
  getWorkoutHistory: (params) => api.get('/workout-plans/history', { params }),
  getExercises: (params) => api.get('/workouts/exercises', { params }),
  createExercise: (exerciseData) => api.post('/workouts/exercises', exerciseData),
  getWorkoutPlans: () => api.get('/workouts/plans'),
  createWorkoutPlan: (planData) => api.post('/workouts/plans', planData),
  getAIWorkoutPlan: (preferences) => api.post('/ai/workout-plan', preferences),
  getExerciseCategories: () => api.get('/workouts/exercise-categories'),
  // AI Workout Plan APIs
  generateAIWorkoutPlan: (preferences) => api.post('/workout-plans/generate', preferences),
  getActiveWorkoutPlan: () => api.get('/workout-plans/active'),
  getAllWorkoutPlans: () => api.get('/workout-plans'),
  getWorkoutPlanDay: (dayId) => api.get(`/workout-plans/day/${dayId}`),
  completeWorkoutDay: (dayId) => api.post(`/workout-plans/day/${dayId}/complete`),
  completeExercise: (exerciseId) => api.post(`/workout-plans/exercise/${exerciseId}/complete`),
  deactivateWorkoutPlan: (planId) => api.put(`/workout-plans/${planId}/deactivate`),
};

// Nutrition API
export const nutritionAPI = {
  getFoodDatabase: (params) => api.get('/nutrition/foods', { params }),
  searchFoods: (query) => api.get(`/nutrition/foods/search?q=${query}`),
  getFood: (id) => api.get(`/nutrition/foods/${id}`),
  createFood: (foodData) => api.post('/nutrition/foods', foodData),
  getNutritionEntries: (params) => api.get('/nutrition/entries', { params }),
  addNutritionEntry: (entryData) => api.post('/nutrition/entries', entryData),
  updateNutritionEntry: (id, entryData) => api.put(`/nutrition/entries/${id}`, entryData),
  deleteNutritionEntry: (id) => api.delete(`/nutrition/entries/${id}`),
  getNutritionGoals: () => api.get('/nutrition/goals'),
  updateNutritionGoals: (goals) => api.put('/nutrition/goals', goals),
  getMealPlans: () => api.get('/nutrition/meal-plans'),
  createMealPlan: (planData) => api.post('/nutrition/meal-plans', planData),
  getWaterIntake: (date) => api.get(`/nutrition/water?date=${date}`),
  addWaterIntake: (amount) => api.post('/nutrition/water', { amount }),
  getAIMealPlan: (preferences) => api.post('/ai/meal-plan', preferences),
};

// Health API
export const healthAPI = {
  getHealthMetrics: (params) => api.get('/health/metrics', { params }),
  addSleepRecord: (data) => api.post('/health/sleep', data),
  getSleepRecords: (params) => api.get('/health/sleep', { params }),
  addHeartRateRecord: (data) => api.post('/health/heart-rate', data),
  getHeartRateRecords: (params) => api.get('/health/heart-rate', { params }),
  addStressRecord: (data) => api.post('/health/stress', data),
  getStressRecords: (params) => api.get('/health/stress', { params }),
  addWeightRecord: (data) => api.post('/health/weight', data),
  getWeightRecords: (params) => api.get('/health/weight', { params }),
  getActivityRecords: (params) => api.get('/health/activity', { params }),
  syncWearableData: (deviceType, data) => api.post(`/health/sync/${deviceType}`, data),
  getHealthGoals: () => api.get('/health/goals'),
  createHealthGoal: (goalData) => api.post('/health/goals', goalData),
  updateHealthGoal: (id, goalData) => api.put(`/health/goals/${id}`, goalData),
  getBreathingExercises: (params) => api.get('/health/breathing', { params }),
  addBreathingExercise: (data) => api.post('/health/breathing', data),
  getMenstrualCycle: (params) => api.get('/health/menstrual', { params }),
  addMenstrualCycle: (data) => api.post('/health/menstrual', data),
};

// Social API
export const socialAPI = {
  getFeed: (params) => api.get('/social/feed', { params }),
  createPost: (postData) => api.post('/social/posts', postData),
  likePost: (postId) => api.post(`/social/posts/${postId}/like`),
  commentOnPost: (postId, comment) => api.post(`/social/posts/${postId}/comments`, { comment }),
  getChallenges: (params) => api.get('/social/challenges', { params }),
  joinChallenge: (challengeId) => api.post(`/social/challenges/${challengeId}/join`),
  getLeaderboard: (type, params) => api.get(`/social/leaderboard/${type}`, { params }),
  shareAchievement: (achievementData) => api.post('/social/achievements', achievementData),
};

// AI API
export const aiAPI = {
  getDailySummary: () => api.get('/ai/daily-summary'),
  generateWorkoutPlan: (preferences) => api.post('/ai/generate-workout-plan', preferences),
  generateMealPlan: (preferences) => api.post('/ai/generate-meal-plan', preferences),
  getMealPlans: () => api.get('/ai/meal-plans'),
  getMealPlan: (id) => api.get(`/ai/meal-plans/${id}`),
  deleteMealPlan: (id) => api.delete(`/ai/meal-plans/${id}`),
  chat: (message) => api.post('/ai/chat', { message }),
};

// Pose API
export const poseAPI = {
  evaluate: ({ user_id, exerciseName, imageBase64, keypoints }) =>
    api.post('/pose/evaluate', { user_id, exerciseName, imageBase64, keypoints }),
  evaluatePose: ({ imageBase64 }) => api.post('/pose/evaluate-pose', { imageBase64 }),
  history: ({ exerciseName, user_id, limit, type = 'all' }) => api.get('/pose/history', { params: { exerciseName, user_id, limit, type } }),
  deleteImage: (id, user_id) => api.delete(`/pose/image/${id}`, { params: { user_id } }),
};

// Video Analysis API (PoseRAC)
export const videoAnalysisAPI = {
  // Upload và xử lý video
  processVideo: (formData, onUploadProgress) => {
    return api.post('/video-analysis/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes timeout for video upload
      onUploadProgress: onUploadProgress,
    });
  },
  // Lấy kết quả phân tích theo ID
  getAnalysis: (id) => api.get(`/video-analysis/${id}`),
  // Lấy danh sách video analysis
  getAnalyses: (params) => api.get('/video-analysis', { params }),
  // Stream video output (với token trong query string để VideoPlayer có thể load)
  getVideoUrl: async (id) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const baseUrl = BASE_URL.replace('/api', '');
      return `${baseUrl}/api/video-analysis/${id}/video${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    } catch (error) {
      console.error('Error getting video URL:', error);
      const baseUrl = BASE_URL.replace('/api', '');
      return `${baseUrl}/api/video-analysis/${id}/video`;
    }
  },
  // Xóa video analysis
  deleteAnalysis: (id) => api.delete(`/video-analysis/${id}`),
  // Xóa video analysis
  deleteVideo: (analysisId) => api.delete(`/video-analysis/${analysisId}`),
};

// Notification API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationIds) => api.post('/notifications/mark-read', { notificationIds }),
};

export default api;
