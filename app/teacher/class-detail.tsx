import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { attendanceApi } from "@/utils/api";
import {
  getAccurateLocation,
  requestLocationPermission,
} from "@/utils/permissions";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const dayName = (value?: string) => {
  const index = Number(value);
  if (Number.isNaN(index)) return "";
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return days[index] ?? "";
};

export default function ClassDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const courseName = getParam(params.courseName) || "Class";
  const courseCode = getParam(params.courseCode) || "";
  const subjectName = getParam(params.subjectName) || "";
  const subjectCode = getParam(params.subjectCode) || "";
  const startTime = getParam(params.startTime) || "";
  const endTime = getParam(params.endTime) || "";
  const roomNumber = getParam(params.roomNumber) || "";
  const semester = getParam(params.semester) || "";
  const programCode = getParam(params.programCode) || "";
  const section = getParam(params.section) || "";
  const dayOfWeek = getParam(params.dayOfWeek) || "";

  const classId = getParam(params.classId) || "";
  const courseId = getParam(params.courseId) || "";

  const scheduleText = `${formatTime(startTime)} - ${formatTime(endTime)}`;
  const dayLabel = dayName(dayOfWeek);

  const handleMarkAttendance = async () => {
    if (!classId || !courseId) {
      Alert.alert(
        "Missing data",
        "Class or course details are missing. Please go back and try again.",
      );
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    try {
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) {
        Alert.alert(
          "Location Required",
          "Please allow location access to mark attendance.",
        );
        return;
      }

      // const location = await getCurrentLocation();
      const location = await getAccurateLocation();

      await attendanceApi.markClassAttendance({
        classId,
        courseId,
        details: {
          courseName,
          courseCode,
          subjectName,
          subjectCode,
          roomNumber,
          programCode,
          section,
          semester,
          dayOfWeek,
          startTime,
          endTime,
        },
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        },
      });

      Alert.alert(
        "Attendance sent",
        "Attendance data has been sent to the server.",
      );
    } catch (error) {
      console.error("Error marking attendance:", error);
      Alert.alert("Error", "Unable to send attendance data. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Class Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleCard}>
          <View style={styles.titleRow}>
            <View style={styles.iconBadge}>
              <MaterialIcons name="class" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.titleTextWrap}>
              <Text style={styles.courseName}>{courseName}</Text>
              {!!courseCode && (
                <Text style={styles.courseCode}>{courseCode}</Text>
              )}
            </View>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons
              name="access-time"
              size={18}
              color={Colors.textSecondary}
            />
            <Text style={styles.metaText}>
              {dayLabel ? `${dayLabel} • ${scheduleText}` : scheduleText}
            </Text>
          </View>
          {!!roomNumber && (
            <View style={styles.metaRow}>
              <MaterialIcons
                name="room"
                size={18}
                color={Colors.textSecondary}
              />
              <Text style={styles.metaText}>Room {roomNumber}</Text>
            </View>
          )}
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Class Information</Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Program</Text>
              <Text style={styles.detailValue}>{programCode || "-"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Section</Text>
              <Text style={styles.detailValue}>{section || "-"}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Semester</Text>
              <Text style={styles.detailValue}>{semester || "-"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Subject</Text>
          <View style={styles.subjectRow}>
            <MaterialIcons
              name="menu-book"
              size={20}
              color={Colors.secondary}
            />
            <View>
              <Text style={styles.subjectTitle}>
                {subjectName || courseName}
              </Text>
              {!!subjectCode && (
                <Text style={styles.subjectCode}>{subjectCode}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Attendance</Text>
          <Text style={styles.detailHint}>
            Use this action when the class is in session to record attendance.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleMarkAttendance}
            disabled={submitting}
          >
            <MaterialIcons
              name="check-circle"
              size={22}
              color={Colors.surface}
            />
            <Text style={styles.primaryButtonText}>
              {submitting ? "Sending..." : "Mark Attendance"}
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
  },
  titleCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary + "20",
  },
  titleTextWrap: {
    flex: 1,
  },
  courseName: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  courseCode: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  metaText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  detailGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  detailItem: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
  },
  detailLabel: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  detailValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  subjectTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  subjectCode: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  detailHint: {
    ...Typography.small,
    color: Colors.textSecondary,
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
});
