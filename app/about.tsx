import { Colors, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Atendify</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="check-circle" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>Atendify</Text>
          <Text style={styles.tagline}>Location-Based Attendance System</Text>
          <Text style={styles.version}>Version 1.0.2</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is Atendify?</Text>
          <Text style={styles.body}>
            Atendify is a modern attendance management system designed for educational institutions.
            It leverages GPS location technology to automate the attendance process, making it seamless
            for both students and teachers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <Feature icon="gps-fixed" text="GPS-based location verification for accurate attendance" />
          <Feature icon="notifications" text="Real-time push notifications when attendance starts" />
          <Feature icon="auto-awesome" text="Background auto-marking of attendance" />
          <Feature icon="bar-chart" text="Detailed attendance statistics and reports" />
          <Feature icon="history" text="Full attendance history with filters" />
          <Feature icon="school" text="Role-based access for students and teachers" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Built With</Text>
          <Text style={styles.body}>
            React Native • Expo • Node.js • Express • MongoDB • Firebase Cloud Messaging
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Atendify. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureRow}>
      <MaterialIcons name={icon} size={20} color={Colors.primary} />
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
  logoArea: { alignItems: "center", gap: Spacing.sm, paddingVertical: Spacing.xl },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + "15", alignItems: "center", justifyContent: "center" },
  appName: { ...Typography.h1, color: Colors.textPrimary, fontWeight: "700" },
  tagline: { ...Typography.body, color: Colors.textSecondary },
  version: { ...Typography.small, color: Colors.textSecondary, marginTop: Spacing.xs },
  section: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, gap: Spacing.sm, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { ...Typography.h3, color: Colors.textPrimary, fontWeight: "600" },
  body: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  footer: { alignItems: "center", paddingVertical: Spacing.lg },
  footerText: { ...Typography.small, color: Colors.textSecondary },
});
