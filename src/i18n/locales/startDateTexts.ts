import type { SplitLanguageCode } from '../languages';

/** "My period started earlier" (for someone who installs the app during her period). */
export const startDateTexts: Record<SplitLanguageCode, Record<string, string>> = {
  en: {
    'cycle.startedEarlier': 'My period started earlier',
    'cycle.startedTitle': 'When did your period start?',
    'cycle.yesterday': 'Yesterday',
    'cycle.daysAgo.other': '{n} days ago',
  },
  ar: {
    'cycle.startedEarlier': 'بدأ الحيض قبل أيام',
    'cycle.startedTitle': 'متى بدأ حيضك؟',
    'cycle.yesterday': 'أمس',
    'cycle.daysAgo.two': 'قبل يومين',
    'cycle.daysAgo.few': 'قبل {n} أيام',
    'cycle.daysAgo.other': 'قبل {n} يومًا',
  },
  fr: {
    'cycle.startedEarlier': 'Mes règles ont commencé avant',
    'cycle.startedTitle': 'Quand tes règles ont-elles commencé ?',
    'cycle.yesterday': 'Hier',
    'cycle.daysAgo.other': 'Il y a {n} jours',
  },
  es: {
    'cycle.startedEarlier': 'Mi regla empezó antes',
    'cycle.startedTitle': '¿Cuándo empezó tu regla?',
    'cycle.yesterday': 'Ayer',
    'cycle.daysAgo.other': 'Hace {n} días',
  },
  de: {
    'cycle.startedEarlier': 'Meine Periode hat früher begonnen',
    'cycle.startedTitle': 'Wann hat deine Periode begonnen?',
    'cycle.yesterday': 'Gestern',
    'cycle.daysAgo.other': 'Vor {n} Tagen',
  },
  pt: {
    'cycle.startedEarlier': 'A minha menstruação começou antes',
    'cycle.startedTitle': 'Quando começou a tua menstruação?',
    'cycle.yesterday': 'Ontem',
    'cycle.daysAgo.other': 'Há {n} dias',
  },
};