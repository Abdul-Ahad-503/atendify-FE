import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { authApi, STORAGE_KEYS, apiClient } from "@/utils/api";
import type { RegisterRequest } from "@/utils/api/types";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

// Types
type Role = "student" | "teacher";

type Department = {
  _id: string;
  name: string;
  code: string;
};

type ProgramOption = {
  _id: string;
  name: string;
  code: string;
  departmentId: string | { _id: string; name: string; code: string };
};

const SECTION_OPTIONS = ["A", "B", "C"];
const SHIFT_OPTIONS: Array<"MORNING" | "EVENING"> = ["MORNING", "EVENING"];
const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function SignupScreen() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("student");

  // Common
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // IMPORTANT:
  // We keep sending departmentId/programId as codes like "CS" / "BSCS"
  // because backend resolveDepartmentRef/resolveProgramRef supports code values.
  const [departmentId, setDepartmentId] = useState<string>("");
  const [programId, setProgramId] = useState<string>("");

  // Auth
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Student
  const [rollNumber, setRollNumber] = useState("");
  const [semester, setSemester] = useState<number>(1);
  const [section, setSection] = useState<string>("A");
  const [shift, setShift] = useState<"MORNING" | "EVENING">("MORNING");

  // Teacher
  const [employeeId, setEmployeeId] = useState("");

  // Dropdown data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  useEffect(() => {
    loadMeta();
  }, []);

  // When department changes, clear program selection
  useEffect(() => {
    setProgramId("");
  }, [departmentId]);

  const loadMeta = async () => {
    setLoadingMeta(true);
    try {
      const [deptRes, progRes] = await Promise.all([
        apiClient.get("/departments"),
        apiClient.get("/programs"),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data.departments || []);
      if (progRes.data.success) setPrograms(progRes.data.data.programs || []);
    } catch (e) {
      console.warn("Failed to load meta data, using fallback:", e);
      setDepartments([
        { _id: "CS", name: "Computer Science", code: "CS" },
        { _id: "DEE", name: "Electrical Engineering", code: "DEE" },
        { _id: "DBA", name: "Business Administration", code: "DBA" },
      ]);
      setPrograms([
        { _id: "BSCS", name: "BS Computer Science", code: "BSCS", departmentId: "CS" },
        { _id: "BSAI", name: "BS Artificial Intelligence", code: "BSAI", departmentId: "CS" },
        { _id: "BSSE", name: "BS Software Engineering", code: "BSSE", departmentId: "CS" },
        { _id: "BSEE", name: "BS Electrical Engineering", code: "BSEE", departmentId: "DEE" },
        { _id: "BBA", name: "Bachelor of Business Administration", code: "BBA", departmentId: "DBA" },
      ]);
    } finally {
      setLoadingMeta(false);
    }
  };

  const validate = (): string | null => {
    if (!name.trim()) return "Please enter your name";
    if (!email.trim()) return "Please enter your email";
    if (!email.includes("@")) return "Please enter a valid email address";
    if (password.length < 6)
      return "Password must be at least 6 characters long";
    if (password !== confirmPassword) return "Passwords do not match";

    // Backend expects code values in departmentId/programId (e.g. CS/BSCS)
    if (!departmentId) return "Please select a department";

    if (role === "student") {
      if (!programId) return "Please select a program";
      if (!rollNumber.trim()) return "Please enter your roll number";
      if (!semester) return "Please select your semester";
      if (!section) return "Please select your section";
      if (!shift) return "Please select your shift";
    }

    if (role === "teacher") {
      if (!employeeId.trim()) return "Please enter your employee ID";
    }

    return null;
  };

  const handleSignup = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Error", err);
      return;
    }

    setLoading(true);
    const selectedDepartment = departments.find((d) => d.code === departmentId);
    const selectedProgram = programs.find((p) => p.code === programId);

    // Send the code value (e.g. "CS") — backend resolveDepartmentRef resolves it
    // send _id if it's a valid ObjectId, otherwise send code
    const deptValue = selectedDepartment?._id?.length === 24 ? selectedDepartment._id : selectedDepartment?.code || departmentId;

    try {
      const userData: RegisterRequest = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        departmentId: deptValue,
        department: selectedDepartment?.name || "",

        ...(role === "student"
          ? {
              programId, // code (e.g. BSCS) — backend resolveProgramRef resolves it
              program: selectedProgram?.name || "",
              rollNumber: rollNumber.trim(),
              studentId: rollNumber.trim(),
              semester,
              section, // A/B/C
              shift, // MORNING/EVENING
            }
          : {
              employeeId: employeeId.trim(),
            }),
      };

      const response = await authApi.register(userData);

      console.log("Registration successful:", response.user?.name);

      Alert.alert(
        "Success",
        "Account created successfully! Let's set up your permissions.",
        [
          {
            text: "Continue",
            onPress: async () => {
              await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
              router.replace("/permissions/location");
            },
          },
        ],
      );
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Failed",
        error.message || "Unable to create account",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms =
    departmentId && programs.length
      ? programs.filter((p) => {
          const deptId = typeof p.departmentId === "object" ? p.departmentId?.code || p.departmentId?._id : p.departmentId;
          return String(deptId) === String(departmentId);
        })
      : programs;

  const departmentPickerItems = loadingMeta
    ? [
        <Picker.Item
          key="loading-departments"
          label="Loading departments..."
          value=""
        />,
      ]
    : departments.length === 0
      ? [
          <Picker.Item
            key="no-departments"
            label="No departments found"
            value=""
          />,
        ]
      : [
          <Picker.Item
            key="select-department"
            label="Select Department"
            value=""
          />,
          ...departments.map((d) => (
            <Picker.Item
              key={d._id}
              label={`${d.name} (${d.code})`}
              value={d.code}
            />
          )),
        ];

  const programPickerItems = loadingMeta
    ? [
        <Picker.Item
          key="loading-programs"
          label="Loading programs..."
          value=""
        />,
      ]
    : filteredPrograms.length === 0
      ? [
          <Picker.Item
            key="no-programs"
            label={
              departmentId
                ? "No programs for selected department"
                : "Select Department first"
            }
            value=""
          />,
        ]
      : [
          <Picker.Item key="select-program" label="Select Program" value="" />,
          ...filteredPrograms.map((p) => (
            <Picker.Item
              key={p._id}
              label={`${p.name} (${p.code})`}
              value={p.code}
            />
          )),
        ];

  return (
    <SafeAreaView style={styles.outerContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <MaterialIcons
                name="location-on"
                size={48}
                color={Colors.primary}
              />
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Atendify today</Text>

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

              {/* Roll Number / Employee ID */}
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

              {/* Department dropdown (sends department code) */}
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="business"
                  size={20}
                  color={Colors.icon}
                  style={styles.inputIcon}
                />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={departmentId}
                    onValueChange={(value: string) => setDepartmentId(value)}
                    style={styles.pickerInput}
                    mode="dropdown"
                    dropdownIconColor={Colors.icon}
                  >
                    {departmentPickerItems}
                  </Picker>
                </View>
              </View>

              {/* Program / Semester / Section / Shift (Student only) */}
              {role === "student" && (
                <>
                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="book"
                      size={20}
                      color={Colors.icon}
                      style={styles.inputIcon}
                    />
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={programId}
                        onValueChange={(value: string) => setProgramId(value)}
                        style={styles.pickerInput}
                        mode="dropdown"
                        dropdownIconColor={Colors.icon}
                      >
                        {programPickerItems}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="calendar-today"
                      size={20}
                      color={Colors.icon}
                      style={styles.inputIcon}
                    />
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={semester}
                        onValueChange={(value: number) =>
                          setSemester(Number(value))
                        }
                        style={styles.pickerInput}
                      >
                        {SEMESTER_OPTIONS.map((sem) => (
                          <Picker.Item
                            key={sem}
                            label={`Semester ${sem}`}
                            value={sem}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.chipSelect, { flex: 1 }]}>
                      <Text style={styles.labelInline}>Section</Text>
                      <View style={styles.chipRow}>
                        {SECTION_OPTIONS.map((s) => (
                          <TouchableOpacity
                            key={s}
                            style={[
                              styles.chip,
                              section === s && styles.chipActive,
                            ]}
                            onPress={() => setSection(s)}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                section === s && styles.chipTextActive,
                              ]}
                            >
                              {s}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={[styles.chipSelect, { flex: 1 }]}>
                      <Text style={styles.labelInline}>Shift</Text>
                      <View style={styles.chipRow}>
                        {SHIFT_OPTIONS.map((sh) => (
                          <TouchableOpacity
                            key={sh}
                            style={[
                              styles.chip,
                              shift === sh && styles.chipActive,
                            ]}
                            onPress={() => setShift(sh)}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                shift === sh && styles.chipTextActive,
                              ]}
                            >
                              {sh}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
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
                style={[
                  styles.signupButton,
                  loading && styles.signupButtonDisabled,
                ]}
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

              {departments.length === 0 && (
                <Text style={styles.metaHint}>
                  Note: Department/Program dropdowns are not loaded yet.
                  Temporarily enter IDs until API endpoints exist.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, padding: Spacing.lg, justifyContent: "center" },

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
    shadowOffset: { width: 0, height: 10 },
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

  form: { gap: Spacing.md },

  label: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  roleContainer: { flexDirection: "row", gap: Spacing.md },
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
  roleTextActive: { color: Colors.surface },

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
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, ...Typography.body, color: Colors.textPrimary },

  signupButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  signupButtonDisabled: { opacity: 0.6 },
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
  loginText: { ...Typography.body, color: Colors.textSecondary },
  loginLink: { ...Typography.body, color: Colors.primary, fontWeight: "500" },

  row: { flexDirection: "row", gap: Spacing.md },

  chipSelect: { gap: Spacing.xs },
  labelInline: { ...Typography.small, color: Colors.textSecondary },
  chipRow: { flexDirection: "row", gap: Spacing.xs, flexWrap: "wrap" },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  chipText: { ...Typography.small, color: Colors.textPrimary },
  chipTextActive: { color: Colors.primary, fontWeight: "600" },

  metaHint: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },

  pickerWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  pickerInput: {
    width: "100%",
    height: 50,
    color: Colors.textPrimary,
    marginLeft: 0,
  },
});
