import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

/**
 * Permission utility functions for GeoAttend app
 */

export const PermissionStatus = {
  GRANTED: "granted",
  DENIED: "denied",
  UNDETERMINED: "undetermined",
} as const;

/**
 * Check if user has completed onboarding
 */
export const checkOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem("onboarding_completed");
    return completed === "true";
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
};

/**
 * Mark onboarding as completed
 */
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem("onboarding_completed", "true");
  } catch (error) {
    console.error("Error setting onboarding status:", error);
    throw error;
  }
};

/**
 * Reset onboarding status (for testing)
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("onboarding_completed");
  } catch (error) {
    console.error("Error resetting onboarding status:", error);
    throw error;
  }
};

/**
 * Check foreground location permission status
 */
export const checkLocationPermission = async (): Promise<
  "granted" | "denied" | "undetermined"
> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") return "granted";
    if (status === "denied") return "denied";
    return "undetermined";
  } catch (error) {
    console.error("Error checking location permission:", error);
    return "undetermined";
  }
};

/**
 * Request foreground location permission
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting location permission:", error);
    return false;
  }
};

/**
 * Check background location permission status
 */
export const checkBackgroundLocationPermission = async (): Promise<
  "granted" | "denied" | "undetermined"
> => {
  try {
    const { status } = await Location.getBackgroundPermissionsAsync();
    if (status === "granted") return "granted";
    if (status === "denied") return "denied";
    return "undetermined";
  } catch (error) {
    console.error("Error checking background location permission:", error);
    return "undetermined";
  }
};

/**
 * Request background location permission
 */
export const requestBackgroundLocationPermission =
  async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting background location permission:", error);
      return false;
    }
  };

/**
 * Check all permissions status
 */
export const checkAllPermissions = async () => {
  const [foreground, background] = await Promise.all([
    checkLocationPermission(),
    checkBackgroundLocationPermission(),
  ]);

  return {
    foreground,
    background,
    allGranted: foreground === "granted" && background === "granted",
  };
};

/**
 * Get current location
 */
export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return location;
  } catch (error) {
    console.error("Error getting current location:", error);
    throw error;
  }
};

/**
 * Watch user's location (for continuous tracking)
 */
export const watchLocation = async (
  callback: (location: Location.LocationObject) => void,
) => {
  try {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Update when moved 10 meters
      },
      callback,
    );
    return subscription;
  } catch (error) {
    console.error("Error watching location:", error);
    throw error;
  }
};
