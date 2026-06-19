import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import Constants from "expo-constants";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "splash",
};

const isExpoGo = Constants.appOwnership === "expo";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const notificationSub = useRef<any>(null);
  const responseSub = useRef<any>(null);

  useEffect(() => {
    // Skip entirely in Expo Go — not supported in SDK 53+
    if (isExpoGo) {
      console.log("⚠️ Skipping notification listeners in Expo Go");
      return;
    }

    let mounted = true;

    import("expo-notifications").then(async (Notifications) => {
      if (!mounted) return;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      notificationSub.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log("📬 Notification received:", notification);
        },
      );

      responseSub.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as {
            action?: string;
            meetingId?: string;
            courseName?: string;
            courseCode?: string;
            roomNo?: string;
            timeStart?: string;
            timeEnd?: string;
            // Background task result fields
            screen?: string;
            status?: string;
            distance?: string;
            radius?: string;
            markedAt?: string;
          };

          // Handle background auto-attendance result (local notification tap)
          if (data?.screen === "/student/attendance-result" && data?.meetingId) {
            router.push({
              pathname: "/student/attendance-result",
              params: {
                meetingId: data.meetingId,
                courseName: data.courseName || "",
                courseCode: data.courseCode || "",
                status: data.status || "success",
                distance: data.distance || "",
                radius: data.radius || "",
                markedAt: data.markedAt || "",
              },
            });
            return;
          }

          // Handle FCM push notification tap — pass all course details
          if (data?.action === "MARK_ATTENDANCE" && data?.meetingId) {
            router.push({
              pathname: "/student/mark-attendance",
              params: {
                meetingId: data.meetingId,
                courseName: data.courseName || "",
                courseCode: data.courseCode || "",
                roomNo: data.roomNo || "",
                timeStart: data.timeStart || "",
                timeEnd: data.timeEnd || "",
              },
            });
          }
        });

      // Register background task and process pending marks
      try {
        const bgModule = await import("../utils/background-attendance");
        bgModule.initBackgroundTask();
        bgModule.processPendingMarks();
      } catch (err) {
        console.log("⚠️ Background task registration skipped (expected in dev):", err);
      }
    });

    return () => {
      mounted = false;
      import("expo-notifications").then((Notifications) => {
        if (notificationSub.current) {
          notificationSub.current?.remove?.();
        }
        if (responseSub.current) {
          responseSub.current?.remove?.();
        }
      });
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
          <Stack.Screen name="help-support" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
