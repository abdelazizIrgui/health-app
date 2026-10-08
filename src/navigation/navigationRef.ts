import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './RootNavigator';

/** Lets code outside a screen (like the notification tap handler) move around the app. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();