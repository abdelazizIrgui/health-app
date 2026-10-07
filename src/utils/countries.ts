import {
  AsYouType,
  CountryCode,
  getExampleNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js/max';
import examples from 'libphonenumber-js/examples.mobile.json';

import { COUNTRY_ROWS } from '../data/countryRows';
import type { LanguageCode } from '../i18n/languages';

/** Country used before she picks one. */
export const DEFAULT_COUNTRY = 'US';

export interface Country {
  iso: string;
  dial: string; // calling code without "+", e.g. "212"
  flag: string;
  names: Record<LanguageCode, string>;
}

/** Flag emoji built from the 2-letter ISO code. */
const flagOf = (iso: string) =>
  String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));

export const COUNTRIES: Country[] = COUNTRY_ROWS.map((row) => ({
  iso: row[0],
  dial: row[1],
  flag: flagOf(row[0]),
  names: {
    en: row[2],
    ar: row[3],
    fr: row[4],
    es: row[5],
    de: row[6],
    pt: row[7],
    zh: row[8],
    ru: row[9],
  },
}));

const BY_ISO = new Map(COUNTRIES.map((c) => [c.iso, c]));

export const getCountry = (iso: string): Country =>
  BY_ISO.get(iso) ?? (BY_ISO.get(DEFAULT_COUNTRY) as Country);

export const countryName = (c: Country, lang: LanguageCode) => c.names[lang] ?? c.names.en;

/** Countries sorted A-Z in the given language, filtered by name, ISO code or calling code. */
export function searchCountries(query: string, lang: LanguageCode): Country[] {
  const q = query.trim().toLowerCase().replace(/^\+/, '');
  const sorted = [...COUNTRIES].sort((a, b) =>
    countryName(a, lang).localeCompare(countryName(b, lang), lang),
  );
  if (!q) return sorted;
  return sorted.filter(
    (c) =>
      countryName(c, lang).toLowerCase().includes(q) ||
      c.names.en.toLowerCase().includes(q) ||
      c.iso.toLowerCase() === q ||
      c.dial.startsWith(q),
  );
}

/** Example mobile number of the country, without the calling code. e.g. "612-345678" for Morocco. */
export function phonePlaceholder(iso: string): string {
  try {
    const example = getExampleNumber(iso as CountryCode, examples);
    if (!example) return '';
    const international = example.formatInternational(); // "+212 612-345678"
    return international.replace(`+${example.countryCallingCode}`, '').trim();
  } catch {
    return '';
  }
}

/** Formats the digits as she types, following the rules of the selected country. */
export const formatAsTyped = (iso: string, value: string) =>
  new AsYouType(iso as CountryCode).input(value);

/** If she pastes a full international number ("+34 600..."), find the country it belongs to. */
export function detectCountry(value: string): string | null {
  if (!value.trim().startsWith('+')) return null;
  const parsed = parsePhoneNumberFromString(value);
  return parsed?.country ?? null;
}

/** Returns the number in international format (+212612345678) or null if it is not valid. */
export function toInternational(iso: string, national: string): string | null {
  const parsed = parsePhoneNumberFromString(national, iso as CountryCode);
  return parsed?.isValid() ? parsed.number : null;
}

/** Shows a saved number nicely, e.g. "+212612345678" -> { text: "+212 612-345678", iso: "MA" }. */
export function describePhone(value: string): { text: string; iso: string | null } {
  const parsed = parsePhoneNumberFromString(value);
  if (!parsed) return { text: value, iso: null };
  return { text: parsed.formatInternational(), iso: parsed.country ?? null };
}