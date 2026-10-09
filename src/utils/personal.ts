import type { Answers } from '../data/questions';

/** Notes on the Home screen that come from the questionnaire answers. */

/** The PMS note is shown only this many days before the expected period. */
export const PMS_DAYS = 5;

/** The chosen options of a multi-select answer, without the "none" option. */
function chosen(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string' && v !== 'none');
}

/** The symptoms she says she usually gets before her period. */
export const usualPmsSymptoms = (answers: Answers): string[] => chosen(answers.pmsSymptoms);

/** Things from her lifestyle answer that can make a period late (weight, exercise, stress). */
export const lateReasons = (answers: Answers): string[] => chosen(answers.lifestyle);

/** True in the last 5 days before the period, but not while bleeding or when the period is late. */
export function isPmsWindow(f: {
  onPeriod: boolean;
  daysLate: number;
  daysUntilPeriod: number;
}): boolean {
  if (f.onPeriod || f.daysLate > 0) return false;
  return f.daysUntilPeriod >= 1 && f.daysUntilPeriod <= PMS_DAYS;
}