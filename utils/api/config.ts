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
  // IMPORTANT: Using your computer's IP for physical device
  // Your Computer IP: 192.168.100.23
  // Make sure your phone and computer are on the SAME WiFi network!
  BASE_URL: __DEV__
    ? "http://10.13.21.224:5000/api" // Physical Device - Your Computer's IP
    : "https://your-production-api.com/api", // Production

  TIMEOUT: 30000, // 30 seconds`
};

// Token storage keys
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "user_data",
  USER_ROLE: "user_role",
  ONBOARDING_COMPLETED: "onboarding_completed",
};
