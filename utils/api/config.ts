// API Configuration
// Update this URL based on your environment

// IMPORTANT: Configure the correct API URL for your setup:
// 1. For Android Emulator: use 10.0.2.2:5000
// 2. For iOS Simulator: use localhost:5000
// 3. For Physical Device: use your computer's local IP (e.g., 192.168.1.100:5000)
//    - Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
//    - Make sure your phone and computer are on the same WiFi network
// 4. For Production: use your deployed backend URL

export const API_CONFIG = {
  // Default for Android emulator - Change this based on your setup
  BASE_URL: __DEV__ 
    ? 'http://10.0.2.2:5000/api'  // Development
    : 'https://your-production-api.com/api',  // Production
  
  TIMEOUT: 30000, // 30 seconds
};

// Token storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  USER_ROLE: 'user_role',
  ONBOARDING_COMPLETED: 'onboarding_completed',
};
