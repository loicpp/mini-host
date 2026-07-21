import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import fr from './locales/fr.json';

const getBrowserLocale = () => {
  const navigatorLocale =
    navigator.languages !== undefined
      ? navigator.languages[0]
      : navigator.language;

  if (!navigatorLocale) return 'en';
  
  const trimmedLocale = navigatorLocale.trim().split(/-|_/)[0];
  return trimmedLocale;
};

const defaultLocale = getBrowserLocale() === 'fr' ? 'fr' : 'en';

const i18n = createI18n({
  legacy: false, // use Composition API
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    fr
  }
});

export default i18n;
