import { Colors, Spacing, Typography } from "@/constants/theme";
import { authApi, User } from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

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

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await authApi.logout();
            router.replace("/auth/login");
          } catch (error) {
            console.error("Error during logout:", error);
            // Still navigate to login even if API call fails
            router.replace("/auth/login");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Unable to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUser}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <MaterialIcons name="person" size={32} color={Colors.primary} />
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View
            style={[
              styles.avatarContainer,
              user.role === "teacher" && {
                backgroundColor: Colors.secondary + "20",
              },
            ]}
          >
            <MaterialIcons
              name={user.role === "student" ? "school" : "person"}
              size={64}
              color={
                user.role === "student" ? Colors.primary : Colors.secondary
              }
            />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userId}>
            {user.role === "student" ? user.rollNumber : user.employeeId}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.role && (
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    user.role === "student" ? Colors.primary : Colors.secondary,
                },
              ]}
            >
              <MaterialIcons
                name={user.role === "student" ? "school" : "person"}
                size={16}
                color={Colors.surface}
              />
              <Text style={styles.roleBadgeText}>
                {user.role === "student" ? "Student" : "Teacher"}
              </Text>
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          {user.role === "student" ? (
            <>
              <View style={styles.infoRow}>
                <MaterialIcons
                  name="school"
                  size={20}
                  color={Colors.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Department</Text>
                  <Text style={styles.infoValue}>
                    {user.department || "N/A"}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons
                  name="date-range"
                  size={20}
                  color={Colors.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Semester</Text>
                  <Text style={styles.infoValue}>
                    {user.semester ? `${user.semester}th Semester` : "N/A"}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={user.isActive ? Colors.success : Colors.error}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Account Status</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: user.isActive ? Colors.success : Colors.error },
                    ]}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <MaterialIcons
                  name="business"
                  size={20}
                  color={Colors.textSecondary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Department</Text>
                  <Text style={styles.infoValue}>
                    {user.department || "N/A"}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={user.isActive ? Colors.success : Colors.error}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Account Status</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: user.isActive ? Colors.success : Colors.error },
                    ]}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons
                name="notifications"
                size={24}
                color={Colors.icon}
              />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  {user.role === "student"
                    ? "Class reminders and attendance alerts"
                    : "Class updates and reports"}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary + "80" }}
              thumbColor={
                notificationsEnabled ? Colors.primary : Colors.textSecondary
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="location-on" size={24} color={Colors.icon} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Location Permission</Text>
                <Text style={styles.settingDescription}>
                  {user.role === "student"
                    ? "Auto-mark attendance"
                    : "Track class sessions"}
                </Text>
              </View>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary + "80" }}
              thumbColor={
                locationEnabled ? Colors.primary : Colors.textSecondary
              }
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="edit" size={24} color={Colors.icon} />
            <Text style={styles.menuText}>Edit Profile</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="privacy-tip" size={24} color={Colors.icon} />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="help" size={24} color={Colors.icon} />
            <Text style={styles.menuText}>Help & Support</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="info" size={24} color={Colors.icon} />
            <Text style={styles.menuText}>About Atendify</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.icon} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={Colors.surface} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Atendify v1.0.2</Text>
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
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 5,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    backgroundColor: Colors.primary + "20",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontWeight: "700",
  },
  userId: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  roleBadgeText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  settingsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  menuSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  menuText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  logoutText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
  versionInfo: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  versionText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: "600",
  },
});
