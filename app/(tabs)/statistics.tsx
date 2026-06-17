import { Colors, Spacing, Typography } from "@/constants/theme";
import {
  attendanceApi,
  authApi,
  dashboardApi,
  StudentDashboard,
  TeacherDashboard,
  User,
} from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatisticsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, []),
  );

  const loadUser = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  if (user.role === "teacher") return <TeacherStatistics />;
  return <StudentStatistics />;
}

function StudentStatistics() {
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      const data = await dashboardApi.getStudentDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Error loading student stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const overview = dashboard?.attendanceOverview || [];
  const stats = dashboard?.stats;
  const avg = stats?.averageAttendance || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        <View style={styles.header}>
          <MaterialIcons name="bar-chart" size={28} color={Colors.primary} />
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>

        {/* Overall Attendance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overall Attendance</Text>
          <View style={styles.overallContainer}>
            <View style={[styles.circularProgress, { borderColor: avg >= 75 ? Colors.success : avg >= 50 ? Colors.warning : Colors.error }]}>
              <Text style={[styles.percentageValue, { color: avg >= 75 ? Colors.success : avg >= 50 ? Colors.warning : Colors.error }]}>
                {avg}%
              </Text>
              <Text style={styles.percentageLabel}>Average</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: Colors.primary }]}>{stats?.totalCourses || 0}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: Colors.success }]}>{stats?.presentToday || 0}</Text>
              <Text style={styles.statLabel}>Present Today</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: Colors.error }]}>{stats?.criticalCourses || 0}</Text>
              <Text style={styles.statLabel}>Critical</Text>
            </View>
          </View>
          {avg < 75 && (
            <View style={styles.warningBox}>
              <MaterialIcons name="warning" size={20} color={Colors.warning} />
              <Text style={styles.warningText}>Your attendance is below 75%.</Text>
            </View>
          )}
        </View>

        {/* Course-wise Attendance */}
        {overview.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Course Attendance</Text>
            {overview.map((item: any) => {
              const pct = item.percentage || 0;
              const isCritical = pct < 75;
              const courseCode = item.course?.courseCode || item.courseCode || "N/A";
              const courseName = item.course?.courseName || item.courseName || "Course";
              const isOpen = expandedCourse === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.courseBlock}
                  onPress={() => setExpandedCourse(isOpen ? null : item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.courseHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseName}>{courseCode}</Text>
                      <Text style={styles.courseFullName}>{courseName}</Text>
                    </View>
                    <Text style={[styles.coursePct, { color: isCritical ? Colors.error : Colors.success }]}>
                      {pct}%
                    </Text>
                    <MaterialIcons name={isOpen ? "expand-less" : "expand-more"} size={20} color={Colors.textSecondary} />
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: isCritical ? Colors.error : Colors.success }]} />
                  </View>
                  {isOpen && (
                    <View style={styles.courseDetail}>
                      <Text style={styles.detailText}>{item.classesAttended || 0} / {item.totalClasses || 0} classes attended</Text>
                      <Text style={styles.detailText}>Status: {item.status || (isCritical ? "Critical" : "Good")}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {overview.length === 0 && (
          <View style={styles.card}>
            <View style={styles.emptyState}>
              <MaterialIcons name="bar-chart" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>No Data Yet</Text>
              <Text style={styles.emptySub}>Attendance stats will appear once you start marking attendance.</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TeacherStatistics() {
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      const data = await dashboardApi.getTeacherDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Error loading teacher stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  const stats = dashboard?.stats;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.secondary]} />
        }
      >
        <View style={styles.header}>
          <MaterialIcons name="bar-chart" size={28} color={Colors.secondary} />
          <Text style={styles.headerTitle}>Reports & Statistics</Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: Colors.secondary + "20" }]}>
                <MaterialIcons name="school" size={28} color={Colors.secondary} />
              </View>
              <Text style={styles.metricValue}>{stats?.totalCourses || 0}</Text>
              <Text style={styles.metricLabel}>Courses</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: Colors.primary + "20" }]}>
                <MaterialIcons name="people" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.metricValue}>{stats?.totalStudents || 0}</Text>
              <Text style={styles.metricLabel}>Students</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: Colors.success + "20" }]}>
                <MaterialIcons name="check-circle" size={28} color={Colors.success} />
              </View>
              <Text style={styles.metricValue}>{stats?.avgAttendance || 0}%</Text>
              <Text style={styles.metricLabel}>Avg Attendance</Text>
            </View>
          </View>
        </View>

        {/* Today's Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today</Text>
          <View style={styles.todayRow}>
            <View style={styles.todayBox}>
              <MaterialIcons name="class" size={24} color={Colors.secondary} />
              <Text style={styles.todayValue}>{stats?.classesToday || 0}</Text>
              <Text style={styles.todayLabel}>Classes</Text>
            </View>
            <View style={styles.todayBox}>
              <MaterialIcons name="check-circle" size={24} color={Colors.success} />
              <Text style={styles.todayValue}>{stats?.totalPresentToday || 0}</Text>
              <Text style={styles.todayLabel}>Present</Text>
            </View>
            <View style={styles.todayBox}>
              <MaterialIcons name="fiber-manual-record" size={24} color={Colors.error} />
              <Text style={styles.todayValue}>{stats?.activeSessionsCount || 0}</Text>
              <Text style={styles.todayLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* Active Sessions Detail */}
        {dashboard?.activeSessions && dashboard.activeSessions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Active Sessions</Text>
            {dashboard.activeSessions.map((s: any) => (
              <View key={s.id} style={styles.sessionItem}>
                <View style={styles.sessionDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionName}>{s.course?.courseName || "Class"}</Text>
                  <Text style={styles.sessionMeta}>
                    {s.totalPresent || 0}/{s.totalStudentsEnrolled || 0} present
                    {s.section ? ` • ${s.section}` : ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {(!dashboard?.activeSessions || dashboard.activeSessions.length === 0) && (
          <View style={styles.card}>
            <View style={styles.emptyState}>
              <MaterialIcons name="bar-chart" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>No Data Yet</Text>
              <Text style={styles.emptySub}>Start an attendance session to see live statistics.</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  headerTitle: { ...Typography.h2, color: Colors.textPrimary },
  card: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { ...Typography.h3, color: Colors.textPrimary, fontWeight: "600", marginBottom: Spacing.md },
  overallContainer: { alignItems: "center", paddingVertical: Spacing.md },
  circularProgress: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  percentageValue: { fontSize: 36, color: Colors.primary, fontWeight: "700" },
  percentageLabel: { ...Typography.small, color: Colors.textSecondary, marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statBox: { alignItems: "center", gap: 4 },
  statNumber: { ...Typography.h2, fontWeight: "700" },
  statLabel: { ...Typography.small, color: Colors.textSecondary },
  warningBox: {
    flexDirection: "row",
    backgroundColor: Colors.warning + "20",
    padding: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
    marginTop: Spacing.md,
    alignItems: "center",
  },
  warningText: { ...Typography.body, color: Colors.warning, flex: 1 },
  courseBlock: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  courseHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  courseName: { ...Typography.body, color: Colors.textPrimary, fontWeight: "600" },
  courseFullName: { ...Typography.small, color: Colors.textSecondary },
  coursePct: { ...Typography.h3, fontWeight: "700", minWidth: 45, textAlign: "right" },
  progressBar: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: "hidden", marginTop: Spacing.sm },
  progressFill: { height: "100%", borderRadius: 3 },
  courseDetail: { marginTop: Spacing.sm, gap: 2 },
  detailText: { ...Typography.small, color: Colors.textSecondary },
  metricsGrid: { flexDirection: "row", gap: Spacing.md },
  metricCard: { flex: 1, alignItems: "center", gap: Spacing.sm },
  metricIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  metricValue: { ...Typography.h2, color: Colors.textPrimary, fontWeight: "700" },
  metricLabel: { ...Typography.small, color: Colors.textSecondary },
  todayRow: { flexDirection: "row", justifyContent: "space-around" },
  todayBox: { alignItems: "center", gap: Spacing.xs },
  todayValue: { ...Typography.h2, color: Colors.textPrimary, fontWeight: "700" },
  todayLabel: { ...Typography.small, color: Colors.textSecondary },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sessionDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.error },
  sessionName: { ...Typography.body, color: Colors.textPrimary, fontWeight: "600" },
  sessionMeta: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  emptyState: { alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.lg },
  emptyTitle: { ...Typography.h3, color: Colors.textPrimary },
  emptySub: { ...Typography.body, color: Colors.textSecondary, textAlign: "center" },
});
