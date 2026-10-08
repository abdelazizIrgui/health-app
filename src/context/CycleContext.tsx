import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DayLog } from '../data/logOptions';
import { PeriodEntry, toIsoDate } from '../utils/forecast';
import { useUser } from './UserContext';

interface CycleContextValue {
  /** Logged periods, oldest first. */
  periods: PeriodEntry[];
  /** Daily logs (flow, symptoms, mood), keyed by "YYYY-MM-DD". */
  logs: Record<string, DayLog>;
  /** Merges a change into one day's log (today by default). */
  saveLog: (patch: Partial<DayLog>, date?: Date) => Promise<void>;
  /** True until the saved periods have been read from storage. */
  loading: boolean;
  /** "My period started" (today by default). */
  startPeriod: (date?: Date) => Promise<void>;
  /** "My period ended" (today by default). */
  endPeriod: (date?: Date) => Promise<void>;
  /** Cancels what she logged today (a wrong tap). */
     /** Cancels what she logged today (a wrong tap). */
  undoToday: () => Promise<void>;
  /** Saves a period that already happened (start date, and end date if it is over). */
  logPastPeriod: (start: Date, end?: Date) => Promise<void>;
  /** Replaces the periods and daily logs with the ones read from a backup. */
  restoreCycle: (periods: PeriodEntry[], logs: Record<string, DayLog>) => Promise<void>;

}

const PERIODS_KEY = '@health_app/periods';
const LOGS_KEY = '@health_app/day_logs';

const CycleContext = createContext<CycleContextValue | undefined>(undefined);

/** Keeps the period log on this device only. Must be placed inside <UserProvider>. */
export function CycleProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const [periods, setPeriods] = useState<PeriodEntry[]>([]);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [saved, savedLogs] = await Promise.all([
          AsyncStorage.getItem(PERIODS_KEY),
          AsyncStorage.getItem(LOGS_KEY),
        ]);
        if (saved) setPeriods(JSON.parse(saved));
        if (savedLogs) setLogs(JSON.parse(savedLogs));
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
      setLogs({});
      AsyncStorage.multiRemove([PERIODS_KEY, LOGS_KEY]).catch(() => {});
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
    const logPastPeriod = useCallback(
    async (start: Date, end?: Date) => {
      const s = toIsoDate(start);
      const e = end ? toIsoDate(end) : undefined;
      if (e && e < s) return;
      if (periods.some((p) => p.start === s)) return;
      await save([...periods, e ? { start: s, end: e } : { start: s }]);
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

  const saveLog = useCallback(
    async (patch: Partial<DayLog>, date: Date = new Date()) => {
      const iso = toIsoDate(date);
      const merged: DayLog = { ...logs[iso], ...patch };
      // An empty day is removed instead of being stored as {}.
      const isEmpty = !merged.flow && !merged.mood && !(merged.symptoms && merged.symptoms.length);
      const next = { ...logs };
      if (isEmpty) delete next[iso];
      else next[iso] = merged;
      setLogs(next);
      try {
        await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save the daily log', e);
      }
    },
    [logs]
  );

  const restoreCycle = useCallback(
    async (restoredPeriods: PeriodEntry[], restoredLogs: Record<string, DayLog>) => {
      setPeriods(restoredPeriods);
      setLogs(restoredLogs);
      await AsyncStorage.multiSet([
        [PERIODS_KEY, JSON.stringify(restoredPeriods)],
        [LOGS_KEY, JSON.stringify(restoredLogs)],
      ]);
    },
    []
  );

    const value = useMemo(
    () => ({
      periods,
      logs,
      saveLog,
      loading,
      startPeriod,
      endPeriod,
      undoToday,
      logPastPeriod,
      restoreCycle,
    }),
    [periods, logs, saveLog, loading, startPeriod, endPeriod, undoToday, logPastPeriod, restoreCycle]
  );
  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
}

export function useCycle(): CycleContextValue {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycle must be used inside <CycleProvider>');
  return ctx;
}