import type { UserProfile } from '../context/UserContext';
import type { DayLog } from '../data/logOptions';
import type { Answer, Answers } from '../data/questions';
import type { PeriodEntry } from './forecast';

/** Everything that is saved on the device, in one piece of text she can keep. */
export interface Backup {
  app: 'rosy';
  version: 1;
  exportedAt: string; // ISO date-time
  user: UserProfile;
  answers: Answers;
  onboardingDone: boolean;
  periods: PeriodEntry[];
  logs: Record<string, DayLog>;
}

const APP_ID = 'rosy';
const VERSION = 1;
const MAX_LENGTH = 2_000_000; // far more than years of daily logs
const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function buildBackup(data: Omit<Backup, 'app' | 'version' | 'exportedAt'>): string {
  const backup: Backup = {
    app: APP_ID,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    ...data,
  };
  return JSON.stringify(backup);
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** A real calendar date written as "YYYY-MM-DD". */
const isIsoDate = (v: unknown): v is string => {
  if (typeof v !== 'string' || !ISO_PATTERN.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

const isAnswer = (v: unknown): v is Answer =>
  v === null || typeof v === 'string' || typeof v === 'number' || isStringArray(v);

/**
 * Reads backup text. Returns null if anything is wrong, so a damaged or foreign text
 * can never overwrite the data on the device.
 */
export function parseBackup(text: string): Backup | null {
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (!isObject(raw) || raw.app !== APP_ID || raw.version !== VERSION) return null;

  const { user, answers, onboardingDone, periods, logs } = raw;
  if (!isObject(user) || !isObject(answers) || !isObject(logs) || !Array.isArray(periods)) {
    return null;
  }
  if (typeof onboardingDone !== 'boolean') return null;
  if (
    typeof user.name !== 'string' ||
    typeof user.email !== 'string' ||
    typeof user.phone !== 'string' ||
    typeof user.language !== 'string' ||
    !isIsoDate(user.birthDate)
  ) {
    return null;
  }

  const cleanAnswers: Answers = {};
  for (const [id, value] of Object.entries(answers)) {
    if (!isAnswer(value)) return null;
    cleanAnswers[id] = value;
  }

  const cleanPeriods: PeriodEntry[] = [];
  for (const p of periods) {
    if (!isObject(p) || !isIsoDate(p.start)) return null;
    if (p.end === undefined) {
      cleanPeriods.push({ start: p.start });
    } else {
      if (!isIsoDate(p.end) || p.end < p.start) return null;
      cleanPeriods.push({ start: p.start, end: p.end });
    }
  }
  cleanPeriods.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

  const cleanLogs: Record<string, DayLog> = {};
  for (const [date, value] of Object.entries(logs)) {
    if (!isIsoDate(date) || !isObject(value)) return null;
    const log: DayLog = {};
    if (value.flow !== undefined) {
      if (typeof value.flow !== 'string') return null;
      log.flow = value.flow;
    }
    if (value.mood !== undefined) {
      if (typeof value.mood !== 'string') return null;
      log.mood = value.mood;
    }
    if (value.symptoms !== undefined) {
      if (!isStringArray(value.symptoms)) return null;
      log.symptoms = value.symptoms;
    }
    cleanLogs[date] = log;
  }

  return {
    app: APP_ID,
    version: VERSION,
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : '',
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate,
      language: user.language,
    },
    answers: cleanAnswers,
    onboardingDone,
    periods: cleanPeriods,
    logs: cleanLogs,
  };
}