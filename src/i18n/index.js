import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import bn from './bn.json';

const savedLang = localStorage.getItem('orva-lang') || 'en';

// Also respect URL param: ?lang=bn
const urlParam = new URLSearchParams(window.location.search).get('lang');
const initLang = ['en', 'bn'].includes(urlParam) ? urlParam : savedLang;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
    },
    lng:          initLang,
    fallbackLng:  'en',
    interpolation: { escapeValue: false },
  });

export default i18n;

/** Toggle language and persist to localStorage */
export function toggleLanguage() {
  const next = i18n.language === 'en' ? 'bn' : 'en';
  i18n.changeLanguage(next);
  localStorage.setItem('orva-lang', next);
  // Update <html lang> attribute
  document.documentElement.lang = next;
}

/** Get translated product field (title, description, etc.) */
export function tField(field, lang) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang || i18n.language] || field.en || field.bn || '';
}
