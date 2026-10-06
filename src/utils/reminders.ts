/** Rules of the reminders. No phone code in here, so they can be tested. */

export interface ReminderSettings {
  /** A heads-up a few days before the expected period. */
  period: boolean;
  periodDaysBefore: number; // 1 to 5
  /** A repeating "how was your day" reminder. */
  daily: boolean;
  hour: number; // 0 to 23
  minute: number; // 0 to 59
}

export const DEFAULT_REMINDERS: ReminderSettings = {
  period: false,
  periodDaysBefore: 2,
  daily: false,
  hour: 21,
  minute: 0,
};

export const MIN_DAYS_BEFORE = 1;
export const MAX_DAYS_BEFORE = 5;

/** The heads-up arrives at this hour, whatever the daily reminder time is. */
export const PERIOD_REMINDER_HOUR = 9;

/** How many coming cycles get a heads-up (so it still works if she does not open the app). */
const CYCLES_AHEAD = 3;

const isInt = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;

/** Reads the saved text. Anything unexpected falls back to the defaults, field by field. */
export function parseReminders(raw: string | null): ReminderSettings {
  if (!raw) return DEFAULT_REMINDERS;
  try {
    const r = JSON.parse(raw);
    if (typeof r !== 'object' || r === null) return DEFAULT_REMINDERS;
    return {
      period: r.period === true,
      periodDaysBefore: isInt(r.periodDaysBefore, MIN_DAYS_BEFORE, MAX_DAYS_BEFORE)
        ? r.periodDaysBefore
        : DEFAULT_REMINDERS.periodDaysBefore,
      daily: r.daily === true,
      hour: isInt(r.hour, 0, 23) ? r.hour : DEFAULT_REMINDERS.hour,
      minute: isInt(r.minute, 0, 59) ? r.minute : DEFAULT_REMINDERS.minute,
    };
  } catch {
    return DEFAULT_REMINDERS;
  }
}

/** The part of a forecast the reminders need (so tests do not have to build a full one). */
export interface ReminderForecast {
  earliestStart: Date;
  cycleLength: number;
}

/**
 * When to send the "period is coming" heads-up for the next cycles.
 * Uses the earliest day of the expected range, so an irregular cycle is never missed.
 * Dates that are already in the past are skipped.
 */
export function periodReminderDates(
  forecast: ReminderForecast,
  daysBefore: number,
  now: Date = new Date()
): Date[] {
  const dates: Date[] = [];
  const start = forecast.earliestStart;
  for (let k = 0; k < CYCLES_AHEAD; k++) {
    const when = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + k * forecast.cycleLength - daysBefore,
      PERIOD_REMINDER_HOUR,
      0,
      0
    );
    if (when.getTime() > now.getTime()) dates.push(when);
  }
  return dates;
}

/** "07:05" style text for a time (the picker shows its own, this is for labels and tests). */
export const formatTime = (hour: number, minute: number) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;