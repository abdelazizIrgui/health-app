import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NOTIFICATIONS_AVAILABLE, Notifications } from '../notifications';
import { getCycleProfile } from '../utils/cycleFromAnswers';
import { buildForecast } from '../utils/forecast';
import {
  InboxItem,
  InboxKind,
  InboxState,
  dueReminders,
  makeItem,
  markAllRead as markAllReadIn,
  markRead as markReadIn,
  mergeItems,
  parseInbox,
  unreadCount,
} from '../utils/inbox';
import { useCycle } from './CycleContext';
import { useReminders } from './ReminderContext';
import { useUser } from './UserContext';

const STORAGE_KEY = '@rosy/inbox';

interface InboxContextValue {
  /** Messages that reached her as notifications, newest first. */
  items: InboxItem[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

const InboxContext = createContext<InboxContextValue | undefined>(undefined);

/**
 * Keeps every reminder that was delivered, so she can find it again (read or not) from the
 * bell next to the calendar. Local only. Must be inside the User, Cycle and Reminder providers.
 */
export function InboxProvider({ children }: { children: React.ReactNode }) {
  const { user, answers, loading: userLoading } = useUser();
  const { periods, loading: cycleLoading } = useCycle();
  const { settings, loading: remindersLoading } = useReminders();

  const [state, setState] = useState<InboxState | null>(null); // null until read from storage
  const stateRef = useRef<InboxState | null>(null);
  stateRef.current = state;

  useEffect(() => {
    (async () => {
      let raw: string | null = null;
      try {
        raw = await AsyncStorage.getItem(STORAGE_KEY);
      } catch (e) {
        console.warn('Could not read the inbox', e);
      }
      setState(parseInbox(raw, Date.now()));
    })();
  }, []);

  // Save after every change.
  useEffect(() => {
    if (!state) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.warn('Could not save the inbox', e)
    );
  }, [state]);

  // The same forecast the reminders were planned with.
  const profile = useMemo(() => getCycleProfile(answers), [answers]);
  const paused = !profile.ready && profile.reason === 'pregnant';
  const forecast = useMemo(
    () => (paused ? null : buildForecast(periods, profile.ready ? profile.settings : null)),
    [paused, periods, profile]
  );

  // Adds the reminders that came due since the last check (the phone may have shown them while
  // the app was closed). Runs when the app opens, comes back to the front, or settings change.
  const ready = !!state && !!user && !userLoading && !cycleLoading && !remindersLoading;
  const sync = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      const now = Date.now();
      const due = dueReminders(settings, forecast, prev.checkedAt, now);
      return { items: mergeItems(prev.items, due), checkedAt: now };
    });
  }, [settings, forecast]);

  useEffect(() => {
    if (!ready) return;
    sync();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && sync());
    // Also catch the exact moment when a reminder arrives while the app is open.
    const received = NOTIFICATIONS_AVAILABLE
      ? Notifications.addNotificationReceivedListener((n) => {
          const kind = n.request.content.data?.kind;
          if (kind !== 'daily' && kind !== 'period') return;
          const item = makeItem(kind as InboxKind, new Date(n.date));
          setState((prev) => (prev ? { ...prev, items: mergeItems(prev.items, [item]) } : prev));
        })
      : null;
    return () => {
      sub.remove();
      received?.remove();
    };
  }, [ready, sync]);

  // Signing out / "Delete all data" empties the inbox too.
  useEffect(() => {
    if (!userLoading && !user) {
      setState({ items: [], checkedAt: Date.now() });
    }
  }, [user, userLoading]);

  const markRead = useCallback(
    (id: string) =>
      setState((p) => (p ? { ...p, items: markReadIn(p.items, id) } : p)),
    []
  );
  const markAllRead = useCallback(
    () => setState((p) => (p ? { ...p, items: markAllReadIn(p.items) } : p)),
    []
  );
  const clear = useCallback(() => setState((p) => (p ? { ...p, items: [] } : p)), []);

  const items = state?.items ?? [];
  const value = useMemo(
    () => ({ items, unread: unreadCount(items), markRead, markAllRead, clear }),
    [items, markRead, markAllRead, clear]
  );
  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox(): InboxContextValue {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error('useInbox must be used inside <InboxProvider>');
  return ctx;
}