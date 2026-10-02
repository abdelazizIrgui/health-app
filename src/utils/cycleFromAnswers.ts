import { Answers, UNKNOWN } from '../data/questions';
import { CycleSettings } from './cycle';

export type CycleProfile =
  | { ready: true; settings: CycleSettings }
  | { ready: false; reason: 'not_started' | 'pregnant' | 'no_date' };

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

const num = (v: unknown, fallback: number) => (typeof v === 'number' ? v : fallback);

/** "YYYY-MM-DD" -> local Date (avoids timezone shifts). */
const fromIsoDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Turns the questionnaire answers into cycle settings, or says why we can't yet. */
export function getCycleProfile(answers: Answers): CycleProfile {
  if (answers.hasHadPeriod === 'no') return { ready: false, reason: 'not_started' };

  const status = Array.isArray(answers.status) ? answers.status : [];
  if (status.includes('pregnant')) return { ready: false, reason: 'pregnant' };

  const last = answers.lastPeriodStart;
  if (typeof last !== 'string' || last === UNKNOWN) return { ready: false, reason: 'no_date' };

  const cycleLength = num(answers.cycleLength, DEFAULT_CYCLE_LENGTH);
  // The bleeding can never be as long as the whole cycle.
  const periodLength = Math.min(num(answers.periodLength, DEFAULT_PERIOD_LENGTH), cycleLength - 1);

  return {
    ready: true,
    settings: { lastPeriodStart: fromIsoDate(last), cycleLength, periodLength },
  };
}
