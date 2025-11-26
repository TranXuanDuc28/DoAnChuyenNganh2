import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Verify token and get user info
      // For now, just set a basic user object
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      
      if (user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      localStorage.setItem('admin_token', token);
      setUser({ ...user, token });
      return { success: true };
    } catch (error) {
      // Handle network errors
      if (error.message === 'Network Error' || !error.response) {
        return {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra xem backend có đang chạy không.'
        };
      }
      
      // Handle API errors
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Đăng nhập thất bại'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

