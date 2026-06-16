import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export const registerPushToken = async (): Promise<void> => {
  if (isExpoGo) {
    console.log('⚠️ Push notifications not supported in Expo Go. Build a dev build to enable.');
    return;
  }

  if (!Device.isDevice) {
    console.log('⚠️ Push notifications only work on physical devices');
    return;
  }

  try {
    const Notifications = await import('expo-notifications');

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('⚠️ Push notification permission denied');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('📱 Push token:', token);

    const { notificationApi } = await import('./api');
    await notificationApi.registerPushToken(token);
  } catch (error) {
    console.warn('Error registering push token:', error);
  }
};