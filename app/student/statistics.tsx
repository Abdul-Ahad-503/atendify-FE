import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { attendanceApi } from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
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

export default function AttendanceStatisticsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const offeringId = getParam(params.offeringId) || "";
  const courseName = getParam(params.courseName) || "";
  const courseCode = getParam(params.courseCode) || "";

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (offeringId) {
      fetchStats();
    } else {
      Alert.alert("Error", "Course information is missing");
      router.back();
    }
  }, [offeringId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await attendanceApi.getAttendanceStats(offeringId);

      // Get current student's stats (first in array)
      if (data.stats && data.stats.length > 0) {
        setStats(data.stats[0]);
      } else {
        Alert.alert("Error", "No statistics found");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      Alert.alert("Error", "Failed to load attendance statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centerContent}>
          <MaterialIcons name="error-outline" size={64} color={Colors.border} />
          <Text style={styles.errorTitle}>Unable to Load Statistics</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchStats}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const attendancePercentage = stats.attendancePercentage || 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Attendance Statistics</Text>
          <Text style={styles.courseInfo}>
            {courseCode} - {courseName}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Attendance Percentage Circle */}
        <View style={styles.percentageSection}>
          <View style={styles.percentageCircle}>
            <Text style={styles.percentageValue}>
              {attendancePercentage.toFixed(1)}%
            </Text>
            <Text style={styles.percentageLabel}>Attendance</Text>
          </View>
          <View
            style={[
              styles.percentageBar,
              {
                backgroundColor:
                  attendancePercentage >= 75
                    ? "#D1FAE5"
                    : attendancePercentage >= 50
                      ? "#FEF3C7"
                      : "#FEE2E2",
              },
            ]}
          >
            <View
              style={[
                styles.percentageBarFill,
                {
                  width: `${attendancePercentage}%`,
                  backgroundColor:
                    attendancePercentage >= 75
                      ? "#10B981"
                      : attendancePercentage >= 50
                        ? "#F59E0B"
                        : "#EF4444",
                },
              ]}
            />
          </View>
        </View>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="calendar" size={28} color="#6366F1" />
            <Text style={styles.statValue}>{stats.totalClasses}</Text>
            <Text style={styles.statLabel}>Total Classes</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={28} color="#10B981" />
            <Text style={styles.statValue}>{stats.presentCount}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="cancel" size={28} color="#EF4444" />
            <Text style={styles.statValue}>{stats.absentCount}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="schedule" size={28} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.lateCount || 0}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
        </View>

        {/* Average Distance Card */}
        <View style={styles.distanceCard}>
          <View style={styles.distanceHeader}>
            <MaterialIcons name="distance" size={24} color={Colors.secondary} />
            <View>
              <Text style={styles.distanceLabel}>Average Distance</Text>
              <Text style={styles.distanceValue}>
                {stats.avgDistance?.toFixed(2) || "0"}m
              </Text>
            </View>
          </View>
          <Text style={styles.distanceDescription}>
            Average distance from class location when you marked attendance
          </Text>
        </View>

        {/* Breakdown Card */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Attendance Breakdown</Text>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownItemContent}>
              <Text style={styles.breakdownLabel}>Present</Text>
              <Text style={styles.breakdownCount}>
                {stats.presentCount} / {stats.totalClasses}
              </Text>
            </View>
            <View
              style={[
                styles.breakdownPercentageBar,
                {
                  flex: stats.presentCount / stats.totalClasses,
                  backgroundColor: "#10B981",
                },
              ]}
            />
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownItemContent}>
              <Text style={styles.breakdownLabel}>Absent</Text>
              <Text style={styles.breakdownCount}>
                {stats.absentCount} / {stats.totalClasses}
              </Text>
            </View>
            <View
              style={[
                styles.breakdownPercentageBar,
                {
                  flex: stats.absentCount / stats.totalClasses,
                  backgroundColor: "#EF4444",
                },
              ]}
            />
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownItemContent}>
              <Text style={styles.breakdownLabel}>Late</Text>
              <Text style={styles.breakdownCount}>
                {stats.lateCount || 0} / {stats.totalClasses}
              </Text>
            </View>
            <View
              style={[
                styles.breakdownPercentageBar,
                {
                  flex: (stats.lateCount || 0) / stats.totalClasses,
                  backgroundColor: "#F59E0B",
                },
              ]}
            />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={20} color={Colors.secondary} />
          <Text style={styles.infoText}>
            Statistics are automatically updated after each attendance marking
            session.
          </Text>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  courseInfo: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
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
  retryButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  percentageSection: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  percentageCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.secondary + "15",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  percentageValue: {
    ...Typography.h1,
    color: Colors.secondary,
    fontWeight: "700",
  },
  percentageLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  percentageBar: {
    width: "100%",
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  percentageBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  statLabel: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  distanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  distanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  distanceLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  distanceValue: {
    ...Typography.h2,
    color: Colors.secondary,
    fontWeight: "700",
    marginTop: Spacing.xs,
  },
  distanceDescription: {
    ...Typography.small,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  breakdownCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  breakdownTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  breakdownItem: {
    gap: Spacing.sm,
  },
  breakdownItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  breakdownLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  breakdownCount: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  breakdownPercentageBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
  },
  infoCard: {
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
});
