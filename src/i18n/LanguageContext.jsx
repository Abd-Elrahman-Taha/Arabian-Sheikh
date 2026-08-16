import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './translations/en.json';
import bg from './translations/bg.json';
import es from './translations/es.json';

const translations = { en, bg, es };

const LanguageContext = createContext();

export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', short: 'EN', flag: 'EN' },
  { code: 'bg', name: 'Български', short: 'BG', flag: 'BG' },
  { code: 'es', name: 'Español', short: 'ES', flag: 'ES' },
];

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('arabian_sheikh_lang');
    return saved && translations[saved] ? saved : 'en';
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('arabian_sheikh_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Translation function t('section.key', { param: 'value' })
  const t = (path, params = {}) => {
    const keys = path.split('.');
    let current = translations[language] || translations['en'];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to english if not found
        let fallback = translations['en'];
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            fallback = path;
            break;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return path;
    }

    let result = current;
    for (const [pKey, pVal] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{\\s*${pKey}\\s*}}`, 'g'), String(pVal));
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: AVAILABLE_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
