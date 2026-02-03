import { Colors, Spacing, Typography } from "@/constants/theme";
import { getUserRole, UserRole } from "@/utils/userRole";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy timetable data
const STUDENT_TIMETABLE = {
  Monday: [
    {
      subject: "Mobile App Development",
      teacher: "Dr. Sarah Khan",
      time: "10:00 AM - 11:30 AM",
      room: "Room 301",
      status: "upcoming",
    },
    {
      subject: "Database Systems",
      teacher: "Prof. Ali Ahmed",
      time: "1:00 PM - 2:30 PM",
      room: "Lab 205",
      status: "upcoming",
    },
    {
      subject: "Software Engineering",
      teacher: "Dr. Fatima Ali",
      time: "3:00 PM - 4:30 PM",
      room: "Room 105",
      status: "upcoming",
    },
  ],
  Tuesday: [
    {
      subject: "Web Technologies",
      teacher: "Mr. Hassan Raza",
      time: "9:00 AM - 10:30 AM",
      room: "Lab 202",
      status: "upcoming",
    },
    {
      subject: "Data Structures",
      teacher: "Dr. Ahmed Khan",
      time: "11:00 AM - 12:30 PM",
      room: "Room 204",
      status: "upcoming",
    },
    {
      subject: "Computer Networks",
      teacher: "Prof. Maria Siddique",
      time: "2:00 PM - 3:30 PM",
      room: "Lab 301",
      status: "upcoming",
    },
  ],
  Wednesday: [
    {
      subject: "Mobile App Development",
      teacher: "Dr. Sarah Khan",
      time: "10:00 AM - 11:30 AM",
      room: "Room 301",
      status: "upcoming",
    },
    {
      subject: "Artificial Intelligence",
      teacher: "Dr. Usman Ali",
      time: "1:00 PM - 2:30 PM",
      room: "Room 402",
      status: "upcoming",
    },
  ],
  Thursday: [
    {
      subject: "Web Technologies",
      teacher: "Mr. Hassan Raza",
      time: "9:00 AM - 10:30 AM",
      room: "Lab 202",
      status: "upcoming",
    },
    {
      subject: "Database Systems",
      teacher: "Prof. Ali Ahmed",
      time: "1:00 PM - 2:30 PM",
      room: "Lab 205",
      status: "upcoming",
    },
    {
      subject: "Software Engineering",
      teacher: "Dr. Fatima Ali",
      time: "3:00 PM - 4:30 PM",
      room: "Room 105",
      status: "upcoming",
    },
  ],
  Friday: [
    {
      subject: "Computer Networks",
      teacher: "Prof. Maria Siddique",
      time: "10:00 AM - 11:30 AM",
      room: "Lab 301",
      status: "upcoming",
    },
    {
      subject: "Artificial Intelligence",
      teacher: "Dr. Usman Ali",
      time: "1:00 PM - 2:30 PM",
      room: "Room 402",
      status: "upcoming",
    },
  ],
};

const TEACHER_TIMETABLE = {
  Monday: [
    {
      subject: "Mobile App Development",
      course: "BS-CS 6A",
      time: "10:00 AM - 11:30 AM",
      room: "Room 301",
      students: 50,
    },
    {
      subject: "Web Technologies",
      course: "BS-CS 5B",
      time: "1:00 PM - 2:30 PM",
      room: "Lab 202",
      students: 45,
    },
    {
      subject: "Software Engineering",
      course: "BS-SE 4A",
      time: "3:00 PM - 4:30 PM",
      room: "Room 105",
      students: 40,
    },
  ],
  Tuesday: [
    {
      subject: "Mobile App Development",
      course: "BS-CS 6B",
      time: "9:00 AM - 10:30 AM",
      room: "Room 301",
      students: 48,
    },
    {
      subject: "Web Technologies",
      course: "BS-CS 5A",
      time: "2:00 PM - 3:30 PM",
      room: "Lab 202",
      students: 42,
    },
  ],
  Wednesday: [
    {
      subject: "Mobile App Development",
      course: "BS-CS 6A",
      time: "10:00 AM - 11:30 AM",
      room: "Room 301",
      students: 50,
    },
    {
      subject: "Software Engineering",
      course: "BS-SE 4B",
      time: "1:00 PM - 2:30 PM",
      room: "Room 105",
      students: 38,
    },
  ],
  Thursday: [
    {
      subject: "Web Technologies",
      course: "BS-CS 5B",
      time: "9:00 AM - 10:30 AM",
      room: "Lab 202",
      students: 45,
    },
    {
      subject: "Mobile App Development",
      course: "BS-CS 6B",
      time: "1:00 PM - 2:30 PM",
      room: "Room 301",
      students: 48,
    },
    {
      subject: "Software Engineering",
      course: "BS-SE 4A",
      time: "3:00 PM - 4:30 PM",
      room: "Room 105",
      students: 40,
    },
  ],
  Friday: [
    {
      subject: "Web Technologies",
      course: "BS-CS 5A",
      time: "10:00 AM - 11:30 AM",
      room: "Lab 202",
      students: 42,
    },
    {
      subject: "Software Engineering",
      course: "BS-SE 4B",
      time: "1:00 PM - 2:30 PM",
      room: "Room 105",
      students: 38,
    },
  ],
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetableScreen() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedDay, setSelectedDay] = useState("Monday");

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const role = await getUserRole();
    setUserRole(role);
  };

  const timetable =
    userRole === "teacher" ? TEACHER_TIMETABLE : STUDENT_TIMETABLE;
  const classes = timetable[selectedDay as keyof typeof timetable] || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="schedule" size={32} color={Colors.primary} />
        <Text style={styles.headerTitle}>Timetable</Text>
      </View>

      {/* Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
      >
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.dayButtonActive,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDay === day && styles.dayButtonTextActive,
              ]}
            >
              {day.substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Classes List */}
      <ScrollView style={styles.content}>
        <Text style={styles.dayTitle}>{selectedDay}</Text>

        {classes.length > 0 ? (
          <View style={styles.classList}>
            {classes.map((classItem, index) => (
              <View key={index} style={styles.classCard}>
                <View style={styles.classHeader}>
                  <View style={styles.classStatus}>
                    {getStatusIcon(classItem, index)}
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{classItem.subject}</Text>
                    {userRole === "student" ? (
                      <>
                        <View style={styles.classDetail}>
                          <MaterialIcons
                            name="person"
                            size={16}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.classDetailText}>
                            {"teacher" in classItem ? classItem.teacher : ""}
                          </Text>
                        </View>
                        <View style={styles.classDetail}>
                          <MaterialIcons
                            name="access-time"
                            size={16}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.classDetailText}>
                            {classItem.time}
                          </Text>
                        </View>
                        <View style={styles.classDetail}>
                          <MaterialIcons
                            name="room"
                            size={16}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.classDetailText}>
                            {classItem.room}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.classDetail}>
                          <MaterialIcons
                            name="people"
                            size={16}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.classDetailText}>
                            {"course" in classItem ? classItem.course : ""}
                          </Text>
                        </View>
                        <View style={styles.classDetail}>
                          <MaterialIcons
                            name="access-time"
                            size={16}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.classDetailText}>
                            {classItem.time}
                          </Text>
                        </View>
                        <View style={styles.classDetail}>
                          <MaterialIcons
                            name="room"
                            size={16}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.classDetailText}>
                            {classItem.room}
                          </Text>
                        </View>
                        <View style={styles.classDetail}>
                          <MaterialIcons
                            name="group"
                            size={16}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.classDetailText}>
                            {"students" in classItem ? classItem.students : 0}{" "}
                            Students
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="event-busy"
              size={64}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyText}>No classes scheduled</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusIcon(classItem: any, index: number) {
  // First class is "now", second is "completed", rest are "upcoming"
  if (index === 0) {
    return (
      <View style={[styles.statusBadge, { backgroundColor: Colors.primary }]}>
        <Text style={styles.statusText}>NOW</Text>
      </View>
    );
  } else if (index === 1) {
    return (
      <View style={[styles.statusBadge, { backgroundColor: Colors.success }]}>
        <MaterialIcons name="check" size={16} color={Colors.surface} />
      </View>
    );
  } else {
    return (
      <View style={[styles.statusBadge, { backgroundColor: Colors.border }]}>
        <MaterialIcons name="schedule" size={16} color={Colors.textSecondary} />
      </View>
    );
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
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  daySelector: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
  },
  dayButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  dayButtonTextActive: {
    color: Colors.surface,
  },
  content: {
    flex: 1,
  },
  dayTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    padding: Spacing.lg,
  },
  classList: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  classCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  classStatus: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    ...Typography.small,
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 10,
  },
  classInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  className: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  classDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  classDetailText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    marginTop: Spacing.xl * 2,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});
