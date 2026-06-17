import { Colors, Spacing, Typography } from "@/constants/theme";
import { attendanceApi } from "@/utils/api";
import { getUserRole, UserRole } from "@/utils/userRole";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy attendance data
const STUDENT_ATTENDANCE_HISTORY = [
  {
    date: "Jan 27, 2026",
    subject: "Mobile App Development",
    status: "present",
    time: "10:05 AM",
    type: "auto",
    distance: "15m",
  },
  {
    date: "Jan 27, 2026",
    subject: "Database Systems",
    status: "present",
    time: "1:03 PM",
    type: "auto",
    distance: "12m",
  },
  {
    date: "Jan 24, 2026",
    subject: "Mobile App Development",
    status: "late",
    time: "10:18 AM",
    type: "auto",
    distance: "18m",
  },
  {
    date: "Jan 24, 2026",
    subject: "Database Systems",
    status: "present",
    time: "1:02 PM",
    type: "auto",
    distance: "10m",
  },
  {
    date: "Jan 24, 2026",
    subject: "Software Engineering",
    status: "present",
    time: "3:04 PM",
    type: "auto",
    distance: "14m",
  },
  {
    date: "Jan 23, 2026",
    subject: "Web Technologies",
    status: "present",
    time: "9:05 AM",
    type: "auto",
    distance: "16m",
  },
  {
    date: "Jan 23, 2026",
    subject: "Data Structures",
    status: "absent",
    time: "-",
    type: "auto",
    distance: "-",
  },
  {
    date: "Jan 23, 2026",
    subject: "Computer Networks",
    status: "present",
    time: "2:03 PM",
    type: "auto",
    distance: "11m",
  },
  {
    date: "Jan 22, 2026",
    subject: "Mobile App Development",
    status: "present",
    time: "10:06 AM",
    type: "auto",
    distance: "13m",
  },
  {
    date: "Jan 22, 2026",
    subject: "Artificial Intelligence",
    status: "late",
    time: "1:16 PM",
    type: "manual",
    distance: "-",
  },
  {
    date: "Jan 21, 2026",
    subject: "Web Technologies",
    status: "present",
    time: "9:04 AM",
    type: "auto",
    distance: "15m",
  },
  {
    date: "Jan 21, 2026",
    subject: "Database Systems",
    status: "present",
    time: "1:05 PM",
    type: "auto",
    distance: "17m",
  },
  {
    date: "Jan 21, 2026",
    subject: "Software Engineering",
    status: "absent",
    time: "-",
    type: "auto",
    distance: "-",
  },
  {
    date: "Jan 20, 2026",
    subject: "Computer Networks",
    status: "present",
    time: "10:03 AM",
    type: "auto",
    distance: "12m",
  },
  {
    date: "Jan 20, 2026",
    subject: "Artificial Intelligence",
    status: "present",
    time: "1:07 PM",
    type: "auto",
    distance: "19m",
  },
];

const TEACHER_ATTENDANCE_HISTORY = [
  {
    date: "Jan 27, 2026",
    subject: "Mobile App Development",
    course: "BS-CS 6A",
    present: 42,
    late: 3,
    absent: 5,
    total: 50,
  },
  {
    date: "Jan 27, 2026",
    subject: "Web Technologies",
    course: "BS-CS 5B",
    present: 38,
    late: 2,
    absent: 5,
    total: 45,
  },
  {
    date: "Jan 24, 2026",
    subject: "Mobile App Development",
    course: "BS-CS 6A",
    present: 45,
    late: 2,
    absent: 3,
    total: 50,
  },
  {
    date: "Jan 24, 2026",
    subject: "Web Technologies",
    course: "BS-CS 5B",
    present: 40,
    late: 1,
    absent: 4,
    total: 45,
  },
  {
    date: "Jan 24, 2026",
    subject: "Software Engineering",
    course: "BS-SE 4A",
    present: 36,
    late: 2,
    absent: 2,
    total: 40,
  },
  {
    date: "Jan 23, 2026",
    subject: "Mobile App Development",
    course: "BS-CS 6B",
    present: 43,
    late: 3,
    absent: 2,
    total: 48,
  },
  {
    date: "Jan 23, 2026",
    subject: "Web Technologies",
    course: "BS-CS 5A",
    present: 39,
    late: 1,
    absent: 2,
    total: 42,
  },
  {
    date: "Jan 22, 2026",
    subject: "Web Technologies",
    course: "BS-CS 5B",
    present: 41,
    late: 2,
    absent: 2,
    total: 45,
  },
  {
    date: "Jan 22, 2026",
    subject: "Mobile App Development",
    course: "BS-CS 6B",
    present: 44,
    late: 2,
    absent: 2,
    total: 48,
  },
  {
    date: "Jan 22, 2026",
    subject: "Software Engineering",
    course: "BS-SE 4A",
    present: 37,
    late: 1,
    absent: 2,
    total: 40,
  },
];

export default function HistoryScreen() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [filter, setFilter] = useState<"all" | "present" | "late" | "absent">(
    "all",
  );
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      loadHistory();
    }
  }, [userRole]);

  const loadUserRole = async () => {
    const role = await getUserRole();
    setUserRole(role);
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      if (userRole === "student") {
        const data = await attendanceApi.getStudentHistory();
        setHistory(data.records || []);
      } else {
        const data = await attendanceApi.getTeacherHistory();
        setHistory(data.records || []);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const data = userRole === "student"
        ? await attendanceApi.getStudentHistory()
        : await attendanceApi.getTeacherHistory();
      setHistory(data.records || []);
    } catch (error) {
      console.error("Error refreshing history:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredHistory =
    userRole === "student"
      ? filter === "all"
        ? history
        : history.filter((item: any) => item.status === filter)
      : history;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="history" size={32} color={Colors.primary} />
        <Text style={styles.headerTitle}>
          {userRole === "teacher" ? "Class History" : "Attendance History"}
        </Text>
      </View>

      {/* Filter Buttons (Student Only) */}
      {userRole === "student" && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "all" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === "all" && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "present" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("present")}
          >
            <MaterialIcons
              name="check-circle"
              size={16}
              color={filter === "present" ? Colors.surface : Colors.success}
            />
            <Text
              style={[
                styles.filterButtonText,
                filter === "present" && styles.filterButtonTextActive,
              ]}
            >
              Present
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "late" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("late")}
          >
            <MaterialIcons
              name="access-time"
              size={16}
              color={filter === "late" ? Colors.surface : Colors.warning}
            />
            <Text
              style={[
                styles.filterButtonText,
                filter === "late" && styles.filterButtonTextActive,
              ]}
            >
              Late
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "absent" && styles.filterButtonActive,
            ]}
            onPress={() => setFilter("absent")}
          >
            <MaterialIcons
              name="cancel"
              size={16}
              color={filter === "absent" ? Colors.surface : Colors.error}
            />
            <Text
              style={[
                styles.filterButtonText,
                filter === "absent" && styles.filterButtonTextActive,
              ]}
            >
              Absent
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : filteredHistory.length === 0 ? (
        <View style={styles.centerContent}>
          <MaterialIcons name="history" size={64} color={Colors.border} />
          <Text style={styles.errorTitle}>No Records</Text>
          <Text style={styles.errorMessage}>No attendance records found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(_item: any, idx: number) => _item._id || String(idx)}
          contentContainerStyle={styles.historyList}
          refreshControl={
            userRole === "student" ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }
          renderItem={({ item }) => {
            // Detect data format: real API vs dummy
            const isRealData = "_id" in item && "offeringId" in item;

            // Derive display fields from whatever format we have
            const courseCode = isRealData
              ? item.offeringId?.courseId?.code || "N/A"
              : item.courseCode || "";
            const subjectName = isRealData
              ? item.offeringId?.courseId?.name || "Course"
              : item.subject || "";
            const status = isRealData ? item.status : item.status;
            const dateDisplay = isRealData
              ? (() => { try { return new Date(item.markedAt).toLocaleDateString(); } catch { return item.markedAt; } })()
              : item.date;
            const timeDisplay = isRealData
              ? `${item.meetingId?.timeStart || ""}-${item.meetingId?.timeEnd || ""}`
              : item.time;
            const roomDisplay = isRealData
              ? `Room ${item.meetingId?.roomNo || "N/A"}`
              : "";
            const distanceDisplay = isRealData
              ? `${item.distanceMeters}m`
              : item.distance || "";
            const isAuto = isRealData ? true : item.type === "auto";

            return (
              <View style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{dateDisplay}</Text>
                  {userRole === "student" && (
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(status) + "20" },
                      ]}
                    >
                      {getStatusIcon(status)}
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(status) },
                        ]}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.subjectName}>
                  {isRealData ? courseCode : subjectName}
                </Text>
                {isRealData && (
                  <Text style={styles.courseFullName}>{subjectName}</Text>
                )}

                {userRole === "student" ? (
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="access-time" size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>Time: {timeDisplay}</Text>
                    </View>
                    {isRealData && roomDisplay ? (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="room" size={16} color={Colors.textSecondary} />
                        <Text style={styles.detailText}>{roomDisplay}</Text>
                      </View>
                    ) : null}
                    <View style={styles.detailRow}>
                      <MaterialIcons name={isAuto ? "gps-fixed" : "touch-app"} size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>{isAuto ? "Auto-marked" : "Manual"}</Text>
                    </View>
                    {distanceDisplay && distanceDisplay !== "-" && (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="place" size={16} color={Colors.textSecondary} />
                        <Text style={styles.detailText}>Distance: {distanceDisplay}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="people" size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>{item.course || item.courseName || item.section ? `${item.courseCode} - ${item.section}` : ""}</Text>
                    </View>
                    {(item.day || item.timeStart) && (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="access-time" size={16} color={Colors.textSecondary} />
                        <Text style={styles.detailText}>{item.day || ""} {item.timeStart ? `${item.timeStart}-${item.timeEnd || ""}` : ""}</Text>
                      </View>
                    )}
                    {item.roomNo && (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="room" size={16} color={Colors.textSecondary} />
                        <Text style={styles.detailText}>Room {item.roomNo}</Text>
                      </View>
                    )}
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <MaterialIcons name="check-circle" size={16} color={Colors.success} />
                        <Text style={[styles.statText, { color: Colors.success }]}>{item.present || 0}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <MaterialIcons name="access-time" size={16} color={Colors.warning} />
                        <Text style={[styles.statText, { color: Colors.warning }]}>{item.late || 0}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <MaterialIcons name="cancel" size={16} color={Colors.error} />
                        <Text style={[styles.statText, { color: Colors.error }]}>{item.absent || 0}</Text>
                      </View>
                      <Text style={styles.totalText}>/ {item.total || 0}</Text>
                    </View>
                    {item.total > 0 && (
                      <View style={styles.percentageBar}>
                        <View style={[styles.percentageFill, { width: `${((item.present || 0) / item.total) * 100}%` }]} />
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "present":
      return Colors.success;
    case "late":
      return Colors.warning;
    case "absent":
      return Colors.error;
    default:
      return Colors.textSecondary;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "present":
      return (
        <MaterialIcons name="check-circle" size={16} color={Colors.success} />
      );
    case "late":
      return (
        <MaterialIcons name="access-time" size={16} color={Colors.warning} />
      );
    case "absent":
      return <MaterialIcons name="cancel" size={16} color={Colors.error} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  filterContainer: {
    flexGrow: 0,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginHorizontal: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.background,
    gap: Spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: Colors.surface,
  },
  content: {
    flex: 1,
  },
  historyList: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  historyDate: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    ...Typography.small,
    fontWeight: "600",
    fontSize: 11,
  },
  subjectName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  courseFullName: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  detailsContainer: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  detailText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    ...Typography.body,
    fontWeight: "600",
  },
  totalText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  percentageBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: Spacing.sm,
  },
  percentageFill: {
    height: "100%",
    backgroundColor: Colors.success,
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
});
