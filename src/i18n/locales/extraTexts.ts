import type { LanguageCode } from '../languages';
import { accountTexts } from './accountTexts';
import { alertsTexts } from './alertsTexts';
import { backupTexts } from './backupTexts';
import { calendarTexts } from './calendarTexts';
import { chatTexts } from './chatTexts';
import { insightsTexts } from './insightsTexts';
import { lockTexts } from './lockTexts';
import { logTexts } from './logTexts';
import { remindersTexts } from './remindersTexts';
import { reportTexts } from './reportTexts';
import { inboxTexts } from './inboxTexts';
/**
 * All the extra translation files in one place.
 * When you add a new texts file, add one line per language here.
 */
export const extraTexts: Record<LanguageCode, Record<string, string>> = {
  en: {
    ...logTexts.en,
    ...calendarTexts.en,
    ...insightsTexts.en,
    ...accountTexts.en,
    ...alertsTexts.en,
    ...backupTexts.en,
    ...lockTexts.en,
    ...remindersTexts.en,
    ...reportTexts.en,
    ...inboxTexts.en,
    ...chatTexts.en,
  },
  ar: {
    ...logTexts.ar,
    ...calendarTexts.ar,
    ...insightsTexts.ar,
    ...accountTexts.ar,
    ...alertsTexts.ar,
    ...backupTexts.ar,
    ...lockTexts.ar,
    ...remindersTexts.ar,
    ...reportTexts.ar,
    ...inboxTexts.ar,
    ...chatTexts.ar,
  },
  fr: {
    ...logTexts.fr,
    ...calendarTexts.fr,
    ...insightsTexts.fr,
    ...accountTexts.fr,
    ...alertsTexts.fr,
    ...backupTexts.fr,
    ...lockTexts.fr,
    ...remindersTexts.fr,
    ...reportTexts.fr,
    ...inboxTexts.fr,
    ...chatTexts.fr,
  },
  es: {
    ...logTexts.es,
    ...calendarTexts.es,
    ...insightsTexts.es,
    ...accountTexts.es,
    ...alertsTexts.es,
    ...backupTexts.es,
    ...lockTexts.es,
    ...remindersTexts.es,
    ...reportTexts.es,
    ...inboxTexts.es,
    ...chatTexts.es,
  },
  de: {
    ...logTexts.de,
    ...calendarTexts.de,
    ...insightsTexts.de,
    ...accountTexts.de,
    ...alertsTexts.de,
    ...backupTexts.de,
    ...lockTexts.de,
    ...remindersTexts.de,
    ...reportTexts.de,
    ...inboxTexts.de,
    ...chatTexts.de,
  },
  pt: {
    ...logTexts.pt,
    ...calendarTexts.pt,
    ...insightsTexts.pt,
    ...accountTexts.pt,
    ...alertsTexts.pt,
    ...backupTexts.pt,
    ...lockTexts.pt,
    ...remindersTexts.pt,
    ...reportTexts.pt,
    ...inboxTexts.pt,
    ...chatTexts.pt,
  },
};