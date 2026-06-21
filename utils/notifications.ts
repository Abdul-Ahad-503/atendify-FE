import Constants from "expo-constants";
import * as Device from "expo-device";
import { Alert } from 'react-native';

const isExpoGo = Constants.appOwnership === "expo";

export const registerPushToken = async (): Promise<boolean> => {
  console.log("🔔 [PUSH] registerPushToken called");

  if (isExpoGo) {
    console.log("⚠️ [PUSH] Skipping — running in Expo Go");
    return false;
  }

  if (!Device.isDevice) {
    console.log("⚠️ [PUSH] Skipping — not a physical device");
    return false;
  }

  try {
    const Notifications = await import("expo-notifications");

    // Request notification permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ [PUSH] Permission denied");
      Alert.alert(
        "Notification Permission Required",
        "Please enable notifications in your device settings to receive attendance alerts.",
        [{ text: "OK" }]
      );
      return false;
    }

    // Use FCM token instead of Expo token
    const token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log("✅ [PUSH] FCM Token:", token);

    // Register token with backend
    const { notificationApi } = await import("./api");
    await notificationApi.registerPushToken(token);
    console.log("✅ [PUSH] Token saved to backend");

    // Set up notification received handler
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("🔔 [PUSH] Notification received:", notification);
      // Handle notification display
    });

    // Set up notification response handler
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("🔔 [PUSH] Notification response:", response);
      // Handle notification tap
      const { data } = response.notification.request.content;
      if (data?.action === 'MARK_ATTENDANCE') {
        // Navigate to mark attendance screen
        const { router } = await import("expo-router");
        router.push({
          pathname: "/student/mark-attendance",
          params: {
            meetingId: data.meetingId,
            courseName: data.courseName,
            courseCode: data.courseCode,
            timeStart: data.timeStart,
            timeEnd: data.timeEnd,
            roomNo: data.roomNo,
            section: data.section,
            semester: data.semester,
          },
        });
      }
    });

    return true;
  } catch (error) {
    console.error("❌ [PUSH] Error:", error);
    Alert.alert(
      "Notification Error",
      "Failed to register notifications. Please try again or check your internet connection.",
      [{ text: "OK" }]
    );
    return false;
  }
};

/**
 * Schedule a local notification for attendance
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  data: any = {}
) => {
  try {
    const Notifications = await import("expo-notifications");

    await Notifications.setNotificationChannelAsync("attendance", {
      name: "Attendance Notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#10B981",
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });

    console.log("✅ [PUSH] Local notification scheduled:", title);
  } catch (error) {
    console.error("❌ [PUSH] Error scheduling local notification:", error);
  }
};
