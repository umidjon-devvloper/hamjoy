'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppLanguage } from '@/types';
import { TRANSLATION_MAP, type Translations } from './translations';

const STORAGE_KEY = 'hamjoy:lang';

interface I18nContextValue {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'uz',
  setLang: () => {},
  t: TRANSLATION_MAP.uz,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AppLanguage>('uz');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as AppLanguage | null;
      if (stored && stored in TRANSLATION_MAP) setLangState(stored);
    } catch {}
  }, []);

  const setLang = useCallback((next: AppLanguage) => {
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    document.documentElement.lang = next;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: TRANSLATION_MAP[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
