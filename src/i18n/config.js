import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enProfileSettings from '../locales/en/pages/ProfileSettings.json';
import hindiProfileSettings from '../locales/hindi/pages/ProfileSettings.json';
import sanskritProfileSettings from '../locales/sanskrit/pages/ProfileSettings.json';
import teluguProfileSettings from '../locales/telugu/pages/ProfileSettings.json';

// Helper function to dynamically import translations
async function loadTranslations(language, category, file) {
  try {
    const module = await import(`../locales/${language}/${category}/${file}.json`);
    return module.default || module;
  } catch (error) {
    console.warn(`Translation not found: ${language}/${category}/${file}`, error);
    return {};
  }
}

const savedLanguage = localStorage.getItem("app_language") || "en";

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        pages: {
          ProfileSettings: enProfileSettings,
        },
      },
      hindi: {
        pages: {
          ProfileSettings: hindiProfileSettings,
        },
      },
      sanskrit: {
        pages: {
          ProfileSettings: sanskritProfileSettings,
        },
      },
      telugu: {
        pages: {
          ProfileSettings: teluguProfileSettings,
        },
      },
    },
    lng: savedLanguage, // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    defaultNS: 'pages',
    ns: ['pages', 'modules', 'ui', 'layout'],
    react: {
      useSuspense: false, // Disable suspense for better error handling
    },
  });

// Function to add translation namespace dynamically
export async function addTranslationNamespace(language, category, file) {
  const translation = await loadTranslations(language, category, file);
  
  if (!i18n.hasResourceBundle(language, category)) {
    i18n.addResourceBundle(language, category, {}, true, true);
  }
  
  i18n.addResourceBundle(language, category, {
    [file]: translation,
  }, true, true);
}

// Function to change language
export function changeLanguage(lang) {
  i18n.changeLanguage(lang);
}

export default i18n;

