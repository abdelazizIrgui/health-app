import type { CycleSettings } from './cycle';
import { Forecast, PeriodEntry, fromIsoDate, toIsoDate } from './forecast';

/** What the calendar paints on one day. A day can have more than one mark. */
export interface DayMarks {
  period?: boolean; // bleeding (logged, or from the questionnaire)
  predicted?: boolean; // expected period (estimate)
  fertile?: boolean; // fertile window (estimate)
}

const FUTURE_CYCLES = 3; // how many coming cycles are painted
const OPEN_PERIOD_MAX_DAYS = 10; // same limit as forecast.ts
const LUTEAL_DAYS = 14; // ovulation is estimated 14 days before the next period

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/**
 * Turns the logged periods and the forecast into marks per day ("YYYY-MM-DD").
 * Estimates only: not medical advice and not a method of contraception.
 */
export function buildMarks(
  periods: PeriodEntry[],
  seed: CycleSettings | null,
  forecast: Forecast | null,
  today: Date = new Date()
): Record<string, DayMarks> {
  const marks: Record<string, DayMarks> = {};
  const todayIso = toIsoDate(today);
  const mark = (d: Date, key: keyof DayMarks) => {
    const iso = toIsoDate(d);
    marks[iso] = { ...marks[iso], [key]: true };
  };

  // 1) Periods she logged, plus the one from the questionnaire if it is not logged yet.
  const items: PeriodEntry[] = [...periods];
  if (seed) {
    const seedStart = toIsoDate(seed.lastPeriodStart);
    if (!items.some((p) => p.start === seedStart)) {
      items.push({
        start: seedStart,
        end: toIsoDate(addDays(seed.lastPeriodStart, seed.periodLength - 1)),
      });
    }
  }
  items.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

  const bleedLength = forecast?.periodLength ?? seed?.periodLength ?? 5;
  items.forEach((p, i) => {
    const start = fromIsoDate(p.start);
    let end = p.end ? fromIsoDate(p.end) : addDays(start, bleedLength - 1);
    // The last period is still going on until she marks it as ended.
    if (!p.end && i === items.length - 1) {
      const cap = addDays(start, OPEN_PERIOD_MAX_DAYS - 1);
      const untilToday = today.getTime() < cap.getTime() ? today : cap;
      if (untilToday.getTime() > end.getTime()) end = untilToday;
    }
    for (let d = start; d.getTime() <= end.getTime(); d = addDays(d, 1)) mark(d, 'period');
  });

  if (!forecast) return marks;

  // 2) Predictions: only days after today, and never on top of a real period.
  const markFuture = (d: Date, key: 'predicted' | 'fertile') => {
    const iso = toIsoDate(d);
    if (marks[iso]?.period) return;
    if (key === 'predicted' ? iso > todayIso : iso >= todayIso) mark(d, key);
  };

  for (let k = 0; k < FUTURE_CYCLES; k++) {
    const start = addDays(forecast.nextStart, k * forecast.cycleLength);

    if (forecast.irregular) {
      // Irregular cycles: one range for the next period, no fertile window.
      if (k === 0) {
        for (
          let d = forecast.earliestStart;
          d.getTime() <= forecast.latestStart.getTime();
          d = addDays(d, 1)
        ) {
          markFuture(d, 'predicted');
        }
      }
      continue;
    }

    for (let i = 0; i < forecast.periodLength; i++) markFuture(addDays(start, i), 'predicted');

    const ovulation = addDays(start, -LUTEAL_DAYS);
    for (let i = -5; i <= 1; i++) markFuture(addDays(ovulation, i), 'fertile');
  }

  return marks;
}