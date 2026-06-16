import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { attendanceApi } from "@/utils/api";
import { MeetingAttendanceRecord } from "@/utils/api/types";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
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

export default function AttendanceReportScreen() {
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

  const [report, setReport] = useState<{
    summary: {
      present: number;
      absent: number;
      total: number;
      avgDistance: number;
    };
    records: MeetingAttendanceRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const scheduleText = `${formatTime(timeStart)} - ${formatTime(timeEnd)}`;

  useEffect(() => {
    fetchReport();
  }, [meetingId]);

  const fetchReport = async () => {
    if (!meetingId) return;

    try {
      setLoading(true);
      const data = await attendanceApi.getMeetingAttendance(meetingId);
      setReport(data);
    } catch (error) {
      console.error("Error fetching report:", error);
      Alert.alert("Error", "Failed to load attendance report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!report) return;

    setExporting(true);
    try {
      // Prepare CSV data
      const csvContent = generateCSVContent();

      // In a real app, you would save this file or share it
      Alert.alert(
        "Success",
        "Report prepared for export. This would save as CSV file in a production app.",
      );

      console.log("CSV Content:", csvContent);
    } catch (error) {
      console.error("Error exporting report:", error);
      Alert.alert("Error", "Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const generateCSVContent = (): string => {
    if (!report) return "";

    const headers = [
      "Student Name",
      "Roll Number",
      "Email",
      "Status",
      "Distance (m)",
      "Marked At",
    ];

    const rows = report.records.map((record) => [
      record.studentId.name,
      record.studentId.rollNumber,
      record.studentId.email,
      record.status.toUpperCase(),
      record.distanceMeters.toString(),
      new Date(record.markedAt).toLocaleString(),
    ]);

    const csvLines = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ];

    return csvLines.join("\n");
  };

  const handleBackHome = () => {
    router.push("/teacher");
  };

  const renderStudentRecord = ({ item }: { item: MeetingAttendanceRecord }) => {
    const isPresent = item.status === "present";
    const statusColor = isPresent ? "#10B981" : "#EF4444";
    const statusBg = isPresent ? "#D1FAE5" : "#FEE2E2";

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordContent}>
          <View style={styles.studentInfo}>
            <View>
              <Text style={styles.studentName}>{item.studentId.name}</Text>
              <Text style={styles.studentRoll}>
                {item.studentId.rollNumber}
              </Text>
              <Text style={styles.studentEmail}>{item.studentId.email}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <MaterialIcons
              name={isPresent ? "check-circle" : "cancel"}
              size={24}
              color={statusColor}
            />
            <View>
              <Text style={[styles.statusLabel, { color: statusColor }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
              <Text style={[styles.distanceLabel, { color: statusColor }]}>
                {item.distanceMeters}m
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Loading attendance report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <MaterialIcons name="error-outline" size={64} color={Colors.border} />
          <Text style={styles.errorTitle}>Unable to Load Report</Text>
          <Text style={styles.errorMessage}>
            There was an error loading the attendance report.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={fetchReport}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const attendancePercentage =
    enrolledCount > 0
      ? Math.round((report.summary.present / enrolledCount) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Attendance Report</Text>
          <Text style={styles.headerSubtitle}>Session Complete</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleBackHome}>
          <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={report.records}
        renderItem={renderStudentRecord}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Meeting Info */}
            <View style={styles.meetingCard}>
              <View>
                <Text style={styles.courseCode}>{courseCode}</Text>
                <Text style={styles.courseName}>{courseName}</Text>
              </View>
              <View style={styles.meetingMeta}>
                <Text style={styles.metaText}>{scheduleText}</Text>
                <Text style={styles.metaText}>Room {roomNo}</Text>
              </View>
            </View>

            {/* Summary Stats */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Summary</Text>

              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { borderLeftColor: "#10B981" }]}>
                  <MaterialIcons
                    name="check-circle"
                    size={28}
                    color="#10B981"
                  />
                  <Text style={styles.statValue}>{report.summary.present}</Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>

                <View style={[styles.statCard, { borderLeftColor: "#EF4444" }]}>
                  <MaterialIcons name="cancel" size={28} color="#EF4444" />
                  <Text style={styles.statValue}>{report.summary.absent}</Text>
                  <Text style={styles.statLabel}>Absent</Text>
                </View>

                <View style={[styles.statCard, { borderLeftColor: "#6366F1" }]}>
                  <MaterialIcons name="people" size={28} color="#6366F1" />
                  <Text style={styles.statValue}>{enrolledCount}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>

              {/* Percentage and Average */}
              <View style={styles.metricsRow}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Attendance Rate</Text>
                  <Text style={styles.metricValue}>
                    {attendancePercentage}%
                  </Text>
                  <View style={styles.percentageBar}>
                    <View
                      style={[
                        styles.percentageFill,
                        { width: `${attendancePercentage}%` },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Avg Distance</Text>
                  <Text style={styles.metricValue}>
                    {report.summary.avgDistance.toFixed(1)}m
                  </Text>
                </View>
              </View>
            </View>

            {/* Student List Header */}
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>Student Records</Text>
              <Text style={styles.listHeaderCount}>
                {report.records.length} students
              </Text>
            </View>
          </>
        }
        ListFooterComponent={
          <>
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.exportButton,
                  exporting && styles.disabledButton,
                ]}
                onPress={handleExportReport}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <ActivityIndicator size="small" color={Colors.secondary} />
                    <Text style={styles.exportButtonText}>Exporting...</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons
                      name="file-download"
                      size={20}
                      color={Colors.secondary}
                    />
                    <Text style={styles.exportButtonText}>Export Report</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.homeButton}
                onPress={handleBackHome}
              >
                <MaterialIcons name="home" size={20} color={Colors.surface} />
                <Text style={styles.homeButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  errorMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  meetingCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
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
  meetingMeta: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  summarySection: {
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    borderLeftWidth: 4,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderTopColor: Colors.border,
    borderRightColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: "700",
    marginTop: Spacing.xs,
  },
  statLabel: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricLabel: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    ...Typography.h2,
    color: Colors.secondary,
    fontWeight: "700",
    marginTop: Spacing.xs,
  },
  percentageBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    marginTop: Spacing.sm,
    overflow: "hidden",
  },
  percentageFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  listHeader: {
    marginBottom: Spacing.md,
  },
  listHeaderTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  listHeaderCount: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  recordCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  recordContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  studentRoll: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  studentEmail: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    // borderRadius: BorderRadius.small,
  },
  statusLabel: {
    ...Typography.small,
    fontWeight: "600",
  },
  distanceLabel: {
    ...Typography.extraSmall,
    marginTop: 2,
  },
  buttonContainer: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
  },
  exportButtonText: {
    ...Typography.body,
    color: Colors.secondary,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
  },
  homeButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    alignItems: "center",
  },
  primaryButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
});
