// Generates src/data/countryRows.ts: every country + calling code + names in the 8 app languages
const fs = require('fs');
const { getCountries, getCountryCallingCode } = require('libphonenumber-js/max');

const langs = ['en', 'ar', 'fr', 'es', 'de', 'pt', 'zh', 'ru'];
const dn = Object.fromEntries(
  langs.map((l) => [l, new Intl.DisplayNames([l], { type: 'region' })]),
);

const rows = getCountries().map((c) => {
  const names = langs.map((l) => {
    try {
      return dn[l].of(c);
    } catch {
      return c;
    }
  });
  return [c, getCountryCallingCode(c), ...names];
});

let out =
  '/** Generated list of countries: ISO code, calling code and names in the 8 app languages (en, ar, fr, es, de, pt, zh, ru). */\n' +
  'export type CountryRow = [iso: string, dial: string, en: string, ar: string, fr: string, es: string, de: string, pt: string, zh: string, ru: string];\n\n' +
  'export const COUNTRY_ROWS: CountryRow[] = [\n';
for (const r of rows) out += '  ' + JSON.stringify(r) + ',\n';
out += '];\n';

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/countryRows.ts', out);
console.log('Done:', rows.length, 'countries');