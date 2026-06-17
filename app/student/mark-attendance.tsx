import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { attendanceApi } from "@/utils/api";
import {
  getAccurateLocation,
  requestLocationPermission,
} from "@/utils/permissions";
import { MaterialIcons } from "@expo/vector-icons";
import * as Device from "expo-device";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default function MarkAttendanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const meetingId = getParam(params.meetingId) || "";
  const courseName = getParam(params.courseName) || "";
  const courseCode = getParam(params.courseCode) || "";
  const roomNo = getParam(params.roomNo) || "";
  const timeStart = getParam(params.timeStart) || "";
  const timeEnd = getParam(params.timeEnd) || "";

  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<
    "idle" | "requesting" | "ready" | "error"
  >("idle");
  const [locationReady, setLocationReady] = useState(false);

  const scheduleText = `${timeStart} - ${timeEnd}`;

  useEffect(() => {
    requestLocationOnMount();
  }, []);

  const requestLocationOnMount = async () => {
    try {
      setGpsStatus("requesting");
      const permissionGranted = await requestLocationPermission();

      if (!permissionGranted) {
        setGpsStatus("error");
        return;
      }

      const location = await getAccurateLocation();
      if (location) {
        setLocationReady(true);
        setGpsStatus("ready");
      } else {
        setGpsStatus("error");
      }
    } catch (error) {
      console.error("Error requesting location:", error);
      setGpsStatus("error");
    }
  };

  const handleMarkAttendance = async () => {
    if (!meetingId) {
      Alert.alert("Error", "Meeting information is missing");
      return;
    }

    if (!locationReady) {
      Alert.alert("GPS Required", "Please enable GPS and try again");
      return;
    }

    setLoading(true);
    try {
      const location = await getAccurateLocation();

      if (!location) {
        Alert.alert(
          "GPS Error",
          "Unable to get current location. Please try again.",
        );
        setLoading(false);
        return;
      }

      const deviceInfo = Device.modelName || "Unknown Device";

      // Mark attendance
      await attendanceApi.markStudentAttendance({
        meetingId,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        radiusMeters: 10,
      });

      // Success - navigate to result screen
      router.push({
        pathname: "/student/attendance-result",
        params: {
          meetingId,
          courseCode,
          courseName,
          status: "success",
        },
      });
    } catch (error) {
      console.error("Error marking attendance:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to mark attendance";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLocation = async () => {
    setLocationReady(false);
    requestLocationOnMount();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons
            name="arrow-back"
            size={22}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mark Attendance</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Class Information */}
        <View style={styles.classCard}>
          <View style={styles.classHeader}>
            <MaterialIcons name="class" size={28} color={Colors.secondary} />
            <View style={styles.headerContent}>
              <Text style={styles.courseCode}>{courseCode}</Text>
              <Text style={styles.courseName}>{courseName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialIcons
                name="access-time"
                size={20}
                color={Colors.secondary}
              />
              <View>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{scheduleText}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons name="room" size={20} color={Colors.secondary} />
              <View>
                <Text style={styles.detailLabel}>Room</Text>
                <Text style={styles.detailValue}>{roomNo}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* GPS Status Card */}
        <View
          style={[
            styles.statusCard,
            {
              borderColor:
                gpsStatus === "ready"
                  ? "#10B981"
                  : gpsStatus === "error"
                    ? "#EF4444"
                    : Colors.border,
            },
          ]}
        >
          <View style={styles.statusHeader}>
            <MaterialIcons
              name={
                gpsStatus === "ready"
                  ? "check-circle"
                  : gpsStatus === "error"
                    ? "error"
                    : "location-on"
              }
              size={24}
              color={
                gpsStatus === "ready"
                  ? "#10B981"
                  : gpsStatus === "error"
                    ? "#EF4444"
                    : Colors.secondary
              }
            />
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                {gpsStatus === "ready"
                  ? "GPS Ready"
                  : gpsStatus === "error"
                    ? "GPS Permission Denied"
                    : "Requesting GPS..."}
              </Text>
              <Text style={styles.statusMessage}>
                {gpsStatus === "ready"
                  ? "Your location has been verified."
                  : gpsStatus === "error"
                    ? "GPS permission is required to mark attendance."
                    : "Please allow GPS access when prompted."}
              </Text>
            </View>
          </View>

          {gpsStatus === "requesting" && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.secondary} />
            </View>
          )}

          {gpsStatus === "error" && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetryLocation}
            >
              <MaterialIcons
                name="refresh"
                size={18}
                color={Colors.secondary}
              />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color={Colors.secondary} />
          <Text style={styles.infoText}>
            Your attendance will be marked automatically based on your location.
            You must be within 10 meters of the classroom.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!locationReady || loading) && styles.disabledButton,
            ]}
            onPress={handleMarkAttendance}
            disabled={!locationReady || loading}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color={Colors.surface} />
                <Text style={styles.primaryButtonText}>Marking...</Text>
              </>
            ) : (
              <>
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={Colors.surface}
                />
                <Text style={styles.primaryButtonText}>Mark Attendance</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.outlineButtonText}>Cancel</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  classCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    gap: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  classHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  courseCode: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  courseName: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  detailRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  detailLabel: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  statusHeader: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  statusMessage: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  retryButtonText: {
    ...Typography.small,
    color: Colors.secondary,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    gap: Spacing.md,
    backgroundColor: Colors.secondary + "10",
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    ...Typography.small,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: Spacing.md,
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
  disabledButton: {
    opacity: 0.5,
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
