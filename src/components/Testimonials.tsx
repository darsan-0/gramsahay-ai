import { Star, Quote } from 'lucide-react';
import { translations, type Language } from '../data/content';
import { useIntersection } from '../hooks/useIntersection';

interface TestimonialsProps {
  lang: Language;
}

export default function Testimonials({ lang }: TestimonialsProps) {
  const t = translations[lang].testimonials;
  const { ref, visible } = useIntersection();

  return (
    <section className="py-20 bg-white dark:bg-green-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-200 dark:border-saffron-700/50 rounded-full mb-4">
            <Star className="w-4 h-4 text-saffron-500 fill-saffron-500" />
            <span className="text-saffron-700 dark:text-saffron-300 text-sm font-medium">
              {lang === 'en' ? 'Success Stories' : 'విజయ గాథలు'}
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-green-900 dark:text-green-50 font-display">{t.title}</h2>
          <p className="mt-3 text-green-700/70 dark:text-green-300/70 text-lg">{t.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.items.map((item, i) => (
            <div
              key={item.name}
              className="relative p-6 bg-earth-50 dark:bg-green-900/40 rounded-2xl border border-earth-100 dark:border-green-700/60 hover:shadow-lg hover:border-green-200 dark:hover:border-green-500 transition-all duration-300 group"
              style={{
                transitionDelay: `${i * 80}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
              }}
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-10 h-10 text-green-700 dark:text-green-300" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-saffron-400 fill-saffron-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed mb-5 italic">
                "{item.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-green-200 dark:border-green-600"
                />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100 text-sm">{item.name}</p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">{item.role}</p>
                  <p className="text-xs text-green-500/60 dark:text-green-500/50">{item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
