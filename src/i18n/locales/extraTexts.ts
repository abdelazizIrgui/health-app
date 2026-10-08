import type { SplitLanguageCode } from '../languages';
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
import { countryTexts } from './countryTexts';
import { profileTexts } from './profileTexts';
import { startDateTexts } from './startDateTexts';

/**
 * All the extra translation files in one place.
 * When you add a new texts file, add one line per language here.
 */
export const extraTexts: Record<SplitLanguageCode, Record<string, string>> = {
  en: {
    ...logTexts.en,
    ...calendarTexts.en,
    ...insightsTexts.en,
    ...accountTexts.en,
    ...countryTexts.en, 
    ...profileTexts.en,  
    ...alertsTexts.en,
    ...backupTexts.en,
    ...lockTexts.en,
    ...remindersTexts.en,
    ...reportTexts.en,
    ...inboxTexts.en,
    ...chatTexts.en,
    ...startDateTexts.en,
    
  },
  ar: {
    ...logTexts.ar,
    ...calendarTexts.ar,
    ...insightsTexts.ar,
    ...accountTexts.ar,
    ...countryTexts.ar, 
    ...profileTexts.ar,  
    ...alertsTexts.ar,
    ...backupTexts.ar,
    ...lockTexts.ar,
    ...remindersTexts.ar,
    ...reportTexts.ar,
    ...inboxTexts.ar,
    ...chatTexts.ar,
    ...startDateTexts.ar,
  },
  fr: {
    ...logTexts.fr,
    ...calendarTexts.fr,
    ...insightsTexts.fr,
    ...accountTexts.fr,
    ...countryTexts.fr,
    ...profileTexts.fr,
    ...alertsTexts.fr,
    ...backupTexts.fr,
    ...lockTexts.fr,
    ...remindersTexts.fr,
    ...reportTexts.fr,
    ...inboxTexts.fr,
    ...chatTexts.fr,
    ...startDateTexts.fr,
  },
  es: {
    ...logTexts.es,
    ...calendarTexts.es,
    ...insightsTexts.es,
    ...accountTexts.es,
    ...countryTexts.es,
    ...profileTexts.es,
    ...alertsTexts.es,
    ...backupTexts.es,
    ...lockTexts.es,
    ...remindersTexts.es,
    ...reportTexts.es,
    ...inboxTexts.es,
    ...chatTexts.es,
    ...startDateTexts.es,
  },
  de: {
    ...logTexts.de,
    ...calendarTexts.de,
    ...insightsTexts.de,
    ...accountTexts.de,
    ...countryTexts.de, 
    ...profileTexts.de,  
    ...alertsTexts.de,
    ...backupTexts.de,
    ...lockTexts.de,
    ...remindersTexts.de,
    ...reportTexts.de,
    ...inboxTexts.de,
    ...chatTexts.de,
    ...startDateTexts.de,
  },
  pt: {
    ...logTexts.pt,
    ...calendarTexts.pt,
    ...insightsTexts.pt,
    ...accountTexts.pt,
    ...countryTexts.pt,
    ...profileTexts.pt,   
    ...alertsTexts.pt,
    ...backupTexts.pt,
    ...lockTexts.pt,
    ...remindersTexts.pt,
    ...reportTexts.pt,
    ...inboxTexts.pt,
    ...chatTexts.pt,
    ...startDateTexts.pt,
  },
};