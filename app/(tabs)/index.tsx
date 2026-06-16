import { Colors, Spacing, Typography } from "@/constants/theme";
import {
  attendanceApi,
  authApi,
  dashboardApi,
  StudentDashboard as StudentDashboardType,
  TeacherDashboard as TeacherDashboardType,
  User,
} from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Atendify</Text>
          <Text style={styles.subtitle}>Location-Based Attendance System</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (user.role === "student") {
    return <StudentDashboard user={user} />;
  } else if (user.role === "teacher") {
    return <TeacherDashboard user={user} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Atendify</Text>
        <Text style={styles.subtitle}>Location-Based Attendance System</Text>
      </View>
    </SafeAreaView>
  );
}

// Student Dashboard Component
function StudentDashboard({ user }: { user: User }) {
  const [dashboardData, setDashboardData] =
    useState<StudentDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardApi.getStudentDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatTime = (time: string) => {
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user.name.split(" ")[0]}!
            </Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
          <View style={styles.roleBadge}>
            <MaterialIcons name="school" size={20} color={Colors.primary} />
            <Text style={styles.roleBadgeText}>Student</Text>
          </View>
        </View>

        {/* Today's Classes */}
        {dashboardData?.todayClasses &&
        dashboardData.todayClasses.length > 0 ? (
          dashboardData.todayClasses.map((classItem, index) => (
            <View key={classItem.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons
                  name="schedule"
                  size={24}
                  color={Colors.primary}
                />
                <Text style={styles.cardTitle}>
                  {index === 0 ? "Current/Next Class" : "Upcoming Class"}
                </Text>
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.className}>
                  {typeof classItem.course === "object"
                    ? classItem.course.courseName
                    : "Loading..."}
                </Text>
                <View style={styles.classDetails}>
                  <View style={styles.classDetailItem}>
                    <MaterialIcons
                      name="access-time"
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.classDetailText}>
                      {formatTime(classItem.startTime)} -{" "}
                      {formatTime(classItem.endTime)}
                    </Text>
                  </View>
                  <View style={styles.classDetailItem}>
                    <MaterialIcons
                      name="person"
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.classDetailText}>
                      {typeof classItem.teacher === "object"
                        ? classItem.teacher.name
                        : "Teacher"}
                    </Text>
                  </View>
                  <View style={styles.classDetailItem}>
                    <MaterialIcons
                      name="room"
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.classDetailText}>
                      {classItem.room.roomNumber}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  backgroundColor: Colors.primary,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 12,
                }}
                onPress={async () => {
                  const meetingId = classItem.id;
                  try {
                    const result =
                      await attendanceApi.checkActiveSession(meetingId);
                    if (result.isActive) {
                      router.push({
                        pathname: "/student/mark-attendance",
                        params: { meetingId },
                      });
                    } else {
                      Alert.alert(
                        "No Active Session",
                        "Teacher has not started attendance yet.",
                      );
                    }
                  } catch {
                    Alert.alert("Error", "Could not check session status.");
                  }
                }}
              >
                <MaterialIcons name="check-circle" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Check Attendance
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.card}>
            <Text style={styles.noDataText}>
              No classes scheduled for today
            </Text>
          </View>
        )}

        {/* Attendance Summary */}
        {dashboardData?.stats && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="assignment"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.cardTitle}>Today's Stats</Text>
            </View>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: Colors.success + "20" },
                  ]}
                >
                  <MaterialIcons
                    name="check"
                    size={32}
                    color={Colors.success}
                  />
                </View>
                <Text style={styles.summaryValue}>
                  {dashboardData.stats.presentToday}
                </Text>
                <Text style={styles.summaryLabel}>Present Today</Text>
              </View>
              <View style={styles.summaryItem}>
                <View
                  style={[
                    styles.summaryIcon,
                    { backgroundColor: Colors.primary + "20" },
                  ]}
                >
                  <MaterialIcons
                    name="school"
                    size={32}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.summaryValue}>
                  {dashboardData.stats.totalCourses}
                </Text>
                <Text style={styles.summaryLabel}>Total Courses</Text>
              </View>
              <View style={styles.summaryItem}>
                <View
                  style={[
                    styles.summaryIcon,
                    {
                      backgroundColor:
                        dashboardData.stats.criticalCourses > 0
                          ? Colors.error + "20"
                          : Colors.success + "20",
                    },
                  ]}
                >
                  <MaterialIcons
                    name="warning"
                    size={32}
                    color={
                      dashboardData.stats.criticalCourses > 0
                        ? Colors.error
                        : Colors.success
                    }
                  />
                </View>
                <Text style={styles.summaryValue}>
                  {dashboardData.stats.criticalCourses}
                </Text>
                <Text style={styles.summaryLabel}>Critical</Text>
              </View>
            </View>
          </View>
        )}

        {/* Overall Attendance */}
        {dashboardData?.stats && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="pie-chart"
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.cardTitle}>Overall Attendance</Text>
            </View>
            <View style={styles.percentageContainer}>
              <Text style={styles.percentageValue}>
                {dashboardData.stats.averageAttendance.toFixed(0)}%
              </Text>
              <Text style={styles.percentageLabel}>Average Attendance</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${dashboardData.stats.averageAttendance}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Course-wise Attendance */}
        {dashboardData?.attendanceOverview &&
          dashboardData.attendanceOverview.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="list" size={24} color={Colors.primary} />
                <Text style={styles.cardTitle}>Course Attendance</Text>
              </View>
              {dashboardData.attendanceOverview.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.courseItem}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>
                      {typeof item.course === "object"
                        ? item.course.courseCode
                        : "Course"}
                    </Text>
                    <Text style={styles.courseAttendance}>
                      {item.classesAttended}/{item.totalClasses} classes
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.coursePercentage,
                      {
                        color:
                          item.status === "critical"
                            ? Colors.error
                            : item.status === "warning"
                              ? Colors.warning
                              : Colors.success,
                      },
                    ]}
                  >
                    {item.percentage.toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          )}

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/timetable")}
          >
            <MaterialIcons name="schedule" size={32} color={Colors.primary} />
            <Text style={styles.actionText}>Timetable</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/statistics")}
          >
            <MaterialIcons name="bar-chart" size={32} color={Colors.primary} />
            <Text style={styles.actionText}>Statistics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Teacher Dashboard Component
function TeacherDashboard({ user }: { user: User }) {
  const [dashboardData, setDashboardData] =
    useState<TeacherDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const pollingRef = useRef<any>(null);
  const notifiedSessions = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Start polling when dashboard loads
    pollingRef.current = setInterval(async () => {
      if (!dashboardData?.todayClasses) return;

      for (const classItem of dashboardData.todayClasses) {
        const meetingId = classItem.id;
        if (!meetingId || notifiedSessions.current.has(meetingId)) continue;

        try {
          const result = await attendanceApi.checkActiveSession(meetingId);
          if (result.isActive) {
            notifiedSessions.current.add(meetingId); // don't alert twice
            Alert.alert(
              "📋 Attendance Started",
              `Mark attendance for ${
                typeof classItem.course === "object"
                  ? classItem.course.courseName
                  : "your class"
              }`,
              [
                { text: "Later", style: "cancel" },
                {
                  text: "Mark Now",
                  onPress: () =>
                    router.push({
                      pathname: "/student/mark-attendance",
                      params: { meetingId },
                    }),
                },
              ],
            );
          }
        } catch (error) {
          // silently ignore polling errors
        }
      }
    }, 10000); // poll every 10 seconds

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [dashboardData]); // restart when dashboard data loads

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardApi.getTeacherDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatTime = (time: string) => {
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  const handleCheckAttendance = async (meetingId: string) => {
    try {
      const result = await attendanceApi.checkActiveSession(meetingId);

      if (result.isActive) {
        router.push({
          pathname: "/student/mark-attendance",
          params: { meetingId },
        });
      } else {
        Alert.alert(
          "No Active Session",
          "Teacher has not started attendance yet.",
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not check session status.");
    }
  };
  const handleOpenClassDetails = (
    classItem: TeacherDashboardType["todayClasses"][number],
  ) => {
    const course =
      typeof classItem.course === "object" ? classItem.course : null;
    const subject =
      typeof classItem.subject === "object" ? classItem.subject : null;

    router.push({
      pathname: "/teacher/class-detail",
      params: {
        classId: classItem.id,
        courseId: course?.id ?? "",
        courseName: course?.courseName ?? "Class",
        courseCode: course?.courseCode ?? "",
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        roomNumber: classItem.room?.roomNumber ?? "",
        semester: String(course?.semester ?? ""),
        programCode: classItem.programCode ?? "",
        section: classItem.section ?? "",
        dayOfWeek: String(classItem.dayOfWeek ?? ""),
        subjectName: subject?.subjectName ?? "",
        subjectCode: subject?.subjectCode ?? "",
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.secondary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user.name.split(" ")[0]}!
            </Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: Colors.secondary + "20" },
            ]}
          >
            <MaterialIcons name="school" size={20} color={Colors.secondary} />
            <Text style={[styles.roleBadgeText, { color: Colors.secondary }]}>
              Teacher
            </Text>
          </View>
        </View>

        {/* Active Sessions */}
        {dashboardData?.activeSessions &&
          dashboardData.activeSessions.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons
                  name="class"
                  size={24}
                  color={Colors.secondary}
                />
                <Text style={styles.cardTitle}>Active Session</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
              {dashboardData.activeSessions.map((session) => (
                <View key={session.id} style={styles.classInfo}>
                  <Text style={styles.className}>
                    {typeof session.course === "object"
                      ? session.course.courseName
                      : "Class"}
                  </Text>
                  <View style={styles.classDetails}>
                    <View style={styles.classDetailItem}>
                      <MaterialIcons
                        name="access-time"
                        size={16}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.classDetailText}>
                        Started at{" "}
                        {new Date(session.startTime).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </Text>
                    </View>
                    <View style={styles.classDetailItem}>
                      <MaterialIcons
                        name="room"
                        size={16}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.classDetailText}>
                        {session.room.roomNumber}
                      </Text>
                    </View>
                    <View style={styles.classDetailItem}>
                      <MaterialIcons
                        name="people"
                        size={16}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.classDetailText}>
                        {session.totalPresent || 0}/
                        {session.totalStudentsEnrolled} Present
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

        {/* Today's Classes */}
        {dashboardData?.todayClasses &&
          dashboardData.todayClasses.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons
                  name="today"
                  size={24}
                  color={Colors.secondary}
                />
                <Text style={styles.cardTitle}>Today's Classes</Text>
              </View>
              <View style={styles.classList}>
                {dashboardData.todayClasses.map((classItem) => (
                  <View key={classItem.id} style={styles.classListItem}>
                    <View style={styles.classTime}>
                      <Text style={styles.classTimeText}>
                        {formatTime(classItem.startTime)}
                      </Text>
                      <View style={styles.classTimeLine} />
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.classCard,
                        { borderLeftColor: Colors.primary },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleOpenClassDetails(classItem)}
                    >
                      <Text style={styles.classCardTitle}>
                        {typeof classItem.course === "object"
                          ? classItem.course.courseName
                          : "Class"}
                      </Text>
                      <Text style={styles.classCardInfo}>
                        Location: {classItem.room.roomNumber}
                      </Text>
                      <Text style={styles.classCardInfo}>
                        Semester: {classItem.course.semester}
                      </Text>
                      <Text style={styles.classCardInfo}>
                        Class: {classItem.programCode} - {classItem.section}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Quick Stats */}
        {dashboardData?.stats && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="assessment"
                size={24}
                color={Colors.secondary}
              />
              <Text style={styles.cardTitle}>Quick Stats</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {dashboardData.stats.totalCourses}
                </Text>
                <Text style={styles.statLabel}>Courses</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {dashboardData.stats.totalStudents}
                </Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {dashboardData.stats.classesToday}
                </Text>
                <Text style={styles.statLabel}>Classes Today</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/timetable")}
          >
            <MaterialIcons name="class" size={32} color={Colors.secondary} />
            <Text style={styles.actionText}>My Classes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/statistics")}
          >
            <MaterialIcons
              name="bar-chart"
              size={32}
              color={Colors.secondary}
            />
            <Text style={styles.actionText}>Reports</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  date: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
  },
  roleBadgeText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: "600",
  },
  card: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    flex: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
  },
  liveText: {
    ...Typography.small,
    color: Colors.error,
    fontWeight: "700",
    fontSize: 10,
  },
  classInfo: {
    gap: Spacing.md,
  },
  className: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  classDetails: {
    gap: Spacing.sm,
  },
  classDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  classDetailText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.md,
  },
  summaryItem: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  summaryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryValue: {
    ...Typography.h1,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  summaryLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  percentageContainer: {
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  percentageValue: {
    ...Typography.h1,
    fontSize: 48,
    color: Colors.primary,
    fontWeight: "700",
  },
  percentageLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  courseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  courseAttendance: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  coursePercentage: {
    ...Typography.h3,
    fontWeight: "700",
  },
  actionsGrid: {
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 12,
    alignItems: "center",
    gap: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  classList: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  classListItem: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  classTime: {
    alignItems: "center",
    width: 80,
  },
  classTimeText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  classTimeLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: Spacing.sm,
  },
  classCard: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  classCardTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  classCardInfo: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing.md,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    ...Typography.h1,
    color: Colors.textPrimary,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  noDataText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
    padding: Spacing.lg,
  },
});
