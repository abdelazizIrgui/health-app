import type { LanguageCode } from '../languages';
import { calendarTexts } from './calendarTexts';
import { insightsTexts } from './insightsTexts';
import { logTexts } from './logTexts';

/**
 * All the extra translation files in one place.
 * When you add a new texts file (for example alertsTexts.ts), add one line per language here.
 */
export const extraTexts: Record<LanguageCode, Record<string, string>> = {
  en: { ...logTexts.en, ...calendarTexts.en, ...insightsTexts.en },
  ar: { ...logTexts.ar, ...calendarTexts.ar, ...insightsTexts.ar },
  fr: { ...logTexts.fr, ...calendarTexts.fr, ...insightsTexts.fr },
  es: { ...logTexts.es, ...calendarTexts.es, ...insightsTexts.es },
  de: { ...logTexts.de, ...calendarTexts.de, ...insightsTexts.de },
  pt: { ...logTexts.pt, ...calendarTexts.pt, ...insightsTexts.pt },
};