import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "student" | "teacher";

/**
 * Get the current user's role from AsyncStorage
 */
export const getUserRole = async (): Promise<UserRole | null> => {
  try {
    const role = await AsyncStorage.getItem("user_role");
    return role as UserRole | null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

/**
 * Set the user's role in AsyncStorage
 */
export const setUserRole = async (role: UserRole): Promise<void> => {
  try {
    await AsyncStorage.setItem("user_role", role);
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
};

/**
 * Clear the user's role from AsyncStorage
 */
export const clearUserRole = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("user_role");
  } catch (error) {
    console.error("Error clearing user role:", error);
    throw error;
  }
};

/**
 * Check if the current user is a student
 */
export const isStudent = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === "student";
};

/**
 * Check if the current user is a teacher
 */
export const isTeacher = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === "teacher";
};
