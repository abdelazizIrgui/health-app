import type { LanguageCode } from '../languages';

/** Texts for the country picker on the registration screen. */
export const countryTexts: Record<LanguageCode, Record<string, string>> = {
  en: {
    'register.country': 'Country',
    'register.searchCountry': 'Search country or code',
    'register.noCountry': 'No country found',
  },
  ar: {
    'register.country': 'الدولة',
    'register.searchCountry': 'ابحثي عن دولة أو رمز',
    'register.noCountry': 'لم يتم العثور على دولة',
  },
  fr: {
    'register.country': 'Pays',
    'register.searchCountry': 'Rechercher un pays ou un indicatif',
    'register.noCountry': 'Aucun pays trouvé',
  },
  es: {
    'register.country': 'País',
    'register.searchCountry': 'Buscar país o prefijo',
    'register.noCountry': 'No se encontró ningún país',
  },
  de: {
    'register.country': 'Land',
    'register.searchCountry': 'Land oder Vorwahl suchen',
    'register.noCountry': 'Kein Land gefunden',
  },
  pt: {
    'register.country': 'País',
    'register.searchCountry': 'Pesquisar país ou indicativo',
    'register.noCountry': 'Nenhum país encontrado',
  },
};