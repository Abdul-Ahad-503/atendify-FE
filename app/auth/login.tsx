import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { authApi, STORAGE_KEYS } from "@/utils/api";
import { registerPushToken } from "@/utils/notifications";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Role = "student" | "teacher";

export default function LoginScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Call login API
      const response = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log("Login successful:", response.user.name);

      // Check if role matches
      if (response.user.role !== role) {
        Alert.alert(
          "Wrong Role",
          `This account is registered as ${response.user.role}. Please select the correct role.`,
        );
        return;
      }

      // Check if user has completed onboarding
      const onboardingCompleted = await AsyncStorage.getItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
      );

      if (onboardingCompleted === "true") {
        registerPushToken();
        router.replace("/(tabs)");
        // Route based on role
        // if (response.user.role === "teacher") {
        //   router.replace("/teacher");
        // } else {
        //   router.replace("/(tabs)");
        // }
      } else {
        registerPushToken();
        router.replace("/permissions/location");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/atendify.png")}
              style={styles.logoImage}
            />
          </View>

          <Text style={styles.appName}>Atendify</Text>
          <Text style={styles.tagline}>Location-Based Attendance</Text>

          {/* Login Form */}
          <View style={styles.form}>
            {/* Role Selection */}
            <View>
              <Text style={styles.label}>Login As</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "student" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("student")}
                >
                  <MaterialIcons
                    name="school"
                    size={24}
                    color={role === "student" ? Colors.surface : Colors.icon}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === "student" && styles.roleTextActive,
                    ]}
                  >
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "teacher" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("teacher")}
                >
                  <MaterialIcons
                    name="person"
                    size={24}
                    color={role === "teacher" ? Colors.surface : Colors.icon}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === "teacher" && styles.roleTextActive,
                    ]}
                  >
                    Teacher
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="email"
                size={20}
                color={Colors.icon}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock"
                size={20}
                color={Colors.icon}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color={Colors.icon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Not implemented",
                  "Forgot password flow is not added yet.",
                )
              }
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "center",
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 5,
  },
  logoImage: {
    width: 64,
    height: 64,
    resizeMode: "contain",
  },
  appName: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.md,
  },
  label: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  roleContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  roleTextActive: {
    color: Colors.surface,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  forgotPassword: {
    ...Typography.small,
    color: Colors.primary,
    textAlign: "right",
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...Typography.body,
    fontWeight: "500",
    color: Colors.surface,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  signupText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  signupLink: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: "500",
  },
});
