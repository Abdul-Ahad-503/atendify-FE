import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function AttendanceResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const courseCode = getParam(params.courseCode) || "";
  const courseName = getParam(params.courseName) || "";
  const status = getParam(params.status) || "success";
  const distance = getParam(params.distance) || "";
  const radius = getParam(params.radius) || "";
  const markedAt = getParam(params.markedAt) || "";

  const isPresent = status === "present" || status === "success";
  const isLate = status === "late";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Animation - Success or Failure */}
        <View style={styles.animationContainer}>
          {isPresent ? (
            <View style={styles.successIcon}>
              <MaterialIcons name="check-circle" size={80} color="#10B981" />
            </View>
          ) : isLate ? (
            <View style={styles.successIcon}>
              <MaterialIcons name="access-time" size={80} color="#F59E0B" />
            </View>
          ) : (
            <View style={styles.failureIcon}>
              <MaterialIcons name="cancel" size={80} color="#EF4444" />
            </View>
          )}
        </View>

        {/* Main Status */}
        <View
          style={[
            styles.statusContainer,
            {
              backgroundColor: isPresent ? "#D1FAE5" : isLate ? "#FEF3C7" : "#FEE2E2",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: isPresent ? "#047857" : isLate ? "#92400E" : "#991B1B",
              },
            ]}
          >
            {isPresent ? "✅ MARKED PRESENT" : isLate ? "⏰ MARKED LATE" : "❌ MARKED ABSENT"}
          </Text>
        </View>

        {/* Class Information Card */}
        <View style={styles.classCard}>
          <Text style={styles.classCode}>{courseCode}</Text>
          <Text style={styles.className}>{courseName}</Text>
        </View>

        {/* Distance Information */}
        <View style={styles.distanceCard}>
          <View style={styles.distanceContent}>
            <View>
              <Text style={styles.distanceLabel}>Distance from Class</Text>
              <Text
                style={[
                  styles.distanceValue,
                  { color: isPresent ? "#10B981" : isLate ? "#F59E0B" : "#EF4444" },
                ]}
              >
                {distance}
              </Text>
              <Text style={styles.distanceSubtext}>Radius Limit: {radius}</Text>
            </View>
            <MaterialIcons
              name={isPresent ? "check-circle" : isLate ? "access-time" : "alert-circle"}
              size={60}
              color={isPresent ? "#10B981" : isLate ? "#F59E0B" : "#EF4444"}
            />
          </View>
        </View>

        {/* Status Explanation */}
        <View
          style={[
            styles.explanationCard,
            {
              backgroundColor: isPresent ? "#D1FAE520" : isLate ? "#FEF3C720" : "#FEE2E220",
            },
          ]}
        >
          <MaterialIcons
            name={isPresent ? "info" : isLate ? "access-time" : "warning"}
            size={24}
            color={isPresent ? "#10B981" : isLate ? "#F59E0B" : "#EF4444"}
          />
          <Text
            style={[
              styles.explanationText,
              {
                color: isPresent ? "#047857" : isLate ? "#92400E" : "#991B1B",
              },
            ]}
          >
            {isPresent
              ? "You are within the acceptable range. Your attendance is marked as present."
              : isLate
                ? "You are within range but arrived after the late cutoff time."
                : "You are outside the acceptable range. Your attendance is marked as absent."}
          </Text>
        </View>

        {/* Timestamp */}
        <View style={styles.timestampCard}>
          <MaterialIcons name="schedule" size={20} color={Colors.secondary} />
          <View>
            <Text style={styles.timestampLabel}>Marked At</Text>
            <Text style={styles.timestamp}>
              {markedAt
                ? new Date(markedAt).toLocaleString()
                : new Date().toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(tabs)")}
          >
            <MaterialIcons name="home" size={20} color={Colors.surface} />
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => router.push("/student/history")}
          >
            <MaterialIcons name="history" size={20} color={Colors.secondary} />
            <Text style={styles.outlineButtonText}>View History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  animationContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    marginVertical: Spacing.lg,
  },
  successIcon: {
    alignItems: "center",
  },
  failureIcon: {
    alignItems: "center",
  },
  statusContainer: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.card,
    alignItems: "center",
  },
  statusText: {
    ...Typography.h2,
    fontWeight: "700",
  },
  classCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classCode: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  className: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  distanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  distanceContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  distanceLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  distanceValue: {
    ...Typography.h2,
    fontWeight: "700",
  },
  distanceSubtext: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  explanationCard: {
    flexDirection: "row",
    gap: Spacing.md,
    backgroundColor: Colors.secondary + "10",
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    alignItems: "flex-start",
  },
  explanationText: {
    flex: 1,
    ...Typography.small,
    lineHeight: 20,
  },
  timestampCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timestampLabel: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timestamp: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  buttonContainer: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
  },
  primaryButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
  },
  outlineButtonText: {
    ...Typography.body,
    color: Colors.secondary,
    fontWeight: "600",
  },
});
