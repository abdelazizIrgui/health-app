import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

type NotificationsModule = typeof import('expo-notifications');

/**
 * Expo Go on Android crashes the app as soon as `expo-notifications` is imported
 * (the feature was removed from Expo Go in SDK 53). So the module is loaded only
 * in a real build of the app, never in Expo Go. In Expo Go the reminders simply do nothing.
 */
const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const onPhone = Platform.OS === 'ios' || Platform.OS === 'android';

let loaded: NotificationsModule | null = null;
if (onPhone && !inExpoGo) {
  try {
    loaded = require('expo-notifications');
  } catch (e) {
    console.warn('Notifications are not available', e);
  }
}

/** False in Expo Go and on the web. */
export const NOTIFICATIONS_AVAILABLE = loaded !== null;

/** Only use it when NOTIFICATIONS_AVAILABLE is true. */
export const Notifications = loaded as NotificationsModule;