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

    import("expo-notifications").then((Notifications) => {
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
          };

          if (data?.action === "MARK_ATTENDANCE" && data?.meetingId) {
            router.push({
              pathname: "/student/mark-attendance",
              params: { meetingId: data.meetingId },
            });
          }
        });
    });

    return () => {
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
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
