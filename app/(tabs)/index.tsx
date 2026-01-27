import { Colors, Spacing, Typography } from "@/constants/theme";
import { getUserRole, UserRole } from "@/utils/userRole";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const role = await getUserRole();
    setUserRole(role);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="location-on" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.headerTitle}>GeoAttend</Text>
        {userRole && (
          <View style={styles.roleBadge}>
            <MaterialIcons
              name={userRole === "student" ? "school" : "person"}
              size={16}
              color={Colors.primary}
            />
            <Text style={styles.roleBadgeText}>
              {userRole === "student" ? "Student" : "Teacher"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {userRole === "student" ? (
          <>
            <MaterialIcons name="school" size={64} color={Colors.primary} />
            <Text style={styles.title}>Student Dashboard</Text>
            <Text style={styles.subtitle}>
              Track your attendance and view your records
            </Text>
          </>
        ) : userRole === "teacher" ? (
          <>
            <MaterialIcons name="person" size={64} color={Colors.secondary} />
            <Text style={styles.title}>Teacher Dashboard</Text>
            <Text style={styles.subtitle}>
              Manage classes and track student attendance
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Welcome to GeoAttend</Text>
            <Text style={styles.subtitle}>
              Location-Based Attendance System
            </Text>
          </>
        )}
      </View>
    </View>
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
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    flex: 1,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
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
});
