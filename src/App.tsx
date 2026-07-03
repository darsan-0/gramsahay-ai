import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SchemeCategories from './components/SchemeCategories';
import ChatBot from './components/ChatBot';
import Features from './components/Features';
import AICapabilities from './components/AICapabilities';
import HowItWorks from './components/HowItWorks';
import Statistics from './components/Statistics';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
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
    <div className="min-h-screen bg-stone-50 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-50 font-sans transition-colors duration-300">
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
      <AICapabilities />
      <HowItWorks />
      <Statistics lang={lang} />
      <Testimonials lang={lang} />
      <FAQ lang={lang} />
      <Contact />
      <Footer lang={lang} />
    </div>
  );
}
