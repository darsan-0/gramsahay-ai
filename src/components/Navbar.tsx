import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Leaf, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../data/content';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  dark: boolean;
  onToggleTheme: () => void;
}

export default function Navbar({ dark, onToggleTheme }: NavbarProps) {
  const { lang, setLang } = useLanguage();
  const t = translations[lang].nav;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 dark:bg-emerald-950/75 backdrop-blur-md border-b border-emerald-100/50 dark:border-emerald-800/30 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollTo('#home')}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className={`font-bold text-lg tracking-tight transition-colors duration-300 ${
                scrolled ? 'text-emerald-950 dark:text-emerald-50' : 'text-white'
              }`}>
                GramSahay
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest text-saffron-500 uppercase">
                <Sparkles className="w-2.5 h-2.5" /> AI Platform
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-950/5 dark:bg-white/5 px-2 py-1.5 rounded-full border border-emerald-900/5 dark:border-white/5">
            {links.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollTo(link.href)}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 focus:outline-none ${
                  scrolled
                    ? 'text-emerald-900 dark:text-emerald-100 hover:text-emerald-700 dark:hover:text-white hover:bg-emerald-50/50 dark:hover:bg-white/5'
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className={`flex items-center p-0.5 rounded-full border transition-all duration-300 ${
              scrolled
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/20'
                : 'border-white/20 bg-white/5'
            }`}>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all focus:outline-none ${
                  lang === 'en'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : scrolled
                      ? 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/30'
                      : 'text-white/80 hover:bg-white/10'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('te')}
                className={`px-3 py-1.5 text-xs font-bold rounded-full font-telugu transition-all focus:outline-none ${
                  lang === 'te'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : scrolled
                      ? 'text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/30'
                      : 'text-white/80 hover:bg-white/10'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-2.5 rounded-full transition-all duration-200 border hover:scale-105 focus:outline-none ${
                scrolled
                  ? 'border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                  : 'border-white/10 text-white hover:bg-white/10'
              }`}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Start Chat Button */}
            <button
              type="button"
              onClick={() => scrollTo('#chat')}
              className="px-5 py-2.5 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-400 hover:to-saffron-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] transition-all duration-300 active:scale-95 focus:outline-none"
            >
              {lang === 'en' ? 'Start Chat' : 'చాట్ చేయండి'}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2.5 md:hidden">
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-2 rounded-full border transition-all focus:outline-none ${
                scrolled ? 'border-emerald-100 dark:border-emerald-800 text-emerald-800' : 'border-white/10 text-white'
              }`}
            >
              {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className={`p-2.5 rounded-xl transition-all border focus:outline-none ${
                scrolled
                  ? 'border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'border-white/15 text-white'
              }`}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-emerald-950 border-t border-emerald-100 dark:border-emerald-900 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {links.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => scrollTo(link.href)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold tracking-wide uppercase text-emerald-900 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-white/5 transition-colors focus:outline-none"
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-4 mt-2 border-t border-emerald-100 dark:border-emerald-900 space-y-3">
                {/* Language selection in mobile menu */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setLang('en'); setOpen(false); }}
                    className={`py-3 text-xs font-bold rounded-xl text-center border focus:outline-none transition-all ${
                      lang === 'en'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                        : 'border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-white/5'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLang('te'); setOpen(false); }}
                    className={`py-3 text-xs font-bold font-telugu rounded-xl text-center border focus:outline-none transition-all ${
                      lang === 'te'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                        : 'border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-white/5'
                    }`}
                  >
                    తెలుగు
                  </button>
                </div>

                {/* Mobile CTA */}
                <button
                  type="button"
                  onClick={() => scrollTo('#chat')}
                  className="w-full py-3 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white text-center text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg focus:outline-none"
                >
                  {lang === 'en' ? 'Start Chatbot' : 'చాట్ ప్రారంభించండి'}
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
