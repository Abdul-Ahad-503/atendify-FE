import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { attendanceApi } from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

export default function AttendanceSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const sessionId = getParam(params.sessionId) || "";
  const meetingId = getParam(params.meetingId) || "";
  const courseCode = getParam(params.courseCode) || "";
  const courseName = getParam(params.courseName) || "";
  const timeStart = getParam(params.timeStart) || "";
  const timeEnd = getParam(params.timeEnd) || "";
  const roomNo = getParam(params.roomNo) || "";
  const section = getParam(params.section) || "";
  const semester = getParam(params.semester) || "";
  const enrolledCount = parseInt(getParam(params.enrolledCount) || "0");

  const [attendanceCount, setAttendanceCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [endingSession, setEndingSession] = useState(false);

  const scheduleText = `${formatTime(timeStart)} - ${formatTime(timeEnd)}`;
  const progressPercentage = Math.round(
    (attendanceCount / enrolledCount) * 100,
  );

  // Auto-fetch attendance count every 5 seconds
  useEffect(() => {
    fetchAttendanceCount();
    const interval = setInterval(fetchAttendanceCount, 10000);

    return () => clearInterval(interval);
  }, [meetingId]);

  useFocusEffect(
    useCallback(() => {
      // Fetch when screen comes into focus
      fetchAttendanceCount();
    }, [meetingId]),
  );

  const fetchAttendanceCount = async () => {
    if (!meetingId) return;

    try {
      if (!refreshing && !loading) {
        // Don't set loading for auto-refresh
        setRefreshing(true);
      }

      const report = await attendanceApi.getMeetingAttendance(meetingId);

      if (report && report.summary) {
        setAttendanceCount(report.summary.present || 0);
        setAbsentCount(report.summary.absent || 0);
        setLateCount(report.summary.late || 0);
      }
    } catch (error) {
      console.error("Error fetching attendance count:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceCount();
    setRefreshing(false);
  };

  const handleEndSession = async () => {
    Alert.alert(
      "End Attendance Session?",
      "Are you sure you want to end this attendance session? Students will no longer be able to mark attendance.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "End Session",
          onPress: async () => {
            setEndingSession(true);
            try {
              // Call API to end session if needed
              await attendanceApi.endAttendanceSession(sessionId);

              // Navigate to report screen
              router.push({
                pathname: "/teacher/attendance-report",
                params: {
                  sessionId,
                  meetingId,
                  courseCode,
                  courseName,
                  timeStart,
                  timeEnd,
                  roomNo,
                  section,
                  semester,
                  enrolledCount: enrolledCount.toString(),
                },
              });

              Alert.alert("Success", "Attendance session ended");
            } catch (error) {
              console.error("Error ending session:", error);
              Alert.alert("Error", "Failed to end session. Please try again.");
            } finally {
              setEndingSession(false);
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Attendance Session</Text>
          <Text style={styles.headerSubtitle}>Live Updates</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={Colors.secondary} />
          ) : (
            <MaterialIcons name="refresh" size={24} color={Colors.secondary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Meeting Info Card */}
        <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View>
            <Text style={styles.courseCode}>{courseCode}</Text>
            <Text style={styles.courseName}>{courseName}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Session Active</Text>
          </View>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons
              name="access-time"
              size={18}
              color={Colors.secondary}
            />
            <View>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{scheduleText}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="room" size={18} color={Colors.secondary} />
            <View>
              <Text style={styles.infoLabel}>Room</Text>
              <Text style={styles.infoValue}>{roomNo}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="category" size={18} color={Colors.secondary} />
            <View>
              <Text style={styles.infoLabel}>Section</Text>
              <Text style={styles.infoValue}>{section}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="layers" size={18} color={Colors.secondary} />
            <View>
              <Text style={styles.infoLabel}>Semester</Text>
              <Text style={styles.infoValue}>{semester}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Attendance Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.statsLabel}>Students Marked Attendance</Text>

        <View style={styles.counterCard}>
          <View style={styles.counterContent}>
            <Text style={styles.counterNumber}>{attendanceCount}</Text>
            <Text style={styles.counterLabel}>Present</Text>
          </View>
          <Text style={styles.counterDivider}>/</Text>
          <View style={styles.counterContent}>
            <Text style={styles.totalNumber}>{enrolledCount}</Text>
            <Text style={styles.totalLabel}>Total</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarWrapper}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.max(progressPercentage, 5)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progressPercentage}% Complete
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={32} color="#10B981" />
            <Text style={styles.statValue}>{attendanceCount}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="access-time" size={32} color="#F59E0B" />
            <Text style={styles.statValue}>{lateCount}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="cancel" size={32} color="#EF4444" />
            <Text style={styles.statValue}>{absentCount}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>

        {/* Pending Count */}
        <View style={styles.pendingRow}>
          <Text style={styles.pendingLabel}>Still Pending:</Text>
          <Text style={styles.pendingValue}>
            {Math.max(0, enrolledCount - attendanceCount - lateCount - absentCount)}
          </Text>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <MaterialIcons name="info" size={20} color={Colors.secondary} />
        <Text style={styles.infoBoxText}>
          Real-time updates. Students have unlimited time to mark attendance.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.endButton, endingSession && styles.disabledButton]}
          onPress={handleEndSession}
          disabled={endingSession}
        >
          {endingSession ? (
            <>
              <ActivityIndicator size="small" color={Colors.surface} />
              <Text style={styles.endButtonText}>Ending...</Text>
            </>
          ) : (
            <>
              <MaterialIcons
                name="stop-circle"
                size={20}
                color={Colors.surface}
              />
              <Text style={styles.endButtonText}>End Session</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refreshActionButton}
          onPress={handleRefresh}
          disabled={refreshing || endingSession}
        >
          <MaterialIcons name="refresh" size={20} color={Colors.secondary} />
          <Text style={styles.refreshActionText}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Text>
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
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary + "10",
  },
  infoCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "#10B98120",
    // borderRadius: BorderRadius.small,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  statusText: {
    ...Typography.small,
    color: "#10B981",
    fontWeight: "600",
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  infoRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  infoLabel: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginTop: 2,
  },
  statsSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  statsLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  counterCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterContent: {
    alignItems: "center",
    flex: 1,
  },
  counterNumber: {
    ...Typography.h1,
    color: "#10B981",
    fontWeight: "700",
  },
  counterLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  counterDivider: {
    ...Typography.h2,
    color: Colors.border,
  },
  totalNumber: {
    ...Typography.h1,
    color: Colors.secondary,
    fontWeight: "700",
  },
  totalLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  progressContainer: {
    gap: Spacing.sm,
  },
  progressBarWrapper: {
    width: "100%",
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 6,
  },
  progressText: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: "700",
    marginTop: Spacing.xs,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  infoBox: {
    flexDirection: "row",
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.secondary + "10",
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    alignItems: "center",
  },
  infoBoxText: {
    flex: 1,
    ...Typography.small,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  pendingLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  pendingValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  buttonContainer: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#EF4444",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
  },
  endButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  refreshActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
  },
  refreshActionText: {
    ...Typography.body,
    color: Colors.secondary,
    fontWeight: "600",
  },
});
