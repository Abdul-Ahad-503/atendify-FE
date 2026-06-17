import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { attendanceApi } from "@/utils/api";
import { TeacherMeeting } from "@/utils/api/types";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function TeacherDashboardScreen() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<TeacherMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todaysMeetings, setTodaysMeetings] = useState<TeacherMeeting[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadMeetings();
    }, []),
  );

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await attendanceApi.fetchTeacherMeetings();
      setMeetings(data || []);
    } catch (error) {
      console.error("Error loading meetings:", error);
      Alert.alert("Error", "Failed to load today's meetings");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await attendanceApi.fetchTeacherMeetings();
      setMeetings(data || []);
    } catch (error) {
      console.error("Error refreshing meetings:", error);
      Alert.alert("Error", "Failed to refresh meetings");
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return "TBA";
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleMarkAttendance = (meeting: TeacherMeeting) => {
    router.push({
      pathname: "/teacher/start-session",
      params: {
        meetingId: meeting.meetingId,
        courseCode: meeting.courseCode,
        courseName: meeting.courseName,
        timeStart: meeting.timeStart,
        timeEnd: meeting.timeEnd,
        roomNo: meeting.roomNo,
        enrolledCount: meeting.enrolledCount.toString(),
        section: meeting.section,
        semester: meeting.semester.toString(),
      },
    });
  };

  const renderMeetingCard = ({ item }: { item: TeacherMeeting }) => (
    <TouchableOpacity
      style={styles.meetingCard}
      onPress={() => handleMarkAttendance(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.leftContent}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseCode}>{item.courseCode}</Text>
            <View style={styles.timeBadge}>
              <MaterialIcons
                name="access-time"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.timeBadgeText}>
                {formatTime(item.timeStart)}
              </Text>
            </View>
          </View>
          <Text style={styles.courseName} numberOfLines={2}>
            {item.courseName}
          </Text>
          <View style={styles.meta}>
            <MaterialIcons name="room" size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>Room {item.roomNo}</Text>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.metaText}>Section {item.section}</Text>
          </View>
        </View>

        <View style={styles.rightContent}>
          <View style={styles.enrolledBadge}>
            <MaterialIcons name="people" size={20} color={Colors.secondary} />
            <View style={styles.enrolledInfo}>
              <Text style={styles.enrolledCount}>{item.enrolledCount}</Text>
              <Text style={styles.enrolledLabel}>Students</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMarkAttendance(item)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="check-circle"
              size={24}
              color={Colors.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Loading today's meetings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Today's Classes</Text>
          <Text style={styles.headerSubtitle}>
            {meetings.length} class{meetings.length !== 1 ? "es" : ""} scheduled
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <MaterialIcons name="refresh" size={24} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      {meetings.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyState}>
            <MaterialIcons name="event" size={64} color={Colors.border} />
            <Text style={styles.emptyTitle}>No Classes Today</Text>
            <Text style={styles.emptyMessage}>
              You don't have any scheduled classes for today.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={meetings}
          renderItem={renderMeetingCard}
          keyExtractor={(item) => item.meetingId}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary + "10",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  separator: {
    height: 0,
  },
  meetingCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    padding: Spacing.lg,
    gap: Spacing.md,
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
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.background,
    // borderRadius: BorderRadius.small,
  },
  timeBadgeText: {
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
    gap: 6,
  },
  metaText: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
  },
  metaDivider: {
    color: Colors.textSecondary,
  },
  rightContent: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  enrolledBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.secondary + "10",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    // borderRadius: BorderRadius.small,
  },
  enrolledInfo: {
    alignItems: "center",
  },
  enrolledCount: {
    ...Typography.h3,
    color: Colors.secondary,
    fontWeight: "700",
  },
  enrolledLabel: {
    ...Typography.extraSmall,
    color: Colors.textSecondary,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondary + "15",
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
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
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
