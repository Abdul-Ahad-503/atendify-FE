import Constants from "expo-constants";
import * as Device from "expo-device";

const isExpoGo = Constants.appOwnership === "expo";

export const registerPushToken = async (): Promise<void> => {
  console.log("🔔 [PUSH] registerPushToken called");

  if (isExpoGo) {
    console.log("⚠️ [PUSH] Skipping — running in Expo Go");
    return;
  }

  if (!Device.isDevice) {
    console.log("⚠️ [PUSH] Skipping — not a physical device");
    return;
  }

  try {
    const Notifications = await import("expo-notifications");

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ [PUSH] Permission denied");
      return;
    }

    // Use FCM token instead of Expo token
    const token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log("✅ [PUSH] FCM Token:", token);

    const { notificationApi } = await import("./api");
    await notificationApi.registerPushToken(token);
    console.log("✅ [PUSH] Token saved to backend");
  } catch (error) {
    console.error("❌ [PUSH] Error:", error);
  }
};
