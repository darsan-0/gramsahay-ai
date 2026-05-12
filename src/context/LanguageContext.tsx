import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Language } from '../data/content';

/**
 * App-wide UI language (English / Telugu).
 *
 * All copy comes from local JSON / translation maps — no runtime translation
 * APIs. Switching language refetches scheme payloads with `?lang=` from Flask.
 */
export type AppLanguage = Language;

type LanguageContextValue = {
  lang: AppLanguage;
  setLang: (next: AppLanguage) => void;
  /** Kept for components that still prefer a binary toggle */
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<AppLanguage>('en');

  const toggleLang = useCallback(() => {
    setLang(l => (l === 'en' ? 'te' : 'en'));
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
    }),
    [lang, toggleLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
