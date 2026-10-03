import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_LANGUAGE, LANGUAGES, Language, LanguageCode, isLanguageCode } from './languages';
import { Dictionary, en } from './locales/en';
import { ar } from './locales/ar';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { de } from './locales/de';
import { pt } from './locales/pt';

const DICTIONARIES: Record<LanguageCode, Dictionary> = { en, ar, fr, es, de, pt };
const STORAGE_KEY = '@health_app/language';

type Params = Record<string, string | number>;

/** Layout helpers so every screen flips correctly for right-to-left languages. */
export interface Direction {
  row: 'row' | 'row-reverse';
  align: 'left' | 'right';
  writing: 'ltr' | 'rtl';
}

interface I18nContextValue {
  language: LanguageCode;
  languageInfo: Language;
  isRTL: boolean;
  dir: Direction;
  setLanguage: (code: LanguageCode) => Promise<void>;
  /** Translates a key. Falls back to English, then to the key itself. */
  t: (key: string, params?: Params) => string;
  /** True when a key exists (used for optional texts like a question subtitle). */
  has: (key: string) => boolean;
  /** Formats a date in the current language, e.g. "21 mars 2000". */
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/** Uses the phone's language on first launch, if we support it. */
function detectDeviceLanguage(): LanguageCode {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale; // e.g. "ar-MA"
    const code = locale.split(/[-_]/)[0].toLowerCase();
    if (isLanguageCode(code)) return code;
  } catch {
    // Intl not available: fall through to the default.
  }
  return DEFAULT_LANGUAGE;
}

/** Which plural form a number needs (Arabic has four forms, most others two). */
function pluralCategory(language: LanguageCode, n: number): 'one' | 'two' | 'few' | 'other' {
  if (language === 'ar') {
    if (n === 1) return 'one';
    if (n === 2) return 'two';
    const last = n % 100;
    return last >= 3 && last <= 10 ? 'few' : 'other';
  }
  if (language === 'fr' || language === 'pt') return n >= 0 && n < 2 ? 'one' : 'other';
  return n === 1 ? 'one' : 'other';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        setLanguageState(isLanguageCode(saved) ? saved : detectDeviceLanguage());
      } catch {
        setLanguageState(detectDeviceLanguage());
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLanguage = useCallback(async (code: LanguageCode) => {
    setLanguageState(code); // the whole app re-renders in the new language right away
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      console.warn('Could not save language', e);
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const languageInfo = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];
    const dict = DICTIONARIES[language];

    const lookup = (key: string, n?: number): string | undefined => {
      const candidates =
        n === undefined ? [key] : [`${key}.${pluralCategory(language, n)}`, `${key}.other`, key];
      for (const c of candidates) {
        const found = dict[c] ?? (en as Record<string, string>)[c];
        if (found !== undefined) return found;
      }
      return undefined;
    };

    const t = (key: string, params?: Params) => {
      const text = lookup(key, typeof params?.n === 'number' ? params.n : undefined) ?? key;
      return text.replace(/\{(\w+)\}/g, (_, name) => String(params?.[name] ?? `{${name}}`));
    };

    const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
      try {
        return date.toLocaleDateString(
          languageInfo.locale,
          options ?? { day: 'numeric', month: 'long', year: 'numeric' }
        );
      } catch {
        return date.toDateString();
      }
    };

    const isRTL = languageInfo.rtl;
    return {
      language,
      languageInfo,
      isRTL,
      dir: {
        row: isRTL ? 'row-reverse' : 'row',
        align: isRTL ? 'right' : 'left',
        writing: isRTL ? 'rtl' : 'ltr',
      },
      setLanguage,
      t,
      has: (key) => lookup(key) !== undefined,
      formatDate,
    };
  }, [language, setLanguage]);

  // Wait for the saved language so the first screen never flashes in the wrong language.
  if (!ready) return null;

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}