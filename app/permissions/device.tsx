import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DevicePermissionScreen() {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem("onboarding_completed", "true");
      setCompleted(true);

      Alert.alert(
        "Setup Complete!",
        "All permissions have been configured. You can now use Atendify to track your attendance.",
        [
          {
            text: "Get Started",
            onPress: () => router.replace("/(tabs)"),
          },
        ],
      );
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      router.replace("/(tabs)");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Setup Permissions</Text>
        <Text style={styles.stepIndicator}>Step 4/4</Text>
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCompleted]}>
            <MaterialIcons name="check" size={20} color={Colors.surface} />
          </View>
          <Text style={styles.stepLabel}>Location</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCompleted]}>
            <MaterialIcons name="check" size={20} color={Colors.surface} />
          </View>
          <Text style={styles.stepLabel}>Background</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepCompleted]}>
            <MaterialIcons name="check" size={20} color={Colors.surface} />
          </View>
          <Text style={styles.stepLabel}>Battery</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepActive]}>
            <Text style={styles.stepNumberActive}>4</Text>
          </View>
          <Text style={styles.stepLabel}>Device</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="phone-android"
              size={48}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.title}>Device Information</Text>
          <Text style={styles.description}>
            Atendify needs to access basic device information to ensure
            attendance accuracy and prevent fraudulent check-ins.
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <MaterialIcons
                name="info-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.infoTitle}>What we collect:</Text>
            </View>
            <Text style={styles.infoText}>
              • Device ID for unique identification
            </Text>
            <Text style={styles.infoText}>
              • Network information for connectivity
            </Text>
            <Text style={styles.infoText}>
              • Basic device specs for optimization
            </Text>
          </View>

          <View style={styles.securityBox}>
            <MaterialIcons name="security" size={24} color={Colors.success} />
            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>Privacy & Security</Text>
              <Text style={styles.securityText}>
                All data is encrypted and stored securely. We never share your
                information with third parties.
              </Text>
            </View>
          </View>

          <View style={styles.checklistBox}>
            <Text style={styles.checklistTitle}>Setup Complete!</Text>
            <View style={styles.checklistItem}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.checklistText}>
                Location permissions granted
              </Text>
            </View>
            <View style={styles.checklistItem}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.checklistText}>
                Background access enabled
              </Text>
            </View>
            <View style={styles.checklistItem}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.checklistText}>
                Battery optimization configured
              </Text>
            </View>
            <View style={styles.checklistItem}>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.checklistText}>Device info authorized</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>Complete Setup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === "ios" ? 60 : Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  stepIndicator: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  stepper: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  stepActive: {
    backgroundColor: Colors.primary,
  },
  stepCompleted: {
    backgroundColor: Colors.success,
  },
  stepNumber: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  stepNumberActive: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  stepLabel: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  infoBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: BorderRadius.input,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  infoText: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginLeft: Spacing.lg,
    lineHeight: 20,
  },
  securityBox: {
    flexDirection: "row",
    backgroundColor: "#F0FDF4",
    borderRadius: BorderRadius.input,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  securityText: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  checklistBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: BorderRadius.input,
    padding: Spacing.md,
  },
  checklistTitle: {
    ...Typography.body,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  checklistText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingBottom: Platform.OS === "ios" ? Spacing.xl : Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  completeButton: {
    flex: 2,
    height: 44,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  completeButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "500",
  },
});
