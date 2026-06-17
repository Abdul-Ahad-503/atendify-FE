import { Colors, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpSupportScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Section icon="help-outline" title="How does attendance work?">
          <Text style={styles.body}>
            When a teacher starts an attendance session, you receive a push notification. Open the app and your GPS location
            is automatically compared to the teacher's location. If you're within the allowed radius (typically 10 meters),
            you're marked present.
          </Text>
        </Section>

        <Section icon="gps-fixed" title="Location Requirements">
          <Text style={styles.body}>
            Ensure GPS/location services are enabled on your device. For best results, enable "While Using the App"
            or "Always" location permission. Background location is needed for auto-attendance marking.
          </Text>
        </Section>

        <Section icon="notifications" title="Push Notifications">
          <Text style={styles.body}>
            Notifications are sent when a teacher starts or ends an attendance session. Make sure notifications are enabled
            for Atendify in your device settings.
          </Text>
        </Section>

        <Section icon="school" title="For Teachers">
          <Text style={styles.body}>
            To start a session: go to Home → tap a class → tap "Start Session". Your GPS location is used as the reference
            point. End the session when done — remaining students are automatically marked absent.
          </Text>
        </Section>

        <Section icon="report-problem" title="Troubleshooting">
          <Text style={styles.body}>
            If attendance isn't working: (1) Check location permissions, (2) Ensure you're near the class location,
            (3) Verify GPS is on, (4) Restart the app. For persistent issues, contact your institution's IT support.
          </Text>
        </Section>

        <Section icon="mail-outline" title="Contact Us">
          <Text style={styles.body}>
            For additional support, please contact your institution's IT department or email support@atendify.com.
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MaterialIcons name={icon} size={22} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  headerTitle: { ...Typography.h3, color: Colors.textPrimary },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },
  section: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, gap: Spacing.sm, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, fontWeight: "600", flex: 1 },
  body: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
});
