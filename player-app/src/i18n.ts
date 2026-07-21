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

const savedLocale = localStorage.getItem('minihost_language');
const defaultLocale = savedLocale || (getBrowserLocale() === 'fr' ? 'fr' : 'en');

const i18n = createI18n({
  legacy: false, // use Composition API
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    fr
  }
});

// Watch for locale changes to save in localStorage
import { watch } from 'vue';
watch(i18n.global.locale, (newLocale) => {
  localStorage.setItem('minihost_language', newLocale as string);
});

export default i18n;
