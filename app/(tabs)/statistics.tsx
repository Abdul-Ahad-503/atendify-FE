import { Colors, Spacing, Typography } from "@/constants/theme";
import { getUserRole, UserRole } from "@/utils/userRole";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy statistics data
const STUDENT_STATS = {
  overall: 84,
  monthly: [
    { month: "Sep", percentage: 82 },
    { month: "Oct", percentage: 85 },
    { month: "Nov", percentage: 88 },
    { month: "Dec", percentage: 83 },
    { month: "Jan", percentage: 84 },
  ],
  subjects: [
    { name: "Mobile App Development", present: 9, total: 10, percentage: 90 },
    { name: "Database Systems", present: 8, total: 10, percentage: 80 },
    { name: "Software Engineering", present: 9, total: 10, percentage: 90 },
    { name: "Web Technologies", present: 7, total: 10, percentage: 70 },
    { name: "Data Structures", present: 8, total: 10, percentage: 80 },
    { name: "Computer Networks", present: 9, total: 10, percentage: 90 },
  ],
};

const TEACHER_STATS = {
  overall: 87,
  monthly: [
    { month: "Sep", percentage: 85 },
    { month: "Oct", percentage: 86 },
    { month: "Nov", percentage: 89 },
    { month: "Dec", percentage: 86 },
    { month: "Jan", percentage: 87 },
  ],
  classes: [
    {
      name: "Mobile App Development",
      course: "BS-CS 6A",
      avgAttendance: 88,
      students: 50,
    },
    {
      name: "Web Technologies",
      course: "BS-CS 5B",
      avgAttendance: 89,
      students: 45,
    },
    {
      name: "Software Engineering",
      course: "BS-SE 4A",
      avgAttendance: 85,
      students: 40,
    },
    {
      name: "Mobile App Development",
      course: "BS-CS 6B",
      avgAttendance: 90,
      students: 48,
    },
    {
      name: "Web Technologies",
      course: "BS-CS 5A",
      avgAttendance: 86,
      students: 42,
    },
  ],
  lowAttendanceStudents: [
    {
      name: "Ali Hassan",
      id: "CS-2020-001",
      attendance: 65,
      subject: "Web Technologies",
    },
    {
      name: "Fatima Ahmed",
      id: "CS-2020-042",
      attendance: 68,
      subject: "Mobile App Development",
    },
    {
      name: "Usman Khan",
      id: "SE-2021-015",
      attendance: 70,
      subject: "Software Engineering",
    },
  ],
};

export default function StatisticsScreen() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const role = await getUserRole();
    setUserRole(role);
  };

  if (userRole === "teacher") {
    return <TeacherStatistics />;
  }

  return <StudentStatistics />;
}

function StudentStatistics() {
  const maxMonthly = Math.max(
    ...STUDENT_STATS.monthly.map((m) => m.percentage),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="bar-chart" size={32} color={Colors.primary} />
          <Text style={styles.headerTitle}>Statistics</Text>
        </View>

        {/* Overall Attendance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overall Attendance</Text>
          <View style={styles.overallContainer}>
            <View style={styles.circularProgress}>
              <Text style={styles.percentageValue}>
                {STUDENT_STATS.overall}%
              </Text>
              <Text style={styles.percentageLabel}>Total</Text>
            </View>
          </View>
          {STUDENT_STATS.overall < 75 && (
            <View style={styles.warningBox}>
              <MaterialIcons name="warning" size={20} color={Colors.warning} />
              <Text style={styles.warningText}>
                Your attendance is below 75%. Improve your attendance to avoid
                issues.
              </Text>
            </View>
          )}
        </View>

        {/* Monthly Trend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Trend</Text>
          <View style={styles.chartContainer}>
            {STUDENT_STATS.monthly.map((month, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${(month.percentage / maxMonthly) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{month.month}</Text>
                <Text style={styles.barValue}>{month.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Subject-wise Attendance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Subject-wise Attendance</Text>
          <View style={styles.subjectList}>
            {STUDENT_STATS.subjects.map((subject, index) => (
              <View key={index} style={styles.subjectItem}>
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <Text
                    style={[
                      styles.subjectPercentage,
                      {
                        color:
                          subject.percentage >= 75
                            ? Colors.success
                            : Colors.error,
                      },
                    ]}
                  >
                    {subject.percentage}%
                  </Text>
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectText}>
                    {subject.present} / {subject.total} classes
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${subject.percentage}%`,
                        backgroundColor:
                          subject.percentage >= 75
                            ? Colors.success
                            : Colors.error,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TeacherStatistics() {
  const maxMonthly = Math.max(
    ...TEACHER_STATS.monthly.map((m) => m.percentage),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="bar-chart" size={32} color={Colors.secondary} />
          <Text style={styles.headerTitle}>Reports & Statistics</Text>
        </View>

        {/* Overall Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Average Attendance</Text>
          <View style={styles.overallContainer}>
            <View
              style={[
                styles.circularProgress,
                { borderColor: Colors.secondary },
              ]}
            >
              <Text
                style={[styles.percentageValue, { color: Colors.secondary }]}
              >
                {TEACHER_STATS.overall}%
              </Text>
              <Text style={styles.percentageLabel}>Across All Classes</Text>
            </View>
          </View>
        </View>

        {/* Monthly Trend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Trend</Text>
          <View style={styles.chartContainer}>
            {TEACHER_STATS.monthly.map((month, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(month.percentage / maxMonthly) * 100}%`,
                        backgroundColor: Colors.secondary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{month.month}</Text>
                <Text style={styles.barValue}>{month.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Class-wise Performance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Class-wise Performance</Text>
          <View style={styles.subjectList}>
            {TEACHER_STATS.classes.map((classItem, index) => (
              <View key={index} style={styles.subjectItem}>
                <View style={styles.subjectHeader}>
                  <View>
                    <Text style={styles.subjectName}>{classItem.name}</Text>
                    <Text style={styles.subjectCourse}>{classItem.course}</Text>
                  </View>
                  <Text
                    style={[
                      styles.subjectPercentage,
                      { color: Colors.secondary },
                    ]}
                  >
                    {classItem.avgAttendance}%
                  </Text>
                </View>
                <View style={styles.subjectInfo}>
                  <MaterialIcons
                    name="people"
                    size={16}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.subjectText}>
                    {classItem.students} Students
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${classItem.avgAttendance}%`,
                        backgroundColor: Colors.secondary,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Low Attendance Alerts */}
        <View style={styles.card}>
          <View style={styles.alertHeader}>
            <MaterialIcons name="warning" size={24} color={Colors.warning} />
            <Text style={styles.cardTitle}>Low Attendance Alerts</Text>
          </View>
          <View style={styles.alertList}>
            {TEACHER_STATS.lowAttendanceStudents.map((student, index) => (
              <View key={index} style={styles.alertItem}>
                <View style={styles.alertIcon}>
                  <MaterialIcons
                    name="person"
                    size={24}
                    color={Colors.warning}
                  />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertName}>{student.name}</Text>
                  <Text style={styles.alertId}>{student.id}</Text>
                  <Text style={styles.alertSubject}>{student.subject}</Text>
                </View>
                <View style={styles.alertPercentage}>
                  <Text style={[styles.alertValue, { color: Colors.error }]}>
                    {student.attendance}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  overallContainer: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  circularProgress: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  percentageValue: {
    ...Typography.h1,
    fontSize: 40,
    color: Colors.primary,
    fontWeight: "700",
  },
  percentageLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: Colors.warning + "20",
    padding: Spacing.md,
    borderRadius: 8,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  warningText: {
    ...Typography.body,
    color: Colors.warning,
    flex: 1,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 200,
    paddingVertical: Spacing.lg,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
    gap: Spacing.xs,
  },
  barWrapper: {
    width: 40,
    height: 140,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
    minHeight: 20,
  },
  barLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  barValue: {
    ...Typography.small,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  subjectList: {
    gap: Spacing.lg,
  },
  subjectItem: {
    gap: Spacing.sm,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  subjectName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  subjectCourse: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  subjectPercentage: {
    ...Typography.h3,
    fontWeight: "700",
  },
  subjectInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  subjectText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  alertList: {
    gap: Spacing.md,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    gap: Spacing.md,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.warning + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  alertInfo: {
    flex: 1,
  },
  alertName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  alertId: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  alertSubject: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  alertPercentage: {
    alignItems: "center",
  },
  alertValue: {
    ...Typography.h2,
    fontWeight: "700",
  },
});
