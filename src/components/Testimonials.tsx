import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations, type Language } from '../data/content';

interface TestimonialsProps {
  lang: Language;
}

export default function Testimonials({ lang }: TestimonialsProps) {
  const t = translations[lang].testimonials;
  const avatarGradients = [
    'from-emerald-600 to-teal-500',
    'from-sky-600 to-indigo-500',
    'from-orange-500 to-saffron-550',
    'from-rose-500 to-orange-550',
  ];

  return (
    <section className="py-24 bg-white dark:bg-emerald-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-200 dark:border-saffron-700/50 rounded-full">
            <Star className="w-3.5 h-3.5 text-saffron-500 fill-saffron-500" />
            <span className="text-saffron-855 dark:text-saffron-300 text-xs font-bold uppercase tracking-wider">
              {lang === 'en' ? 'Community Impact' : 'సామాజిక ప్రభావం'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-emerald-950 dark:text-emerald-50 font-display">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-emerald-800/60 dark:text-emerald-300/60 max-w-xl mx-auto font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative p-6 bg-stone-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100/50 dark:border-emerald-800/30 hover:border-emerald-250 dark:hover:border-emerald-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-left group"
            >
              {/* Quote icon overlay */}
              <div className="absolute top-5 right-5 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-8 h-8 text-emerald-700 dark:text-emerald-300" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 text-saffron-550 fill-saffron-550" />
                ))}
              </div>

              {/* Success story quote text */}
              <p className="text-xs sm:text-sm text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed mb-6 font-medium italic">
                "{item.text}"
              </p>

              {/* Profile/Author Card */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full border border-white/50 bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}>
                  {item.name
                    .split(' ')
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-emerald-950 dark:text-emerald-50 text-sm truncate">{item.name}</p>
                  <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wide">{item.role}</p>
                  <p className="text-[10px] font-medium text-emerald-500/60 dark:text-emerald-500/50">{item.location}</p>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
