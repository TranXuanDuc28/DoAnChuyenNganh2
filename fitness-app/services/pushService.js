import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { notificationAPI, API_BASE_URL } from './api';

// Registers for push notifications and sends token to backend
export const registerForPushNotificationsAsync = async (sendToServer = true) => {
  let token;
  if (!Constants.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return null;
  }

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
