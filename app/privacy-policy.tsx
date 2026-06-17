import { Colors, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: June 2026</Text>

        <Section title="1. Information We Collect">
          <Text style={styles.body}>
            Atendify collects only the information necessary to provide accurate location-based attendance tracking:
          </Text>
          <Bullet text="Account information: name, email, student/employee ID, and role" />
          <Bullet text="Academic data: enrolled courses, class schedule, program and semester details" />
          <Bullet text="Location data: GPS coordinates at the time of marking attendance (never stored persistently)" />
          <Bullet text="Device information: device model for compatibility purposes" />
        </Section>

        <Section title="2. How We Use Your Information">
          <Bullet text="To verify your identity and role within the institution" />
          <Bullet text="To record attendance based on your geographic proximity to the class location" />
          <Bullet text="To generate attendance reports for students and instructors" />
          <Bullet text="To send push notifications about attendance session status" />
        </Section>

        <Section title="3. Location Data">
          <Text style={styles.body}>
            Location data is used solely to determine whether you are physically present at the class location during an attendance session.
            GPS coordinates are compared against the teacher's location and are not stored beyond the attendance record.
          </Text>
        </Section>

        <Section title="4. Data Sharing">
          <Text style={styles.body}>
            Your data is only shared within the educational institution. Attendance records are visible to:
          </Text>
          <Bullet text="You (the student/teacher)" />
          <Bullet text="Your instructors (for student records)" />
          <Bullet text="Institution administrators (for reporting purposes)" />
        </Section>

        <Section title="5. Data Retention">
          <Text style={styles.body}>
            Attendance records are retained for the duration of the academic term plus one year for institutional record-keeping.
            Account data is retained until you or the institution requests deletion.
          </Text>
        </Section>

        <Section title="6. Contact">
          <Text style={styles.body}>
            For privacy-related inquiries, please contact your institution's IT administration or reach out through the Help & Support section.
          </Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.body}>{text}</Text>
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
  lastUpdated: { ...Typography.small, color: Colors.textSecondary, textAlign: "center" },
  section: { gap: Spacing.sm },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, fontWeight: "600" },
  body: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
  bulletRow: { flexDirection: "row", gap: Spacing.sm, paddingLeft: Spacing.sm },
  bullet: { color: Colors.textSecondary, width: 12 },
});
