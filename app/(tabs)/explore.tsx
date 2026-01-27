import { Colors, Spacing, Typography } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="explore" size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <MaterialIcons name="location-on" size={48} color={Colors.primary} />
          <Text style={styles.cardTitle}>Location Tracking</Text>
          <Text style={styles.cardDescription}>
            Track attendance based on location with high accuracy
          </Text>
        </View>

        <View style={styles.card}>
          <MaterialIcons
            name="access-time"
            size={48}
            color={Colors.secondary}
          />
          <Text style={styles.cardTitle}>Real-Time Updates</Text>
          <Text style={styles.cardDescription}>
            Get instant notifications and attendance records
          </Text>
        </View>

        <View style={styles.card}>
          <MaterialIcons name="analytics" size={48} color={Colors.success} />
          <Text style={styles.cardTitle}>Analytics</Text>
          <Text style={styles.cardDescription}>
            View detailed reports and attendance statistics
          </Text>
        </View>
      </ScrollView>
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 5,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
