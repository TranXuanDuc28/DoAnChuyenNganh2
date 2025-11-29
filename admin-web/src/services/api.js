import axios from 'axios';

// Use relative path in dev (proxy will handle it), full URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (!config.headers) {
      config.headers = {};
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    if (!isFormData && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
};

// Admin API
export const adminAPI = {
  // Stats
  getStats: () => api.get('/admin/stats'),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  toggleUserActive: (id) => api.patch(`/admin/users/${id}/toggle-active`),

  // Exercises
  getExercises: (params) => api.get('/admin/exercises', { params }),
  getExercise: (id) => api.get(`/admin/exercises/${id}`),
  createExercise: (data) => api.post('/admin/exercises', data),
  updateExercise: (id, data) => api.put(`/admin/exercises/${id}`, data),
  deleteExercise: (id) => api.delete(`/admin/exercises/${id}`),

  // Google Sheets Import
  getImportTemplate: () => api.get('/admin/exercises/import/template'),
  validateSheet: (data) => api.post('/admin/exercises/import/validate', data),
  importExercises: (data) => api.post('/admin/exercises/import', data),

  // Exercise Categories
  getExerciseCategories: (params) => api.get('/admin/exercise-categories', { params }),
  getExerciseCategory: (id) => api.get(`/admin/exercise-categories/${id}`),
  createExerciseCategory: (data) => api.post('/admin/exercise-categories', data),
  updateExerciseCategory: (id, data) => api.put(`/admin/exercise-categories/${id}`, data),
  deleteExerciseCategory: (id) => api.delete(`/admin/exercise-categories/${id}`),

  // Workouts
  getWorkouts: (params) => api.get('/admin/workouts', { params }),
  getWorkout: (id) => api.get(`/admin/workouts/${id}`),
  createWorkout: (data) => api.post('/admin/workouts', data),
  updateWorkout: (id, data) => api.put(`/admin/workouts/${id}`, data),
  deleteWorkout: (id) => api.delete(`/admin/workouts/${id}`),

  // Workout Plans
  getWorkoutPlans: (params) => api.get('/admin/workout-plans', { params }),
  getWorkoutPlan: (id) => api.get(`/admin/workout-plans/${id}`),
  deleteWorkoutPlan: (id) => api.delete(`/admin/workout-plans/${id}`),

  // Settings
  getSettings: (params) => api.get('/admin/settings', { params }),
  getSetting: (key) => api.get(`/admin/settings/${key}`),
  createOrUpdateSetting: (data) => api.post('/admin/settings', data),
  updateSetting: (key, data) => api.put(`/admin/settings/${key}`, data),
  deleteSetting: (key) => api.delete(`/admin/settings/${key}`),
};

export default api;




