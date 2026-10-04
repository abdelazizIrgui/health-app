import type { DayLog } from '../data/logOptions';
import type { CycleSettings } from './cycle';
import { PeriodEntry, fromIsoDate, toIsoDate } from './forecast';

export type AlertId = 'shortCycle' | 'longCycle' | 'longPeriod' | 'heavyFlow' | 'missed';

/** Language-free: the component turns `id` + `params` into text with the translation files. */
export interface HealthAlert {
  id: AlertId;
  params: Record<string, number>;
}

// Same limits as forecast.ts and insights.ts, so the three agree about what a "cycle" is.
const MIN_CYCLE = 15; // shorter gaps are probably spotting or a wrong tap: ignored
const MAX_CYCLE = 60; // longer gaps are probably a forgotten log: ignored

// Limits from the app plan.
const SHORT_CYCLE = 21; // a cycle shorter than this is worth mentioning to a doctor
const LONG_CYCLE_ADULT = 35; // longer than this is worth mentioning...
const LONG_CYCLE_TEEN = 45; // ...except for teenagers, whose cycles can be longer
const TEEN_UNDER_AGE = 18;
const LONG_PERIOD_DAYS = 7; // bleeding longer than this
const MISSED_DAYS = 90; // no period for about 3 months

// Chosen for this app (the plan gives no number for "very heavy"): 3 heavy days out of the last 7.
const HEAVY_DAYS = 3;
const HEAVY_WINDOW = 7;

// Notes about "your last cycle" are shown only during the cycle that follows it.
const RECENT_DAYS = 45;

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const diffDays = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);

interface Input {
  periods: PeriodEntry[]; // oldest first
  logs: Record<string, DayLog>;
  seed: CycleSettings | null; // the questionnaire's last period
  birthDate?: string; // "YYYY-MM-DD"
  today?: Date;
}

/**
 * Gentle "worth mentioning to a doctor" notes. They are general information, not a diagnosis.
 * The caller should not show them while predictions are paused for pregnancy.
 */
export function buildHealthAlerts({
  periods,
  logs,
  seed,
  birthDate,
  today = new Date(),
}: Input): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const t0 = startOfDay(today);

  // Heavy flow does not need any period dates.
  let heavyDays = 0;
  for (let i = 0; i < HEAVY_WINDOW; i++) {
    if (logs[toIsoDate(addDays(t0, -i))]?.flow === 'heavy') heavyDays++;
  }
  if (heavyDays >= HEAVY_DAYS) alerts.push({ id: 'heavyFlow', params: {} });

  // All known period start dates, including the questionnaire's if she has not logged it.
  const starts = periods.map((p) => p.start);
  if (seed) {
    const seedStart = toIsoDate(seed.lastPeriodStart);
    if (!starts.includes(seedStart)) starts.push(seedStart);
  }
  starts.sort();
  if (starts.length === 0) return alerts;

  const lastStart = fromIsoDate(starts[starts.length - 1]);
  const sinceLast = diffDays(lastStart, t0);

  if (sinceLast >= MISSED_DAYS) {
    alerts.push({ id: 'missed', params: {} });
    return alerts; // older notes about earlier cycles would only add noise
  }
  if (sinceLast > RECENT_DAYS) return alerts;

  // Bleeding longer than 7 days (her latest logged period).
  const lastLogged = periods[periods.length - 1];
  if (lastLogged) {
    const start = fromIsoDate(lastLogged.start);
    const days = lastLogged.end
      ? diffDays(start, fromIsoDate(lastLogged.end)) + 1
      : diffDays(start, t0) + 1; // still open: count the days so far
    if (days > LONG_PERIOD_DAYS && days <= 14) alerts.push({ id: 'longPeriod', params: { n: days } });
  }

  // Length of her last cycle (between her two most recent period starts).
  if (starts.length >= 2) {
    const length = diffDays(fromIsoDate(starts[starts.length - 2]), lastStart);
    if (length >= MIN_CYCLE && length <= MAX_CYCLE) {
      let max = LONG_CYCLE_ADULT;
      if (birthDate) {
        const age = Math.floor(diffDays(fromIsoDate(birthDate), t0) / 365.25);
        if (age < TEEN_UNDER_AGE) max = LONG_CYCLE_TEEN;
      }
      if (length < SHORT_CYCLE) alerts.push({ id: 'shortCycle', params: { n: length } });
      else if (length > max) alerts.push({ id: 'longCycle', params: { n: length, max } });
    }
  }

  return alerts;
}