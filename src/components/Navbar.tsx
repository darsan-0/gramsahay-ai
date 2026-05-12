import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Leaf } from 'lucide-react';
import { translations, type Language } from '../data/content';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  dark: boolean;
  onToggleTheme: () => void;
}

/**
 * Top navigation. Language is driven by global `LanguageContext`:
 * explicit **English | తెలుగు** control (no translation APIs).
 */
export default function Navbar({ dark, onToggleTheme }: NavbarProps) {
  const { lang, setLang } = useLanguage();
  const t = translations[lang].nav;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const setLanguage = (next: Language) => {
    setLang(next);
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { label: t.home, href: '#home' },
    { label: t.schemes, href: '#schemes' },
    { label: t.features, href: '#features' },
    { label: t.faq, href: '#faq' },
    { label: t.contact, href: '#contact' },
  ];

  const scrollTo = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const langBtn = (active: boolean) =>
    `px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
      active
        ? scrolled
          ? 'bg-green-700 text-white shadow-sm'
          : 'bg-white/20 text-white'
        : scrolled
          ? 'text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-800'
          : 'text-white/85 hover:bg-white/10'
    }`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 dark:bg-green-950/90 backdrop-blur-xl shadow-lg shadow-green-950/5 border-b border-green-100 dark:border-green-800'
        : 'bg-gradient-to-b from-green-950/55 to-transparent backdrop-blur-[2px]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <button type="button" onClick={() => scrollTo('#home')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shadow-md group-hover:bg-green-600 transition-colors">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className={`font-bold text-base tracking-tight transition-colors ${
                scrolled ? 'text-green-900 dark:text-green-100' : 'text-white'
              }`}>GramSahay</span>
              <span className={`text-[10px] font-semibold tracking-widest transition-colors ${
                scrolled ? 'text-saffron-600 dark:text-saffron-400' : 'text-saffron-300'
              }`}>AI</span>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-green-800 dark:text-green-200 hover:bg-green-50 dark:hover:bg-green-800'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Bilingual toggle: English | తెలుగు */}
            <div
              className={`flex items-center gap-0.5 rounded-full border px-0.5 py-0.5 ${
                scrolled
                  ? 'border-green-300 dark:border-green-600 bg-green-50/80 dark:bg-green-900/40'
                  : 'border-white/35 bg-white/5'
              }`}
              role="group"
              aria-label="Site language"
            >
              <button type="button" className={langBtn(lang === 'en')} onClick={() => setLanguage('en')}>
                English
              </button>
              <span className={scrolled ? 'text-green-400 dark:text-green-600 text-xs px-0.5' : 'text-white/50 text-xs'}>
                |
              </span>
              <button type="button" className={`${langBtn(lang === 'te')} font-telugu`} onClick={() => setLanguage('te')}>
                తెలుగు
              </button>
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`p-2.5 rounded-full transition-all hover:-translate-y-0.5 ${
                scrolled
                  ? 'text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-800'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => scrollTo('#chat')}
              className="ml-1 px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white text-sm font-semibold rounded-full shadow-md transition-all hover:shadow-lg"
            >
              {lang === 'en' ? 'Start Chat' : 'చాట్ చేయండి'}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle navigation menu"
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-green-800 dark:text-green-200' : 'text-white'
            }`}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white/95 dark:bg-green-950/95 backdrop-blur-xl border-t border-green-100 dark:border-green-800 shadow-xl animate-message-in">
          <div className="px-4 py-3 space-y-1">
            {links.map(link => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className="w-full text-left px-3 py-3 rounded-xl text-base font-medium text-green-800 dark:text-green-200 hover:bg-green-50 dark:hover:bg-green-800 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-green-100 dark:border-green-800 mt-2">
              <div className="flex rounded-lg border border-green-300 dark:border-green-600 overflow-hidden">
                <button
                  type="button"
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${lang === 'en' ? 'bg-green-700 text-white' : 'text-green-700 dark:text-green-300'}`}
                  onClick={() => setLanguage('en')}
                >
                  English
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 text-sm font-semibold font-telugu transition-colors ${lang === 'te' ? 'bg-green-700 text-white' : 'text-green-700 dark:text-green-300'}`}
                  onClick={() => setLanguage('te')}
                >
                  తెలుగు
                </button>
              </div>
              <div className="flex justify-center">
                <button type="button" onClick={onToggleTheme} className="p-2 rounded-lg text-green-700 dark:text-green-300">
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
