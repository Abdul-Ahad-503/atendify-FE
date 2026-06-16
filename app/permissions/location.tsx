import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LocationPermissionScreen() {
  const router = useRouter();
  const [permissionStatus, setPermissionStatus] = useState<
    "granted" | "denied" | "undetermined"
  >("undetermined");

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissionStatus(
      status === "granted"
        ? "granted"
        : status === "denied"
          ? "denied"
          : "undetermined",
    );
  };

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status === "granted" ? "granted" : "denied");

      if (status === "granted") {
        // Permission granted, move to next step
        router.push("/permissions/background");
      } else {
        Alert.alert(
          "Permission Required",
          "Location permission is required for attendance verification. Please enable it in settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Location.requestForegroundPermissionsAsync(),
            },
          ],
        );
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      Alert.alert("Error", "Failed to request location permission");
    }
  };

  const handleNext = () => {
    if (permissionStatus === "granted") {
      router.push("/permissions/background");
    } else {
      requestPermission();
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Setup Permissions</Text>
        <Text style={styles.stepIndicator}>Step 1/4</Text>
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, styles.stepActive]}>
            <Text style={styles.stepNumberActive}>1</Text>
          </View>
          <Text style={styles.stepLabel}>Location</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={styles.stepLabel}>Background</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Battery</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>4</Text>
          </View>
          <Text style={styles.stepLabel}>Device</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="location-on"
              size={48}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.title}>Location Permission</Text>
          <Text style={styles.description}>
            We need access to your precise location to verify your attendance.
            This permission is required for the app to function.
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <MaterialIcons
                name="info-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.infoTitle}>Why we need this:</Text>
            </View>
            <Text style={styles.infoText}>
              • Verify you're within classroom range
            </Text>
            <Text style={styles.infoText}>• Automatic attendance marking</Text>
            <Text style={styles.infoText}>• Anti-spoofing detection</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Permission Status</Text>
            <Text
              style={[
                styles.statusBadge,
                permissionStatus === "granted"
                  ? styles.statusGranted
                  : styles.statusRequired,
              ]}
            >
              {permissionStatus === "granted" ? "Granted" : "Required"}
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {permissionStatus === "granted" ? "Next Step" : "Grant Permission"}
          </Text>
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
    marginBottom: Spacing.lg,
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
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  statusBadge: {
    ...Typography.small,
    fontWeight: "600",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  statusRequired: {
    color: "#F97316",
    backgroundColor: "#FFF7ED",
  },
  statusGranted: {
    color: Colors.success,
    backgroundColor: "#F0FDF4",
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
  nextButton: {
    flex: 2,
    height: 44,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "500",
  },
});
