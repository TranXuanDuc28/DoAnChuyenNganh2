import Constants from 'expo-constants';
import { notificationAPI, API_BASE_URL } from './api';

// Registers for push notifications and sends token to backend
// Note: expo-notifications requires a development build (not Expo Go) for Android SDK 53+
export const registerForPushNotificationsAsync = async (sendToServer = true) => {
  // Check if we're in Expo Go (which doesn't support push notifications on Android SDK 53+)
  if (Constants.executionEnvironment === 'storeClient') {
    console.warn('Push notifications are not fully supported in Expo Go. Use a development build instead.');
    return null;
  }

  let token;
  if (!Constants.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return null;
  }

  // Dynamically import expo-notifications to handle cases where it's not available
  let Notifications;
  try {
    Notifications = await import('expo-notifications');
  } catch (error) {
    console.warn('expo-notifications is not available. Push notifications require a development build.');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notifications!');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  } catch (error) {
    console.warn('Failed to register for push notifications:', error.message);
    return null;
  }

  if (sendToServer && token) {
    try {
      // send to backend via API
      await fetch(`${API_BASE_URL}/push/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header will be handled by api interceptor if you use it
        },
        body: JSON.stringify({ pushToken: token })
      });
    } catch (err) {
      console.error('Failed to register push token on server:', err);
    }
  }

  return token;
};

export default { registerForPushNotificationsAsync };
