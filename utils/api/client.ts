import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { API_CONFIG, STORAGE_KEYS } from './config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.USER_ROLE,
      ]);
      router.replace('/auth/login');
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message === 'Network Error') {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
    return axiosError.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
};

export default apiClient;
