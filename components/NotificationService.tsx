import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Alert, Platform } from 'react-native';

/**
 * Registers the device for push notifications and returns the Expo push token.
 * Must be called on a physical device.
 * 
 * @returns {Promise<string | null>} The Expo push token or null if registration fails.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Check if running on a physical device
    if (!Device.isDevice) {
      alert('Must use a physical device for Push Notifications');
      return null;
    }

    // Check and request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus: Notifications.PermissionStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Notification permission not granted. Please enable it in system settings.');
      return null;
    }

    // Get Expo push token
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    const token = tokenResponse.data;
    console.log('Expo Push Token:', token);

    // Android-specific notification channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  } 
  catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}
