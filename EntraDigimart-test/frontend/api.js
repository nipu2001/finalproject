// services/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL for your backend API
const BASE_URL = 'http://192.168.8.124:5000/api'; // Change to your backend IP

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  // Register user
  register: async (userData) => {
    try {
      // For forms with files, use FormData
      if (userData.role === 'seller' || userData.role === 'investor') {
        const formData = new FormData();
        
        // Add all text fields
        Object.keys(userData).forEach(key => {
          if (key !== 'businessImage' && key !== 'idImage' && key !== 'bankProofImage' && userData[key] !== null) {
            formData.append(key, userData[key]);
          }
        });
        
        // Add image files if they exist
        if (userData.businessImage) {
          formData.append('businessImage', {
            uri: userData.businessImage,
            type: 'image/jpeg',
            name: 'business.jpg'
          });
        }
        if (userData.idImage) {
          formData.append('idImage', {
            uri: userData.idImage,
            type: 'image/jpeg',
            name: 'id.jpg'
          });
        }
        if (userData.bankProofImage) {
          formData.append('bankProofImage', {
            uri: userData.bankProofImage,
            type: 'image/jpeg',
            name: 'bankproof.jpg'
          });
        }
        
        const response = await api.post('/users/register', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // For non-file registration (customer, affiliate)
        const response = await api.post('/users/register', userData);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // Reset password
  resetPassword: async (verificationCode, newPassword) => {
    try {
      const response = await api.post('/users/reset-password', { 
        verificationCode, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: error.message };
    }
  },

  // Update user profile
};

// Store token securely
export const storeToken = async (token) => {
  try {
    await SecureStore.setItemAsync('token', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Remove token
export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync('token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Get token
export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export default api;