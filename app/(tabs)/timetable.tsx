import { Colors, Spacing, Typography } from "@/constants/theme";
import { timetableApi, TimetableEntry, WeeklyTimetable } from "@/utils/api";
import { STORAGE_KEYS } from "@/utils/api/config";
import { getUserRole, UserRole } from "@/utils/userRole";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

// Helper function to format time from HH:MM to HH:MM AM/PM
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export default function TimetableScreen() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedDay, setSelectedDay] =
    useState<(typeof DAYS)[number]>("Monday");
  const [timetable, setTimetable] = useState<WeeklyTimetable | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const role = await getUserRole();
      setUserRole(role);

      // Fetch timetable based on role
      const timetableData =
        role === "teacher"
          ? await timetableApi.getTeacherTimetable()
          : await (async () => {
              const userRaw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
              const user = userRaw ? JSON.parse(userRaw) : null;

              const payload = {
                program:
                  user?.programId || user?.program || user?.programCode || "",
                semester: Number(user?.semester || 0),
                section: String(user?.section || "").toUpperCase(),
                termId: user?.termId || user?.term,
              };

              if (!payload.program || !payload.semester || !payload.section) {
                throw new Error(
                  "Student profile is incomplete. Program, semester, and section are required.",
                );
              }

              // Previous endpoint (kept commented for reference):
              // return timetableApi.getStudentTimetable(payload.termId);

              return timetableApi.getStudentTimetableByCohort(payload);
            })();

      setTimetable(timetableData);
    } catch (error: any) {
      console.error("Failed to load timetable:", error);
      Alert.alert("Error", error.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const classes = timetable?.[selectedDay] || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="schedule" size={32} color={Colors.primary} />
        <Text style={styles.headerTitle}>Timetable</Text>
      </View>

      {/* Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
      >
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.dayButtonActive,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDay === day && styles.dayButtonTextActive,
              ]}
            >
              {day.substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Classes List */}
      <ScrollView style={styles.content}>
        <Text style={styles.dayTitle}>{selectedDay}</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading timetable...</Text>
          </View>
        ) : classes.length > 0 ? (
          <View style={styles.classList}>
            {classes.map((classItem: TimetableEntry, index: number) => {
              const timeDisplay = `${formatTime(classItem.timeStart)} - ${formatTime(classItem.timeEnd)}`;

              return (
                <View key={classItem.id} style={styles.classCard}>
                  <View style={styles.classHeader}>
                    <View style={styles.classStatus}>
                      {getStatusIcon(classItem, index)}
                    </View>
                    <View style={styles.classInfo}>
                      <Text style={styles.className}>
                        {classItem.courseName}
                      </Text>
                      <Text style={styles.courseCode}>
                        {classItem.courseCode}
                      </Text>
                      {userRole === "student" ? (
                        <>
                          <View style={styles.classDetail}>
                            <MaterialIcons
                              name="person"
                              size={16}
                              color={Colors.textSecondary}
                            />
                            <Text style={styles.classDetailText}>
                              {classItem.teacherName || "N/A"}
                            </Text>
                          </View>
                          <View style={styles.classDetail}>
                            <MaterialIcons
                              name="access-time"
                              size={16}
                              color={Colors.textSecondary}
                            />
                            <Text style={styles.classDetailText}>
                              {timeDisplay}
                            </Text>
                          </View>
                          <View style={styles.classDetail}>
                            <MaterialIcons
                              name="room"
                              size={16}
                              color={Colors.textSecondary}
                            />
                            <Text style={styles.classDetailText}>
                              {classItem.roomNo}
                            </Text>
                          </View>
                        </>
                      ) : (
                        <>
                          <View style={styles.classDetail}>
                            <MaterialIcons
                              name="people"
                              size={16}
                              color={Colors.textSecondary}
                            />
                            <Text style={styles.classDetailText}>
                              {classItem.programCode} {classItem.semester}
                              {classItem.section}
                            </Text>
                          </View>
                          <View style={styles.classDetail}>
                            <MaterialIcons
                              name="access-time"
                              size={16}
                              color={Colors.textSecondary}
                            />
                            <Text style={styles.classDetailText}>
                              {timeDisplay}
                            </Text>
                          </View>
                          <View style={styles.classDetail}>
                            <MaterialIcons
                              name="room"
                              size={16}
                              color={Colors.textSecondary}
                            />
                            <Text style={styles.classDetailText}>
                              {classItem.roomNo}
                            </Text>
                          </View>
                          <View style={styles.classDetail}>
                            <MaterialIcons
                              name="group"
                              size={16}
                              color={Colors.textSecondary}
                            />
                            <Text style={styles.classDetailText}>
                              {classItem.enrolledStudents || 0} Students
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="event-busy"
              size={64}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyText}>No classes scheduled</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusIcon(classItem: any, index: number) {
  // First class is "now", second is "completed", rest are "upcoming"
  if (index === 0) {
    return (
      <View style={[styles.statusBadge, { backgroundColor: Colors.primary }]}>
        <Text style={styles.statusText}>NOW</Text>
      </View>
    );
  } else if (index === 1) {
    return (
      <View style={[styles.statusBadge, { backgroundColor: Colors.success }]}>
        <MaterialIcons name="check" size={16} color={Colors.surface} />
      </View>
    );
  } else {
    return (
      <View style={[styles.statusBadge, { backgroundColor: Colors.border }]}>
        <MaterialIcons name="schedule" size={16} color={Colors.textSecondary} />
      </View>
    );
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
  daySelector: {
    flexGrow: 0,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayButton: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    marginHorizontal: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
  },
  dayButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  dayButtonTextActive: {
    color: Colors.surface,
  },
  content: {
    flex: 1,
  },
  dayTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    padding: Spacing.lg,
  },
  classList: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  classCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  classStatus: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    ...Typography.small,
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 10,
  },
  classInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  className: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  courseCode: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  classDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  classDetailText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    marginTop: Spacing.xl * 2,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    marginTop: Spacing.xl * 2,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});
