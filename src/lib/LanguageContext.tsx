import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type Language = 'es' | 'en' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    'settings.title': 'Configuración',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.ai': 'Inteligencia Artificial',
    'settings.data': 'Datos',
    'appearance': 'Apariencia',
    'theme': 'Tema de la aplicación',
    'light': 'Claro',
    'dark': 'Oscuro',
    'system': 'Automático',
    'language': 'Idioma',
    'selectLanguage': 'Selecciona tu idioma',
  },
  en: {
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.ai': 'Artificial Intelligence',
    'settings.data': 'Data',
    'appearance': 'Appearance',
    'theme': 'App Theme',
    'light': 'Light',
    'dark': 'Dark',
    'system': 'System',
    'language': 'Language',
    'selectLanguage': 'Select your language',
  },
  ja: {
    'settings.title': '設定',
    'settings.language': '言語',
    'settings.theme': 'テーマ',
    'settings.ai': '人工知能',
    'settings.data': 'データ',
    'appearance': '外観',
    'theme': 'アプリのテーマ',
    'light': 'ライト',
    'dark': 'ダーク',
    'system': 'システム',
    'language': '言語',
    'selectLanguage': '言語を選択',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    SecureStore.getItemAsync('app_language').then(lang => {
      if (lang === 'es' || lang === 'en' || lang === 'ja') {
        setLanguageState(lang);
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await SecureStore.setItemAsync('app_language', lang);
  };

  const t = (key: string) => {
    const lang = language || 'es';
    return (translations[lang] as any)?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
