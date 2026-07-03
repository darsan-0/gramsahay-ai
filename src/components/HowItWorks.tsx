import { Languages, Mic, Sparkles, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations } from '../data/content';
import { useLanguage } from '../context/LanguageContext';

export default function HowItWorks() {
  const { lang } = useLanguage();
  const t = translations[lang].howItWorks;

  const steps = [
    {
      step: '01',
      icon: Languages,
      title: t.step1Title,
      desc: t.step1Desc,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
    },
    {
      step: '02',
      icon: Mic,
      title: t.step2Title,
      desc: t.step2Desc,
      color: 'text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-saffron-900/20'
    },
    {
      step: '03',
      icon: Sparkles,
      title: t.step3Title,
      desc: t.step3Desc,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
    },
    {
      step: '04',
      icon: CheckSquare,
      title: t.step4Title,
      desc: t.step4Desc,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
    }
  ];

  return (
    <section className="relative py-24 bg-white dark:bg-emerald-950 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-100 dark:border-saffron-850 rounded-full"
          >
            <span className="text-saffron-700 dark:text-saffron-300 text-xs font-bold uppercase tracking-wider">
              {lang === 'en' ? 'User Flow' : 'వినియోగదారు ప్రవాహం'}
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-display">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-emerald-800/60 dark:text-emerald-300/60 max-w-xl mx-auto font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-1/2 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-100 via-saffron-100 to-teal-100 dark:from-emerald-900 dark:via-saffron-900 dark:to-teal-900 hidden lg:block -translate-y-8" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="flex flex-col items-center text-center group space-y-4"
                >
                  {/* Step Bubble */}
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border border-emerald-100/50 dark:border-white/10 ${item.color} shadow-md group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                      <Icon className="w-6.5 h-6.5" />
                    </div>
                    {/* Index float */}
                    <div className="absolute -top-3 -right-3 text-2xl font-black text-emerald-950/10 dark:text-white/10 select-none font-display">
                      {item.step}
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-base sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-800/70 dark:text-emerald-300/60 leading-relaxed font-medium px-4">
                      {item.desc}
                    </p>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
