import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { attendanceApi } from "@/utils/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from "react-native";

export default function AttendanceHistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, []),
  );

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await attendanceApi.getStudentHistory();
      setHistory(data.records || []);
    } catch (error) {
      console.error("Error loading history:", error);
      Alert.alert("Error", "Failed to load attendance history");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await attendanceApi.getStudentHistory();
      setHistory(data.records || []);
    } catch (error) {
      console.error("Error refreshing history:", error);
      Alert.alert("Error", "Failed to refresh attendance history");
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const renderHistoryCard = ({ item }: { item: any }) => {
    const isPresent = item.status === "present";
    const statusColor = isPresent ? "#10B981" : "#EF4444";
    const statusBg = isPresent ? "#D1FAE5" : "#FEE2E2";

    return (
      <View style={styles.historyCard}>
        <View style={styles.cardContent}>
          <View style={styles.leftContent}>
            <View style={styles.courseHeader}>
              <Text style={styles.courseCode}>
                {item.offeringId?.courseId?.code || "N/A"}
              </Text>
              <View style={styles.dateBadge}>
                <MaterialIcons
                  name="calendar-today"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.dateBadgeText}>
                  {formatDate(item.markedAt)}
                </Text>
              </View>
            </View>
            <Text style={styles.courseName} numberOfLines={2}>
              {item.offeringId?.courseId?.name || "Course"}
            </Text>
            <View style={styles.meta}>
              <MaterialIcons
                name="access-time"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.metaText}>
                {item.meetingId?.timeStart}-{item.meetingId?.timeEnd}
              </Text>
              <Text style={styles.metaDivider}>•</Text>
              <MaterialIcons
                name="room"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.metaText}>
                Room {item.meetingId?.roomNo || "N/A"}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <MaterialIcons
              name={isPresent ? "check-circle" : "cancel"}
              size={24}
              color={statusColor}
            />
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
            <Text style={[styles.distanceLabel, { color: statusColor }]}>
              {item.distanceMeters}m
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Loading attendance history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Attendance History</Text>
          <Text style={styles.headerSubtitle}>
            {history.length} record{history.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="history" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No Attendance Records</Text>
          <Text style={styles.emptyMessage}>
            Your attendance records will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  separator: {
    height: 0,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: "center",
  },
  leftContent: {
    flex: 1,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  courseCode: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.small,
  },
  dateBadgeText: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  courseName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  metaText: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
  },
  metaDivider: {
    color: Colors.textSecondary,
    marginHorizontal: 4,
  },
  statusBadge: {
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.small,
  },
  statusLabel: {
    ...Typography.small,
    fontWeight: "600",
  },
  distanceLabel: {
    ...Typography.extraSmall,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  emptyMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
