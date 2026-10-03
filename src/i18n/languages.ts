export type LanguageCode = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'pt';

export interface Language {
  code: LanguageCode;
  /** Name in its own language (shown in the picker). */
  native: string;
  english: string;
  rtl: boolean;
  /** Locale used to format dates. `-u-nu-latn` keeps Western digits (1, 2, 3) in Arabic. */
  locale: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', native: 'English', english: 'English', rtl: false, locale: 'en-US' },
  { code: 'ar', native: 'العربية', english: 'Arabic', rtl: true, locale: 'ar-u-nu-latn' },
  { code: 'fr', native: 'Français', english: 'French', rtl: false, locale: 'fr-FR' },
  { code: 'es', native: 'Español', english: 'Spanish', rtl: false, locale: 'es-ES' },
  { code: 'de', native: 'Deutsch', english: 'German', rtl: false, locale: 'de-DE' },
  { code: 'pt', native: 'Português', english: 'Portuguese', rtl: false, locale: 'pt-PT' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const isLanguageCode = (value: unknown): value is LanguageCode =>
  LANGUAGES.some((l) => l.code === value);