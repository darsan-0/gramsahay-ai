import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SchemeCategories from './components/SchemeCategories';
import ChatBot from './components/ChatBot';
import Features from './components/Features';
import Statistics from './components/Statistics';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import { useLanguage } from './context/LanguageContext';
import { useTheme } from './hooks/useTheme';
import { useSchemes } from './hooks/useSchemes';

export default function App() {
  const { lang } = useLanguage();
  const { dark, toggleTheme } = useTheme();
  const { schemes, loading: schemesLoading, error: schemesError, refetch } = useSchemes(lang);

  /** Helps the browser + screen readers pick correct script defaults for Telugu. */
  useEffect(() => {
    document.documentElement.lang = lang === 'te' ? 'te' : 'en';
  }, [lang]);

  return (
    <div className="min-h-screen bg-white dark:bg-green-950 font-sans">
      <Navbar dark={dark} onToggleTheme={toggleTheme} />
      <Hero lang={lang} />
      <SchemeCategories
        schemes={schemes}
        schemesLoading={schemesLoading}
        schemesError={schemesError}
        onRetrySchemes={refetch}
      />
      <ChatBot
        schemes={schemes}
        schemesLoading={schemesLoading}
        schemesError={schemesError}
        onRetrySchemes={refetch}
      />
      <Features lang={lang} />
      <Statistics lang={lang} />
      <Testimonials lang={lang} />
      <FAQ lang={lang} />
      <Footer lang={lang} />
    </div>
  );
}
