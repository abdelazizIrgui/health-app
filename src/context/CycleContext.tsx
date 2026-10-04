import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PeriodEntry, toIsoDate } from '../utils/forecast';
import { useUser } from './UserContext';

interface CycleContextValue {
  /** Logged periods, oldest first. */
  periods: PeriodEntry[];
  /** True until the saved periods have been read from storage. */
  loading: boolean;
  /** "My period started" (today by default). */
  startPeriod: (date?: Date) => Promise<void>;
  /** "My period ended" (today by default). */
  endPeriod: (date?: Date) => Promise<void>;
  /** Cancels what she logged today (a wrong tap). */
  undoToday: () => Promise<void>;
}

const PERIODS_KEY = '@health_app/periods';

const CycleContext = createContext<CycleContextValue | undefined>(undefined);

/** Keeps the period log on this device only. Must be placed inside <UserProvider>. */
export function CycleProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(PERIODS_KEY);
        if (saved) setPeriods(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not read saved periods', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Signing out removes her data from this device, including the period log.
  useEffect(() => {
    if (!userLoading && !user) {
      setPeriods([]);
      AsyncStorage.removeItem(PERIODS_KEY).catch(() => {});
    }
  }, [user, userLoading]);

  const save = useCallback(async (next: PeriodEntry[]) => {
    const sorted = [...next].sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
    setPeriods(sorted);
    try {
      await AsyncStorage.setItem(PERIODS_KEY, JSON.stringify(sorted));
    } catch (e) {
      console.warn('Could not save periods', e);
    }
  }, []);

  const startPeriod = useCallback(
    async (date: Date = new Date()) => {
      const iso = toIsoDate(date);
      if (periods.some((p) => p.start === iso)) return;
      await save([...periods, { start: iso }]);
    },
    [periods, save]
  );

  const endPeriod = useCallback(
    async (date: Date = new Date()) => {
      const iso = toIsoDate(date);
      const last = periods[periods.length - 1];
      if (!last || last.end || iso < last.start) return;
      await save([...periods.slice(0, -1), { ...last, end: iso }]);
    },
    [periods, save]
  );

  const undoToday = useCallback(async () => {
    const iso = toIsoDate(new Date());
    const last = periods[periods.length - 1];
    if (!last) return;
    if (last.end === iso) await save([...periods.slice(0, -1), { start: last.start }]);
    else if (last.start === iso) await save(periods.slice(0, -1));
  }, [periods, save]);

  const value = useMemo(
    () => ({ periods, loading, startPeriod, endPeriod, undoToday }),
    [periods, loading, startPeriod, endPeriod, undoToday]
  );

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
}

export function useCycle(): CycleContextValue {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycle must be used inside <CycleProvider>');
  return ctx;
}