import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { attendanceApi } from "./api";

export const BACKGROUND_ATTENDANCE_TASK = "BACKGROUND_ATTENDANCE_MARK";

const PENDING_MARKS_KEY = "pending_background_marks";

/**
 * Call this once at app startup (inside a dynamic import) to register the
 * background TaskManager task. Wrapped in a function so the native module
 * isn't required at module-load time.
 */
export function initBackgroundTask() {
  // Dynamic import so ExpoTaskManager native module isn't loaded at module scope
  const TaskManager = require("expo-task-manager");

  TaskManager.defineTask(BACKGROUND_ATTENDANCE_TASK, async ({ data: taskData, error: taskError }: { data: any; error: any }) => {
    if (taskError) {
      console.error("❌ [BackgroundTask] Error:", taskError);
      return;
    }

    const payload = taskData as {
      meetingId?: string;
      courseName?: string;
      courseCode?: string;
      roomNo?: string;
      timeStart?: string;
      timeEnd?: string;
    };

    const { meetingId, courseName, courseCode } = payload;
    if (!meetingId) {
      console.error("❌ [BackgroundTask] No meetingId in payload");
      return;
    }

    try {
      // Check background location permission
      const bgPerm = await Location.getBackgroundPermissionsAsync();
      if (bgPerm.status !== "granted") {
        await showFailureNotification(
          meetingId,
          courseName,
          courseCode,
          "Background location not granted. Open app and enable it in settings.",
        );
        return;
      }

      // Get GPS location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      console.log("📍 [BackgroundTask] Location obtained:", {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      // Mark attendance
      const response = await attendanceApi.markStudentAttendance({
        meetingId,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        radiusMeters: 10,
      });

      // Show result notification
      const isPresent = response.status === "present";
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isPresent
            ? "✅ Attendance Marked!"
            : "❌ Attendance Marked as Absent",
          body: isPresent
            ? `You're ${response.distance} from class — marked present for ${courseName || "class"}`
            : `You're ${response.distance} away (limit: ${response.radiusMeters}m) — marked absent`,
          data: {
            screen: "/student/attendance-result",
            meetingId,
            courseName: courseName || "",
            courseCode: courseCode || "",
            status: response.status,
            distance: response.distance,
            radius: `${response.radiusMeters}m`,
            markedAt: response.markedAt,
          },
        },
        trigger: null,
      });

      console.log("✅ [BackgroundTask] Success:", response.status);
    } catch (err: any) {
      console.error("❌ [BackgroundTask] Failed:", err.message);

      // Store failed attempt for retry
      await savePendingMark(meetingId, courseName || "", courseCode || "");

      // Notify user
      await showFailureNotification(
        meetingId,
        courseName,
        courseCode,
        err.message || "Could not mark attendance automatically. Open the app to retry.",
      );
    }
  });
}

/**
 * Show a local notification when background attendance fails
 */
async function showFailureNotification(
  meetingId: string,
  courseName?: string,
  courseCode?: string,
  message?: string,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "⚠️ Attendance Auto-Mark Failed",
      body:
        message ||
        "Could not mark attendance automatically. Please open the app.",
      data: {
        screen: "/student/mark-attendance",
        meetingId,
        courseName: courseName || "",
        courseCode: courseCode || "",
      },
    },
    trigger: null,
  });
}

/**
 * Save a failed background mark to AsyncStorage for retry
 */
async function savePendingMark(
  meetingId: string,
  courseName: string,
  courseCode: string,
) {
  try {
    const stored = await AsyncStorage.getItem(PENDING_MARKS_KEY);
    const pending = stored ? JSON.parse(stored) : [];
    pending.push({
      meetingId,
      courseName,
      courseCode,
      createdAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(PENDING_MARKS_KEY, JSON.stringify(pending));
  } catch (e) {
    console.error("❌ [BackgroundTask] Failed to save pending mark:", e);
  }
}

/**
 * Process any pending (failed) background marks.
 * Call this when the app opens to retry.
 */
export async function processPendingMarks() {
  try {
    const stored = await AsyncStorage.getItem(PENDING_MARKS_KEY);
    if (!stored) return;

    const pending = JSON.parse(stored);
    if (pending.length === 0) return;

    const remaining: typeof pending = [];

    for (const mark of pending) {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });

        await attendanceApi.markStudentAttendance({
          meetingId: mark.meetingId,
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          radiusMeters: 10,
        });
      } catch {
        remaining.push(mark);
      }
    }

    await AsyncStorage.setItem(
      PENDING_MARKS_KEY,
      JSON.stringify(remaining),
    );
  } catch (e) {
    console.error("❌ [BackgroundTask] Error processing pending marks:", e);
  }
}
