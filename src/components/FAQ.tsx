import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations, type Language } from '../data/content';

interface FAQProps {
  lang: Language;
}

export default function FAQ({ lang }: FAQProps) {
  const t = translations[lang].faq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-stone-50 dark:bg-emerald-950/20 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-full">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-emerald-950 dark:text-emerald-50 font-display">
            {t.title}
          </h2>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {t.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-emerald-300 dark:border-emerald-600 shadow-md bg-white dark:bg-emerald-900/10'
                    : 'border-emerald-100 dark:border-emerald-800/40 bg-white dark:bg-emerald-950/20 hover:border-emerald-250 dark:hover:border-emerald-700'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className={`w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-all focus:outline-none ${
                    isOpen
                      ? 'bg-emerald-750 text-white'
                      : 'text-emerald-950 dark:text-emerald-100 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20'
                  }`}
                >
                  <span className="font-bold text-sm sm:text-base leading-snug pr-4">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-emerald-500' : 'text-emerald-400 dark:text-emerald-500'
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 py-5 bg-stone-50/50 dark:bg-emerald-950/20 border-t border-emerald-100 dark:border-emerald-800/30 text-left">
                        <p className={`text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed font-medium ${lang === 'te' ? 'font-telugu' : ''}`}>
                          {item.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
