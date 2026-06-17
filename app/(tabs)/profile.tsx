import { Colors, Spacing, Typography } from "@/constants/theme";
import { authApi, User } from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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

export default function ProfileScreen() {
  const router = useRouter();
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

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await authApi.logout();
          } catch (_) {}
          router.replace("/auth/login");
        },
      },
    ]);
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

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Unable to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUser}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="person" size={28} color={Colors.primary} />
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={[styles.avatar, user.role === "teacher" && { backgroundColor: Colors.secondary + "20" }]}>
            <MaterialIcons name={user.role === "student" ? "school" : "person"} size={56} color={user.role === "student" ? Colors.primary : Colors.secondary} />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userId}>{user.role === "student" ? user.rollNumber : user.employeeId}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: user.role === "student" ? Colors.primary : Colors.secondary }]}>
            <MaterialIcons name={user.role === "student" ? "school" : "person"} size={14} color={Colors.surface} />
            <Text style={styles.roleBadgeText}>{user.role === "student" ? "Student" : "Teacher"}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.section}>
          {user.role === "student" ? (
            <>
              <InfoRow icon="school" label="Department" value={user.department || "N/A"} />
              <InfoRow icon="date-range" label="Semester" value={user.semester ? `${user.semester}th Semester` : "N/A"} />
              <InfoRow icon="check-circle" label="Account" value={user.isActive ? "Active" : "Inactive"} valueColor={user.isActive ? Colors.success : Colors.error} />
            </>
          ) : (
            <>
              <InfoRow icon="business" label="Department" value={user.department || "N/A"} />
              <InfoRow icon="check-circle" label="Account" value={user.isActive ? "Active" : "Inactive"} valueColor={user.isActive ? Colors.success : Colors.error} />
            </>
          )}
        </View>

        {/* Teacher Action */}
        {user.role === "teacher" && (
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/teacher/add-course-offering" as any)}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.secondary + "20" }]}>
              <MaterialIcons name="add-circle" size={24} color={Colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Add Course Offering</Text>
              <Text style={styles.actionDesc}>Create a new course offering with timetable</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Menu */}
        <View style={styles.section}>
          <MenuItem icon="privacy-tip" label="Privacy Policy" onPress={() => router.push("/privacy-policy" as any)} />
          <MenuItem icon="help" label="Help & Support" onPress={() => router.push("/help-support" as any)} />
          <MenuItem icon="info" label="About Atendify" onPress={() => router.push("/about" as any)} last />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={Colors.surface} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.versionRow}>
          <Text style={styles.versionText}>Atendify v1.0.2</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, valueColor }: { icon: any; label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <MaterialIcons name={icon} size={20} color={Colors.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress, last }: { icon: any; label: string; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity style={[styles.menuItem, last && { borderBottomWidth: 0 }]} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.menuIconBox}>
        <MaterialIcons name={icon} size={22} color={Colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <MaterialIcons name="chevron-right" size={22} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.md },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  headerTitle: { ...Typography.h2, color: Colors.textPrimary },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xl },
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  userName: { ...Typography.h2, color: Colors.textPrimary, fontWeight: "700", marginBottom: 4 },
  userId: { ...Typography.body, color: Colors.textSecondary, marginBottom: 2 },
  userEmail: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.md },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: 6,
    marginTop: Spacing.sm,
  },
  roleBadgeText: { ...Typography.small, color: Colors.surface, fontWeight: "600" },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  infoIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" },
  infoLabel: { ...Typography.small, color: Colors.textSecondary, marginBottom: 2 },
  infoValue: { ...Typography.body, color: Colors.textPrimary, fontWeight: "600" },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  actionTitle: { ...Typography.body, color: Colors.textPrimary, fontWeight: "600" },
  actionDesc: { ...Typography.small, color: Colors.textSecondary, marginTop: 2 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  menuIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + "10", alignItems: "center", justifyContent: "center" },
  menuLabel: { ...Typography.body, color: Colors.textPrimary, flex: 1 },
  logoutBtn: {
    backgroundColor: Colors.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  logoutText: { ...Typography.body, color: Colors.surface, fontWeight: "600" },
  versionRow: { alignItems: "center", paddingVertical: Spacing.lg },
  versionText: { ...Typography.small, color: Colors.textSecondary },
  errorText: { ...Typography.body, color: Colors.error },
  retryButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: 8 },
  retryBtnText: { color: Colors.surface, fontWeight: "600" },
});
