import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { handleApiError } from './client';
import { STORAGE_KEYS } from './config';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from './types';

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        credentials
      );
      
      if (response.data.success && response.data.data) {
        // Store token and user data
        await AsyncStorage.setItem(
          STORAGE_KEYS.TOKEN,
          response.data.data.token
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(response.data.data.user)
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_ROLE,
          response.data.data.user.role
        );
        
        return response.data.data;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        userData
      );
      
      if (response.data.success && response.data.data) {
        // Store token and user data
        await AsyncStorage.setItem(
          STORAGE_KEYS.TOKEN,
          response.data.data.token
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(response.data.data.user)
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_ROLE,
          response.data.data.user.role
        );
        
        return response.data.data;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>(
        '/auth/me'
      );
      
      if (response.data.success && response.data.data) {
        // Update stored user data
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(response.data.data.user)
        );
        
        return response.data.data.user;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint if you have one
      // await apiClient.post('/auth/logout');
      
      // Clear all stored data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.USER_ROLE,
      ]);
    } catch (error) {
      // Still clear local data even if API call fails
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.USER_ROLE,
      ]);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      return !!token;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get stored user data
   */
  getStoredUser: async (): Promise<User | null> => {
    try {
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },
};
