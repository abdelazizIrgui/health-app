import { useEffect, useState } from 'react';

import { useUser } from '../context/UserContext';
import { NOTIFICATIONS_AVAILABLE, Notifications } from '../notifications';
import { navigationRef } from '../navigation/navigationRef';
import { isKind } from '../utils/inbox';

// Remembers which tap was already handled, so the same tap never opens the tab twice.
let lastHandled: string | null = null;

interface Props {
  /** True once the navigation container has mounted its first navigator. */
  navReady: boolean;
}

/**
 * When she taps one of our reminders (in the notification shade, on the lock screen, or on the
 * banner while the app is open), the app opens on the Alerts tab so she can read the advice.
 * It also works when the app was closed: the tap that launched it is read at start-up.
 * Renders nothing. Must be inside the User provider.
 */
export default function NotificationTapHandler({ navReady }: Props) {
  const { user, signedIn, onboardingDone, loading } = useUser();
  const [pending, setPending] = useState(false);

  // 1) Hear about taps (and the tap that launched the app).
  useEffect(() => {
    if (!NOTIFICATIONS_AVAILABLE) return;
    let active = true;

    const onResponse = (response: {
      notification: { request: { identifier: string; content: { data?: unknown } } };
    }) => {
      const { identifier, content } = response.notification.request;
      const kind = (content.data as { kind?: unknown } | undefined)?.kind;
      if (!isKind(kind) || identifier === lastHandled) return;
      lastHandled = identifier;
      if (active) setPending(true);
    };

    Notifications.getLastNotificationResponseAsync()
      .then((r) => r && onResponse(r))
      .catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(onResponse);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  // 2) Go to the Alerts tab as soon as the app is ready to show it.
  const canOpen = navReady && !loading && !!user && signedIn && onboardingDone;
  useEffect(() => {
    if (!pending || !canOpen || !navigationRef.isReady()) return;
    navigationRef.navigate('Main', { screen: 'Inbox' });
    setPending(false);
  }, [pending, canOpen]);

  return null;
}