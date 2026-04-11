import { Colors, Spacing, Typography } from "@/constants/theme";
import { getUserRole, UserRole } from "@/utils/userRole";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
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

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const role = await getUserRole();
    setUserRole(role);
  };

  const history =
    userRole === "teacher"
      ? TEACHER_ATTENDANCE_HISTORY
      : STUDENT_ATTENDANCE_HISTORY;

  const filteredHistory =
    userRole === "student"
      ? filter === "all"
        ? history
        : history.filter((item) => "status" in item && item.status === filter)
      : history;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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

      {/* History List */}
      <ScrollView style={styles.content}>
        <View style={styles.historyList}>
          {filteredHistory.map((item, index) => (
            <View key={index} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{item.date}</Text>
                {userRole === "student" && "status" in item && (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(item.status) + "20" },
                    ]}
                  >
                    {getStatusIcon(item.status)}
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.subjectName}>{item.subject}</Text>

              {userRole === "student" ? (
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <MaterialIcons
                      name="access-time"
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.detailText}>
                      Time: {"time" in item ? item.time : ""}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons
                      name={
                        "type" in item && item.type === "auto"
                          ? "gps-fixed"
                          : "touch-app"
                      }
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.detailText}>
                      {"type" in item && item.type === "auto"
                        ? "Auto-marked"
                        : "Manual"}
                    </Text>
                  </View>
                  {"type" in item &&
                    "distance" in item &&
                    item.type === "auto" &&
                    item.distance !== "-" && (
                      <View style={styles.detailRow}>
                        <MaterialIcons
                          name="place"
                          size={16}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.detailText}>
                          Distance: {item.distance}
                        </Text>
                      </View>
                    )}
                </View>
              ) : (
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <MaterialIcons
                      name="people"
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.detailText}>
                      {"course" in item ? item.course : ""}
                    </Text>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <MaterialIcons
                        name="check-circle"
                        size={16}
                        color={Colors.success}
                      />
                      <Text
                        style={[styles.statText, { color: Colors.success }]}
                      >
                        {"present" in item ? item.present : 0}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialIcons
                        name="access-time"
                        size={16}
                        color={Colors.warning}
                      />
                      <Text
                        style={[styles.statText, { color: Colors.warning }]}
                      >
                        {"late" in item ? item.late : 0}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialIcons
                        name="cancel"
                        size={16}
                        color={Colors.error}
                      />
                      <Text style={[styles.statText, { color: Colors.error }]}>
                        {"absent" in item ? item.absent : 0}
                      </Text>
                    </View>
                    <Text style={styles.totalText}>
                      / {"total" in item ? item.total : 0}
                    </Text>
                  </View>
                  <View style={styles.percentageBar}>
                    <View
                      style={[
                        styles.percentageFill,
                        {
                          width: `${"present" in item && "total" in item ? (item.present / item.total) * 100 : 0}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
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
});
