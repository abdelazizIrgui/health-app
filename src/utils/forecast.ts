import type { CycleSettings } from './cycle';

/** One logged period. Dates are "YYYY-MM-DD" (local day, so no time-zone problems). */
export interface PeriodEntry {
  start: string;
  end?: string; // missing while the period is still going on
}

export type ForecastPhase = 'menstrual' | 'follicular' | 'fertile' | 'luteal';

/** Language-free result; the screen turns it into text with the translation files. */
export interface Forecast {
  day: number; // cycle day today (1 = first day of the last period)
  cycleLength: number; // average of her recent cycles
  periodLength: number;
  phase: ForecastPhase;
  onPeriod: boolean; // bleeding today
  openPeriod: boolean; // a period she logged and has not marked as ended yet
  daysUntilPeriod: number; // 0 or negative while we are inside the expected range
  daysLate: number; // more than 0 only after the whole expected range has passed
  nextStart: Date; // best guess for the next period
  earliestStart: Date; // start of the range (same as nextStart when regular)
  latestStart: Date; // end of the range (same as nextStart when regular)
  irregular: boolean; // cycles vary a lot -> show a range, hide the fertile window
  fertileStart: Date;
  fertileEnd: Date;
  cyclesUsed: number; // how many measured cycles the average is based on
}

const DAY_MS = 24 * 60 * 60 * 1000;

const MIN_CYCLE = 15; // shorter gaps are probably spotting or a wrong tap: ignored
const MAX_CYCLE = 60; // longer gaps are probably a forgotten log: ignored
const RECENT = 6; // average the last 6 cycles at most
const IRREGULAR_SPREAD = 7; // more than 7 days between shortest and longest = irregular
const OPEN_PERIOD_MAX_DAYS = 10; // a period never marked as ended stops counting after this
const LUTEAL_DAYS = 14; // ovulation is estimated 14 days before the next period

const pad = (n: number) => String(n).padStart(2, '0');

export const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromIsoDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const diffDays = (from: Date, to: Date) =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
const average = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/**
 * Predicts from what she logged, not from a fixed 28 days:
 * - cycle length = average of her last 3-6 measured cycles
 * - if the cycles vary by more than 7 days we give a range, not a single day
 * - the answers from the questionnaire (`seed`) are only the starting point
 * Estimates only: not medical advice and not a method of contraception.
 */
export function buildForecast(
  periods: PeriodEntry[],
  seed: CycleSettings | null,
  today: Date = new Date()
): Forecast | null {
  type Item = { start: Date; end: Date | null; logged: boolean };

  const items: Item[] = periods.map((p) => ({
    start: fromIsoDate(p.start),
    end: p.end ? fromIsoDate(p.end) : null,
    logged: true,
  }));
  if (seed && !items.some((i) => diffDays(i.start, seed.lastPeriodStart) === 0)) {
    items.push({
      start: startOfDay(seed.lastPeriodStart),
      end: addDays(seed.lastPeriodStart, seed.periodLength - 1),
      logged: false,
    });
  }
  if (items.length === 0) return null;
  items.sort((a, b) => a.start.getTime() - b.start.getTime());
  const last = items[items.length - 1];

  // Measured cycle lengths (start to start).
  const lengths: number[] = [];
  for (let i = 1; i < items.length; i++) {
    const len = diffDays(items[i - 1].start, items[i].start);
    if (len >= MIN_CYCLE && len <= MAX_CYCLE) lengths.push(len);
  }
  const recent = lengths.slice(-RECENT);
  const cycleLength = recent.length ? Math.round(average(recent)) : (seed?.cycleLength ?? 28);

  // Measured bleeding length.
  const bleeds = items
    .filter((i) => i.end)
    .map((i) => diffDays(i.start, i.end as Date) + 1)
    .filter((n) => n >= 1 && n <= 14)
    .slice(-RECENT);
  const periodLength = Math.min(
    bleeds.length ? Math.round(average(bleeds)) : (seed?.periodLength ?? 5),
    cycleLength - 1
  );

  // Where she is today.
  const t0 = startOfDay(today);
  const elapsed = Math.max(0, diffDays(last.start, t0));
  const day = elapsed + 1;
  const bleedingUntil = last.end ?? addDays(last.start, OPEN_PERIOD_MAX_DAYS - 1);
  const onPeriod = t0.getTime() <= bleedingUntil.getTime();
  const openPeriod = last.logged && !last.end && elapsed < OPEN_PERIOD_MAX_DAYS;

  // Next period: one day, or a range when her cycles vary a lot.
  const nextStart = addDays(last.start, cycleLength);
  const spread = recent.length >= 3 ? Math.max(...recent) - Math.min(...recent) : 0;
  const irregular = spread > IRREGULAR_SPREAD;
  const earliestStart = irregular ? addDays(last.start, Math.min(...recent)) : nextStart;
  const latestStart = irregular ? addDays(last.start, Math.max(...recent)) : nextStart;
  const daysUntilPeriod = diffDays(t0, nextStart);
  const daysLate = onPeriod ? 0 : Math.max(0, diffDays(latestStart, t0));

  // Fertile window (estimate): 5 days before ovulation, ovulation day, and the day after.
  const ovulation = addDays(nextStart, -LUTEAL_DAYS);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);

  let phase: ForecastPhase;
  if (onPeriod) phase = 'menstrual';
  else if (!irregular && t0 >= fertileStart && t0 <= fertileEnd) phase = 'fertile';
  else phase = t0 <= ovulation ? 'follicular' : 'luteal';

  return {
    day,
    cycleLength,
    periodLength,
    phase,
    onPeriod,
    openPeriod,
    daysUntilPeriod,
    daysLate,
    nextStart,
    earliestStart,
    latestStart,
    irregular,
    fertileStart,
    fertileEnd,
    cyclesUsed: recent.length,
  };
}