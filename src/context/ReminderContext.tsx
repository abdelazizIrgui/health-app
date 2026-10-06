import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOTIFICATIONS_AVAILABLE, Notifications } from '../notifications';

import { useI18n } from '../i18n/I18nContext';
import { getCycleProfile } from '../utils/cycleFromAnswers';
import { buildForecast } from '../utils/forecast';
import {
  DEFAULT_REMINDERS,
  ReminderSettings,
  parseReminders,
  periodReminderDates,
} from '../utils/reminders';
import { useCycle } from './CycleContext';
import { useUser } from './UserContext';

const STORAGE_KEY = '@health_app/reminders';
const CHANNEL_ID = 'reminders';
const SUPPORTED = NOTIFICATIONS_AVAILABLE; // false in Expo Go: the reminders then do nothing

// Show a reminder as a banner even while the app is open.
if (SUPPORTED) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export type UpdateResult = 'ok' | 'denied';

interface ReminderContextValue {
  settings: ReminderSettings;
  loading: boolean;
  /** False when the app cannot estimate a next period yet (no heads-up can be planned). */
  hasForecast: boolean;
  /** Changes some settings. Returns 'denied' (and changes nothing) if the phone refuses notifications. */
  update: (patch: Partial<ReminderSettings>) => Promise<UpdateResult>;
}

const ReminderContext = createContext<ReminderContextValue | undefined>(undefined);

async function ensurePermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

/**
 * Keeps the phone's scheduled notifications in line with her settings and her cycle.
 * Everything is local: nothing is sent to a server. Must be inside the User, Cycle and I18n providers.
 */
export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const { user, answers, loading: userLoading } = useUser();
  const { periods, loading: cycleLoading } = useCycle();
  const { t } = useI18n();

  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDERS);
  const [loading, setLoading] = useState(true);
  const runId = useRef(0); // only the latest scheduling run is allowed to finish

  useEffect(() => {
    (async () => {
      try {
        setSettings(parseReminders(await AsyncStorage.getItem(STORAGE_KEY)));
      } catch (e) {
        console.warn('Could not read the reminders', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Her cycle, as far as the reminders are concerned.
  const profile = useMemo(() => getCycleProfile(answers), [answers]);
  const paused = !profile.ready && profile.reason === 'pregnant';
  const forecast = useMemo(
    () => (paused ? null : buildForecast(periods, profile.ready ? profile.settings : null)),
    [paused, periods, profile]
  );
  const hasForecast = forecast !== null;

  // Plan the notifications again whenever something that affects them changes.
  useEffect(() => {
    if (!SUPPORTED || loading || userLoading || cycleLoading) return;
    const id = ++runId.current;
    const stale = () => id !== runId.current;

    (async () => {
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        if (stale() || !user) return;
        if (!settings.period && !settings.daily) return;
        if (!(await Notifications.getPermissionsAsync()).granted) return;
        if (stale()) return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
            name: t('reminders.title'),
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
        const title = t('reminders.notif.title');

        if (settings.daily) {
          await Notifications.scheduleNotificationAsync({
            content: { title, body: t('reminders.notif.daily') },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: settings.hour,
              minute: settings.minute,
              channelId: CHANNEL_ID,
            },
          });
        }

        if (settings.period && forecast) {
          const dates = periodReminderDates(forecast, settings.periodDaysBefore);
          for (const date of dates) {
            if (stale()) return;
            await Notifications.scheduleNotificationAsync({
              content: { title, body: t('reminders.notif.period') },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date,
                channelId: CHANNEL_ID,
              },
            });
          }
        }
      } catch (e) {
        console.warn('Could not schedule the reminders', e);
      }
    })();
  }, [settings, forecast, user, t, loading, userLoading, cycleLoading]);

  // "Delete all data" also turns the reminders off.
  useEffect(() => {
    if (!userLoading && !user) {
      setSettings(DEFAULT_REMINDERS);
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    }
  }, [user, userLoading]);

  const update = useCallback(
    async (patch: Partial<ReminderSettings>): Promise<UpdateResult> => {
      const next = { ...settings, ...patch };
      const turnsOn =
        (patch.period === true && !settings.period) || (patch.daily === true && !settings.daily);
      if (turnsOn && !(await ensurePermission())) return 'denied';
      setSettings(next);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save the reminders', e);
      }
      return 'ok';
    },
    [settings]
  );

  const value = useMemo(
    () => ({ settings, loading, hasForecast, update }),
    [settings, loading, hasForecast, update]
  );
  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>;
}

export function useReminders(): ReminderContextValue {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error('useReminders must be used inside <ReminderProvider>');
  return ctx;
}