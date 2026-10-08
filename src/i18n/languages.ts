export type LanguageCode = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'pt' | 'zh' | 'ru';

/**
 * Languages whose texts are split across several small files (cycleTexts, logTexts, ...).
 * Chinese and Russian keep ALL their texts in one file each (zh.ts / ru.ts),
 * so they do not appear in the small files.
 */
export type SplitLanguageCode = Exclude<LanguageCode, 'zh' | 'ru'>;

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
  { code: 'zh', native: '简体中文', english: 'Chinese', rtl: false, locale: 'zh-CN' },
  { code: 'ru', native: 'Русский', english: 'Russian', rtl: false, locale: 'ru-RU' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const isLanguageCode = (value: unknown): value is LanguageCode =>
  LANGUAGES.some((l) => l.code === value);