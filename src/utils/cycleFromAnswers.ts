import { Answers, UNKNOWN } from '../data/questions';
import { CycleSettings } from './cycle';

export type CycleProfile =
  | { ready: true; settings: CycleSettings }
  | { ready: false; reason: 'not_started' | 'pregnant' | 'no_date' };

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

const DEFAULT_SPREAD = 6; // "mostly regular" or no answer
const CALM_SPREAD = 4; // "always regular", pill or ring
const WIDE_SPREAD = 14; // very unpredictable

const num = (v: unknown, fallback: number) => (typeof v === 'number' ? v : fallback);

/** A multi-select answer as a list of text values (anything else gives an empty list). */
const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

/** "YYYY-MM-DD" -> local Date (avoids timezone shifts). */
const fromIsoDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Age in whole years on `today`. Gives null when the date is missing, wrong or in the future. */
export function ageInYears(birthDate: unknown, today: Date = new Date()): number | null {
  if (typeof birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const [y, m, d] = birthDate.split('-').map(Number);
  const born = new Date(y, m - 1, d);
  // Rejects dates that do not exist, such as 2000-02-31.
  if (born.getFullYear() !== y || born.getMonth() !== m - 1 || born.getDate() !== d) return null;
  if (born.getTime() > today.getTime()) return null;

  const hadBirthday =
    today.getMonth() > m - 1 || (today.getMonth() === m - 1 && today.getDate() >= d);
  return today.getFullYear() - y - (hadBirthday ? 0 : 1);
}

/** The starting spread from how regular she says she is. */
function spreadFromRegularity(regularity: unknown): number {
  switch (regularity) {
    case 'always':
      return CALM_SPREAD;
    case 'mostly':
      return DEFAULT_SPREAD;
    case 'rarely':
      return WIDE_SPREAD;
    default:
      return DEFAULT_SPREAD;
  }
}

/**
 * How many days apart the earliest and the latest likely start of the next period are,
 * guessed from the questionnaire alone (before she has logged enough cycles of her own).
 * Little spread = one single day, more than 7 = a range (see forecast.ts).
 */
export function expectedSpread(answers: Answers, today: Date = new Date()): number {
  const status = list(answers.status);
  const diagnosis = list(answers.diagnosis);

  // 1) Start from how regular she says she is.
  let spread = spreadFromRegularity(answers.regularity);

  // 2) Hormonal contraception: pill and ring give a calm bleed, the rest is unpredictable.
  if (status.includes('hormonal')) {
    const type = answers.hormonalType;
    spread = type === 'pill' || type === 'ringPatch' ? CALM_SPREAD : WIDE_SPREAD;
  }

  // 3) Situations that make the cycle less predictable only ever widen the range.
  const widen = (days: number) => {
    spread = Math.max(spread, days);
  };
  if (diagnosis.includes('pcos')) widen(WIDE_SPREAD);
  if (status.includes('postpartum') || status.includes('perimenopause')) widen(WIDE_SPREAD);
  if (answers.breastfeeding === 'exclusive') widen(WIDE_SPREAD);
  if (answers.recentChange === 'yes') widen(10);

  const age = ageInYears(answers.birthDate, today);
  if (age !== null) {
    // The first two years after the first period are often irregular.
    if (typeof answers.firstPeriodAge === 'number' && age - answers.firstPeriodAge <= 2) {
      widen(WIDE_SPREAD);
    }
    // After 40 the cycle slowly becomes less regular.
    if (age >= 45) widen(10);
    else if (age >= 40) widen(8);
  }

  return spread;
}

/** Turns the questionnaire answers into cycle settings, or says why we can't yet. */
export function getCycleProfile(answers: Answers, today: Date = new Date()): CycleProfile {
  if (answers.hasHadPeriod === 'no') return { ready: false, reason: 'not_started' };

  const status = list(answers.status);
  if (status.includes('pregnant')) return { ready: false, reason: 'pregnant' };

  const last = answers.lastPeriodStart;
  if (typeof last !== 'string' || last === UNKNOWN) return { ready: false, reason: 'no_date' };

  const cycleLength = num(answers.cycleLength, DEFAULT_CYCLE_LENGTH);
  // The bleeding can never be as long as the whole cycle.
  const periodLength = Math.min(num(answers.periodLength, DEFAULT_PERIOD_LENGTH), cycleLength - 1);

  return {
    ready: true,
    settings: {
      lastPeriodStart: fromIsoDate(last),
      cycleLength,
      periodLength,
      spreadDays: expectedSpread(answers, today),
      noFertileWindow: status.includes('hormonal'),
    },
  };
}