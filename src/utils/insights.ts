import type { DayLog } from '../data/logOptions';
import type { CycleSettings } from './cycle';
import { PeriodEntry, fromIsoDate, toIsoDate } from './forecast';

// Keep these the same as in forecast.ts so the Home screen and Insights agree.
const MIN_CYCLE = 15; // shorter gaps are probably spotting or a wrong tap: ignored
const MAX_CYCLE = 60; // longer gaps are probably a forgotten log: ignored
const RECENT = 6; // only the last 6 cycles are used
const IRREGULAR_SPREAD = 7; // more than 7 days between shortest and longest = irregular

const DAY_MS = 24 * 60 * 60 * 1000;
const diffDays = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS);
const average = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

export interface CountItem {
  id: string;
  count: number;
}

export interface Insights {
  /** Last measured cycle lengths in days, oldest first (at most 6). */
  recent: number[];
  averageCycle: number | null;
  shortest: number | null;
  longest: number | null;
  /** null while there are fewer than 3 cycles to compare. */
  regular: boolean | null;
  averagePeriod: number | null;
  topSymptoms: CountItem[];
  topMoods: CountItem[];
  daysLogged: number;
}

function topCounts(ids: string[], limit: number): CountItem[] {
  const counts: Record<string, number> = {};
  ids.forEach((id) => {
    counts[id] = (counts[id] ?? 0) + 1;
  });
  return Object.entries(counts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Cycle statistics from the logged periods and counts from the daily logs. */
export function buildInsights(
  periods: PeriodEntry[],
  seed: CycleSettings | null,
  logs: Record<string, DayLog>
): Insights {
  // Start dates, including the questionnaire's last period if she has not logged it.
  const starts = periods.map((p) => p.start);
  if (seed) {
    const seedStart = toIsoDate(seed.lastPeriodStart);
    if (!starts.includes(seedStart)) starts.push(seedStart);
  }
  starts.sort();

  const lengths: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    const len = diffDays(fromIsoDate(starts[i - 1]), fromIsoDate(starts[i]));
    if (len >= MIN_CYCLE && len <= MAX_CYCLE) lengths.push(len);
  }
  const recent = lengths.slice(-RECENT);

  const spread = recent.length ? Math.max(...recent) - Math.min(...recent) : 0;

  const bleeds = periods
    .filter((p) => p.end)
    .map((p) => diffDays(fromIsoDate(p.start), fromIsoDate(p.end as string)) + 1)
    .filter((n) => n >= 1 && n <= 14)
    .slice(-RECENT);

  const entries = Object.values(logs);

  return {
    recent,
    averageCycle: recent.length ? Math.round(average(recent)) : null,
    shortest: recent.length ? Math.min(...recent) : null,
    longest: recent.length ? Math.max(...recent) : null,
    regular: recent.length >= 3 ? spread <= IRREGULAR_SPREAD : null,
    averagePeriod: bleeds.length ? Math.round(average(bleeds)) : null,
    topSymptoms: topCounts(entries.flatMap((l) => l.symptoms ?? []), 5),
    topMoods: topCounts(
      entries.flatMap((l) => (l.mood ? [l.mood] : [])),
      3
    ),
    daysLogged: entries.length,
  };
}