import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { authApi, STORAGE_KEYS } from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Role = "student" | "teacher";

export default function SignupScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!name || !email || !password || !department) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (role === "student" && !rollNumber) {
      Alert.alert("Error", "Please enter your roll number");
      return;
    }

    if (role === "teacher" && !employeeId) {
      Alert.alert("Error", "Please enter your employee ID");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role,
        department: department.trim(),
        ...(role === "student"
          ? { 
              rollNumber: rollNumber.trim(),
              semester: semester ? parseInt(semester) : undefined,
              course: course.trim() || undefined,
            }
          : { 
              employeeId: employeeId.trim(),
            }),
      };

      // Call register API
      const response = await authApi.register(userData);

      console.log("Registration successful:", response.user.name);

      Alert.alert(
        "Success",
        "Account created successfully! Let's set up your permissions.",
        [
          {
            text: "Continue",
            onPress: () => {
              // Clear any existing onboarding status
              AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
              router.replace("/permissions/location");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert("Registration Failed", error.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <MaterialIcons
                name="location-on"
                size={48}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Atendify today</Text>

            {/* Signup Form */}
            <View style={styles.form}>
              {/* Role Selection */}
              <View>
                <Text style={styles.label}>Select Role</Text>
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

              {/* Full Name */}
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="person"
                  size={20}
                  color={Colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={Colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email */}
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

              {/* Roll Number or Employee ID */}
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="badge"
                  size={20}
                  color={Colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={
                    role === "student" ? "Roll Number" : "Employee ID"
                  }
                  placeholderTextColor={Colors.textSecondary}
                  value={role === "student" ? rollNumber : employeeId}
                  onChangeText={
                    role === "student" ? setRollNumber : setEmployeeId
                  }
                />
              </View>

              {/* Department */}
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="business"
                  size={20}
                  color={Colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Department"
                  placeholderTextColor={Colors.textSecondary}
                  value={department}
                  onChangeText={setDepartment}
                />
              </View>

              {/* Course & Semester (Student only) */}
              {role === "student" && (
                <>
                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="book"
                      size={20}
                      color={Colors.icon}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Course"
                      placeholderTextColor={Colors.textSecondary}
                      value={course}
                      onChangeText={setCourse}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="calendar-today"
                      size={20}
                      color={Colors.icon}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Semester"
                      placeholderTextColor={Colors.textSecondary}
                      value={semester}
                      onChangeText={setSemester}
                      keyboardType="number-pad"
                    />
                  </View>
                </>
              )}

              {/* Password */}
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
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color={Colors.icon}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="lock"
                  size={20}
                  color={Colors.icon}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor={Colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>

              <TouchableOpacity
                style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.surface} />
                ) : (
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.surface,
    borderRadius: 20,
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
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
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
  signupButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    ...Typography.body,
    fontWeight: "500",
    color: Colors.surface,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  loginText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  loginLink: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: "500",
  },
});
