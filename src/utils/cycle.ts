export interface CycleSettings {
  lastPeriodStart: Date;
  cycleLength: number; // days, e.g. 28
  periodLength: number; // days, e.g. 5
}

export type CyclePhase = 'menstrual' | 'follicular' | 'fertile' | 'luteal';

/** Language-free result; the screen turns it into text with the translation files. */
export interface CycleStatus {
  day: number; // current cycle day (1-based)
  phase: CyclePhase;
  daysUntilPeriod: number | null; // null while she is on her period
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Strip time so day differences are not affected by the hour. */
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Works out the cycle day and phase from the last period start.
 * Ovulation is estimated 14 days before the next period; the fertile
 * window is the 5 days before ovulation plus ovulation day and the day after.
 * This is an estimate only, not medical advice.
 */
export function getCycleStatus(settings: CycleSettings, today = new Date()): CycleStatus {
  const { lastPeriodStart, cycleLength, periodLength } = settings;

  const elapsed = Math.round(
    (startOfDay(today).getTime() - startOfDay(lastPeriodStart).getTime()) / DAY_MS
  );
  // Wrap around so old start dates still map into the current cycle.
  const day = (((elapsed % cycleLength) + cycleLength) % cycleLength) + 1;

  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 5;
  const fertileEnd = ovulationDay + 1;

  if (day <= periodLength) {
    return { day, phase: 'menstrual', daysUntilPeriod: null };
  }

  const daysUntilPeriod = cycleLength - day + 1;
  if (day >= fertileStart && day <= fertileEnd) {
    return { day, phase: 'fertile', daysUntilPeriod };
  }
  return { day, phase: day < fertileStart ? 'follicular' : 'luteal', daysUntilPeriod };
}