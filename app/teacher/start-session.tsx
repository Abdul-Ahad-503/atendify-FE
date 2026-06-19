import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { attendanceApi, StartTeacherSessionRequest } from "@/utils/api";
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

const formatTime = (time?: string) => {
  if (!time) return "TBA";
  const date = new Date(`2000-01-01T${time}`);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function StartSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [locationReady, setLocationReady] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<
    "idle" | "requesting" | "ready" | "error"
  >("idle");
  const [radiusMeters, setRadiusMeters] = useState(10);

  const meetingId = getParam(params.meetingId) || "";
  const courseCode = getParam(params.courseCode) || "";
  const courseName = getParam(params.courseName) || "";
  const timeStart = getParam(params.timeStart) || "";
  const timeEnd = getParam(params.timeEnd) || "";
  const roomNo = getParam(params.roomNo) || "";
  const section = getParam(params.section) || "";
  const semester = getParam(params.semester) || "";
  const enrolledCount = parseInt(getParam(params.enrolledCount) || "0");

  const scheduleText = `${formatTime(timeStart)} - ${formatTime(timeEnd)}`;

  useEffect(() => {
    // Automatically request location permission when screen loads
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

      // Try to get location to verify it works
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

  const handleStartSession = async () => {
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
      // Get current location
      const location = await getAccurateLocation();

      if (!location) {
        Alert.alert(
          "GPS Error",
          "Unable to get current location. Please try again.",
        );
        setLoading(false);
        return;
      }

      // Get device info
      const deviceInfo = Device.modelName || "Unknown Device";

      // Prepare request data
      const requestData: StartTeacherSessionRequest = {
        meetingId,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        radiusMeters,
        details: {
          courseName,
          courseCode,
          roomNumber: roomNo,
          section,
          semester: parseInt(semester),
          enrolledCount,
          timeStart,
          timeEnd,
        },
        deviceInfo,
      };

      // Call API to start session
      const response = await attendanceApi.startAttendanceSession(requestData);

      // Success - navigate to live session screen
      Alert.alert(
        "Success",
        `Attendance started!\nRadius: ${response.radiusMeters}m\n${response.enrolledStudentsCount} students notified`,
        [
          {
            text: "OK",
            onPress: () => {
              router.push({
                pathname: "/teacher/attendance-session",
                params: {
                  sessionId: response.sessionId,
                  meetingId,
                  courseCode,
                  courseName,
                  timeStart,
                  timeEnd,
                  roomNo,
                  section,
                  semester,
                  enrolledCount: enrolledCount.toString(),
                  enrolledStudentsCount:
                    response.enrolledStudentsCount.toString(),
                  radiusMeters: response.radiusMeters.toString(),
                },
              });
            },
          },
        ],
      );
    } catch (error) {
      console.error("Error starting session:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start attendance session";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLocation = async () => {
    setLocationReady(false);
    requestLocationOnMount();
  };

  const handleOpenSettings = () => {
    // This would open device settings on actual device
    Alert.alert(
      "Settings",
      "Please enable GPS in device settings and return to this screen.",
    );
  };

  return (
    <SafeAreaView style={styles.container} >
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
        <Text style={styles.headerTitle}>Start Attendance</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Meeting Information */}
        <View style={styles.meetingCard}>
          <View style={styles.meetingHeader}>
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
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialIcons name="room" size={20} color={Colors.secondary} />
              <View>
                <Text style={styles.detailLabel}>Room</Text>
                <Text style={styles.detailValue}>{roomNo}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons name="people" size={20} color={Colors.secondary} />
              <View>
                <Text style={styles.detailLabel}>Students</Text>
                <Text style={styles.detailValue}>{enrolledCount}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialIcons
                name="category"
                size={20}
                color={Colors.secondary}
              />
              <View>
                <Text style={styles.detailLabel}>Section</Text>
                <Text style={styles.detailValue}>{section}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons name="layers" size={20} color={Colors.secondary} />
              <View>
                <Text style={styles.detailLabel}>Semester</Text>
                <Text style={styles.detailValue}>{semester}</Text>
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
                  ? "Your location has been verified and is ready to use."
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
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRetryLocation}
              >
                <MaterialIcons
                  name="refresh"
                  size={18}
                  color={Colors.secondary}
                />
                <Text style={styles.secondaryButtonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleOpenSettings}
              >
                <MaterialIcons
                  name="settings"
                  size={18}
                  color={Colors.secondary}
                />
                <Text style={styles.secondaryButtonText}>Settings</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Radius Selector Card */}
        <View style={styles.radiusCard}>
          <View style={styles.radiusHeader}>
            <MaterialIcons name="near-me" size={20} color={Colors.secondary} />
            <Text style={styles.radiusTitle}>Proximity Radius</Text>
          </View>
          <Text style={styles.radiusValue}>{radiusMeters} meters</Text>
          <View style={styles.radiusSliderRow}>
            <TouchableOpacity
              style={styles.radiusAdjustButton}
              onPress={() => setRadiusMeters(Math.max(5, radiusMeters - 5))}
            >
              <MaterialIcons name="remove" size={20} color={Colors.secondary} />
            </TouchableOpacity>
            <View style={styles.radiusPresets}>
              {[5, 10, 15, 20, 25, 30].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.radiusPreset,
                    radiusMeters === val && styles.radiusPresetActive,
                  ]}
                  onPress={() => setRadiusMeters(val)}
                >
                  <Text
                    style={[
                      styles.radiusPresetText,
                      radiusMeters === val && styles.radiusPresetTextActive,
                    ]}
                  >
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.radiusAdjustButton}
              onPress={() => setRadiusMeters(Math.min(30, radiusMeters + 5))}
            >
              <MaterialIcons name="add" size={20} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.radiusHint}>
            Students must be within {radiusMeters}m of your location to be marked present.
          </Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color={Colors.secondary} />
          <Text style={styles.infoText}>
            A notification will be sent to all {enrolledCount} enrolled students
            when you start the session.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!locationReady || loading) && styles.disabledButton,
            ]}
            onPress={handleStartSession}
            disabled={!locationReady || loading}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color={Colors.surface} />
                <Text style={styles.primaryButtonText}>Starting...</Text>
              </>
            ) : (
              <>
                <MaterialIcons
                  name="play-circle-filled"
                  size={20}
                  color={Colors.surface}
                />
                <Text style={styles.primaryButtonText}>Start Session</Text>
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
  meetingCard: {
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
  meetingHeader: {
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
    ...Typography.small,
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
  actionContainer: {
    flexDirection: "row",
    gap: Spacing.md,
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
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: Spacing.sm,
    // borderRadius: BorderRadius.sm,
  },
  secondaryButtonText: {
    ...Typography.small,
    color: Colors.secondary,
    fontWeight: "600",
  },
  radiusCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  radiusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  radiusTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  radiusValue: {
    ...Typography.h2,
    color: Colors.secondary,
    fontWeight: "700",
    textAlign: "center",
  },
  radiusSliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  radiusAdjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  radiusPresets: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radiusPreset: {
    width: 40,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radiusPresetActive: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary,
  },
  radiusPresetText: {
    ...Typography.small,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  radiusPresetTextActive: {
    color: Colors.surface,
  },
  radiusHint: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
