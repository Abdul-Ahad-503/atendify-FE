import { Colors, Spacing, Typography } from "@/constants/theme";
import { getUserRole, UserRole } from "@/utils/userRole";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy notifications data
const STUDENT_NOTIFICATIONS = [
  {
    id: 1,
    type: "success",
    icon: "check-circle",
    title: "Attendance Marked",
    message:
      "Your attendance for Mobile App Development has been marked as Present",
    time: "5 mins ago",
    read: false,
  },
  {
    id: 2,
    type: "info",
    icon: "schedule",
    title: "Class Reminder",
    message: "Database Systems class starts in 30 minutes at Lab 205",
    time: "25 mins ago",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    icon: "warning",
    title: "Low Attendance Alert",
    message: "Your attendance in Web Technologies is below 75%. Current: 70%",
    time: "2 hours ago",
    read: true,
  },
  {
    id: 4,
    type: "info",
    icon: "location-on",
    title: "Location Permission",
    message: "Please enable location services for auto attendance marking",
    time: "1 day ago",
    read: true,
  },
  {
    id: 5,
    type: "success",
    icon: "check-circle",
    title: "Attendance Marked",
    message:
      "Your attendance for Software Engineering has been marked as Present",
    time: "2 days ago",
    read: true,
  },
];

const TEACHER_NOTIFICATIONS = [
  {
    id: 1,
    type: "success",
    icon: "class",
    title: "Class Completed",
    message:
      "Mobile App Development class for BS-CS 6A completed. 42/50 students present",
    time: "10 mins ago",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    icon: "person",
    title: "Low Attendance Alert",
    message: "Ali Hassan has 65% attendance in Web Technologies",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "info",
    icon: "schedule",
    title: "Upcoming Class",
    message: "Web Technologies for BS-CS 5B starts in 1 hour at Lab 202",
    time: "2 hours ago",
    read: true,
  },
  {
    id: 4,
    type: "info",
    icon: "assessment",
    title: "Weekly Report Ready",
    message: "Your attendance report for this week is now available",
    time: "1 day ago",
    read: true,
  },
  {
    id: 5,
    type: "success",
    icon: "check-circle",
    title: "Attendance Submitted",
    message: "Attendance for Software Engineering BS-SE 4A has been submitted",
    time: "2 days ago",
    read: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const role = await getUserRole();
    setUserRole(role);
  };

  const notifications =
    userRole === "teacher" ? TEACHER_NOTIFICATIONS : STUDENT_NOTIFICATIONS;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markAllButton}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.content}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.notificationUnread,
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getIconColor(notification.type) + "20" },
              ]}
            >
              <MaterialIcons
                name={notification.icon as any}
                size={24}
                color={getIconColor(notification.type)}
              />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            {!notification.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function getIconColor(type: string) {
  switch (type) {
    case "success":
      return Colors.success;
    case "warning":
      return Colors.warning;
    case "error":
      return Colors.error;
    case "info":
    default:
      return Colors.primary;
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
    justifyContent: "space-between",
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  markAllButton: {
    padding: Spacing.xs,
  },
  markAllText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: 12,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationUnread: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  notificationMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  notificationTime: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
