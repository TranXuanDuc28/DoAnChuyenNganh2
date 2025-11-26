import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, API_BASE_URL } from '../services/api';
import pushService from '../services/pushService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token with server
        try {
          const response = await authAPI.getCurrentUser(storedToken);
          setUser(response.data);
          await AsyncStorage.setItem('userData', JSON.stringify(response.data));
          // register push token if available (on device)
          try {
            const token = await pushService.registerForPushNotificationsAsync(true);
            if (token) {
              // try sending to backend with auth token
              await fetch(`${API_BASE_URL}/push/register`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${storedToken}`
                },
                body: JSON.stringify({ pushToken: token })
              });
            }
          } catch (err) {
            console.warn('Push registration error:', err);
          }
        } catch (error) {
          // Token is invalid, clear storage
          await clearAuth();
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Login 1 :', email);
      const response = await authAPI.login(email, password);
      
      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      // Register push token upon successful login
      try {
        const token = await pushService.registerForPushNotificationsAsync(true);
        if (token) {
          await fetch(`${API_BASE_URL}/push/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newToken}`
            },
            body: JSON.stringify({ pushToken: token })
          });
        }
      } catch (err) {
        console.warn('Push registration error after login:', err);
      }
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userDataInput) => {
    console.log('Registration response:', userDataInput);
    try {
      const response = await authAPI.register(userDataInput);
      
      const { token: newToken, user: userData } = response.data;

      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      // Register push token after registration
      try {
        const token = await pushService.registerForPushNotificationsAsync(true);
        if (token) {
          await fetch(`${API_BASE_URL}/push/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newToken}`
            },
            body: JSON.stringify({ pushToken: token })
          });
        }
      } catch (err) {
        console.warn('Push registration error after register:', err);
      }
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearAuth = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const completeOnboarding = async (onboardingData) => {
    try {
      const response = await authAPI.completeOnboarding(onboardingData, token);
      updateUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error('Complete onboarding error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to complete onboarding' 
      };
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
