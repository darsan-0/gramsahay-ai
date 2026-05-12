import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { translations, type Language } from '../data/content';
import { useIntersection } from '../hooks/useIntersection';

interface FAQProps {
  lang: Language;
}

export default function FAQ({ lang }: FAQProps) {
  const t = translations[lang].faq;
  const { ref, visible } = useIntersection();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-earth-50 dark:bg-green-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <HelpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 text-sm font-medium">FAQ</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-green-900 dark:text-green-50 font-display">{t.title}</h2>
        </div>

        <div className="space-y-3">
          {t.items.map((item, i) => (
            <div
              key={i}
              className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                openIndex === i
                  ? 'border-green-300 dark:border-green-600 shadow-md'
                  : 'border-green-100 dark:border-green-700/60 hover:border-green-200 dark:hover:border-green-600'
              }`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transitionDelay: `${i * 60}ms`,
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={`w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors ${
                  openIndex === i
                    ? 'bg-green-700 text-white'
                    : 'bg-white dark:bg-green-900/40 text-green-900 dark:text-green-100 hover:bg-green-50 dark:hover:bg-green-800/40'
                }`}
              >
                <span className="font-semibold text-sm leading-snug pr-4">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180 text-white' : 'text-green-500 dark:text-green-400'
                  }`}
                />
              </button>

              {openIndex === i && (
                <div className="px-6 py-5 bg-white dark:bg-green-900/20 border-t border-green-100 dark:border-green-700/50">
                  <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
