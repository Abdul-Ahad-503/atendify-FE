import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export interface ActiveSessionModalProps {
  visible: boolean;
  session: {
    meetingId: string;
    courseName: string;
    courseCode: string;
    roomNo: string;
    timeStart: string;
    timeEnd: string;
  } | null;
  onMarkAttendance?: () => void;
  onDismiss?: () => void;
  loading?: boolean;
}

export const ActiveSessionModal: React.FC<ActiveSessionModalProps> = ({
  visible,
  session,
  onMarkAttendance,
  onDismiss,
  loading = false,
}) => {
  const router = useRouter();
  const [countdownSeconds, setCountdownSeconds] = useState(30);

  useEffect(() => {
    if (!visible || !session) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, session]);

  const handleMarkAttendance = () => {
    if (session && onMarkAttendance) {
      onMarkAttendance();
    } else if (session) {
      // Navigate to mark attendance screen
      router.push({
        pathname: "/student/mark-attendance",
        params: {
          meetingId: session.meetingId,
          courseName: session.courseName,
          courseCode: session.courseCode,
          roomNo: session.roomNo,
          timeStart: session.timeStart,
          timeEnd: session.timeEnd,
        },
      });
    }
  };

  if (!session) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onDismiss} disabled={loading}>
            <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance Required</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Alert Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="notifications-active"
              size={64}
              color={Colors.secondary}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Attendance Session Active</Text>

          {/* Message */}
          <Text style={styles.message}>
            Your teacher has started an attendance marking session. Please mark
            your attendance now using your current location.
          </Text>

          {/* Course Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <MaterialIcons
                  name="class"
                  size={20}
                  color={Colors.secondary}
                />
                <View>
                  <Text style={styles.detailLabel}>Course</Text>
                  <Text style={styles.detailValue}>{session.courseCode}</Text>
                </View>
              </View>
              <View style={styles.detailRight}>
                <Text style={styles.courseNameValue}>{session.courseName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <MaterialIcons
                  name="access-time"
                  size={20}
                  color={Colors.secondary}
                />
                <View>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>
                    {session.timeStart} - {session.timeEnd}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRight}>
                <MaterialIcons name="room" size={20} color={Colors.secondary} />
                <View>
                  <Text style={styles.detailLabel}>Room</Text>
                  <Text style={styles.detailValue}>{session.roomNo}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Countdown Timer */}
          <View style={styles.timerCard}>
            <MaterialIcons
              name="schedule"
              size={20}
              color={Colors.textSecondary}
            />
            <View>
              <Text style={styles.timerLabel}>Time Remaining</Text>
              <Text style={styles.timerValue}>{countdownSeconds}s</Text>
            </View>
          </View>

          {/* Warning Box */}
          <View style={styles.warningBox}>
            <MaterialIcons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              Please mark your attendance within the time limit to avoid being
              marked absent.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleMarkAttendance}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color={Colors.surface} />
                  <Text style={styles.primaryButtonText}>Processing...</Text>
                </>
              ) : (
                <>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color={Colors.surface}
                  />
                  <Text style={styles.primaryButtonText}>Mark Attendance</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onDismiss}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Remind Later</Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <Text style={styles.helpText}>
            You will need GPS enabled to mark attendance
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  detailLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  detailRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    justifyContent: "flex-end",
  },
  detailLabel: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginTop: 2,
  },
  courseNameValue: {
    ...Typography.small,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  timerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.secondary + "10",
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
  },
  timerLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timerValue: {
    ...Typography.h2,
    color: Colors.secondary,
    fontWeight: "700",
    marginTop: 2,
  },
  warningBox: {
    flexDirection: "row",
    gap: Spacing.md,
    backgroundColor: "#FEF3C7",
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    alignItems: "flex-start",
  },
  warningText: {
    flex: 1,
    ...Typography.small,
    color: "#78350F",
    lineHeight: 20,
  },
  buttonContainer: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    ...Typography.body,
    color: Colors.secondary,
    fontWeight: "600",
  },
  helpText: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
