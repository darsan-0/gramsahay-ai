import { Bot, Mic, Cpu, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations } from '../data/content';
import { useLanguage } from '../context/LanguageContext';

export default function AICapabilities() {
  const { lang } = useLanguage();
  const t = translations[lang].aiCapabilities;

  const capabilities = [
    {
      icon: Bot,
      title: t.nlpTitle,
      desc: t.nlpDesc,
      color: 'from-emerald-500 to-teal-400'
    },
    {
      icon: Mic,
      title: t.voiceTitle,
      desc: t.voiceDesc,
      color: 'from-saffron-500 to-amber-400'
    },
    {
      icon: Cpu,
      title: t.eligibilityTitle,
      desc: t.eligibilityDesc,
      color: 'from-blue-500 to-indigo-400'
    },
    {
      icon: Zap,
      title: t.networkTitle,
      desc: t.networkDesc,
      color: 'from-teal-500 to-emerald-400'
    }
  ];

  return (
    <section className="relative py-24 bg-stone-50 dark:bg-emerald-950/40 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Premium SVG AI Graphic */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl glass-card-light dark:glass-card-dark border border-emerald-100 dark:border-white/10 p-6 flex flex-col justify-center items-center shadow-xl">
              
              {/* Central AI glowing element */}
              <div className="absolute w-24 h-24 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-2xl animate-pulse-glow" />
              
              <svg viewBox="0 0 400 400" className="w-full h-full relative" role="img" aria-label="AI capability flowchart">
                {/* Connection lines */}
                <g stroke="currentColor" className="text-emerald-500/20 dark:text-emerald-500/10" strokeWidth="2">
                  <line x1="200" y1="200" x2="80" y2="100" />
                  <line x1="200" y1="200" x2="320" y2="100" />
                  <line x1="200" y1="200" x2="80" y2="300" />
                  <line x1="200" y1="200" x2="320" y2="300" />
                  <line x1="80" y1="100" x2="320" y2="100" />
                  <line x1="80" y1="300" x2="320" y2="300" />
                </g>

                {/* Pulsing signal nodes */}
                <circle cx="200" cy="200" r="10" className="fill-emerald-500 animate-ping opacity-75" />
                <circle cx="80" cy="100" r="6" className="fill-saffron-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <circle cx="320" cy="100" r="6" className="fill-blue-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
                <circle cx="80" cy="300" r="6" className="fill-teal-500 animate-bounce" style={{ animationDelay: '0.8s' }} />
                <circle cx="320" cy="300" r="6" className="fill-emerald-400 animate-bounce" style={{ animationDelay: '1.1s' }} />

                {/* Nodes with icons or designs */}
                <circle cx="200" cy="200" r="40" className="fill-emerald-600 dark:fill-emerald-800 stroke-white dark:stroke-emerald-900" strokeWidth="4" />
                <g transform="translate(182, 182) scale(1.5)">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" fill="white" />
                </g>

                <circle cx="80" cy="100" r="30" className="fill-saffron-500 stroke-white" strokeWidth="3" />
                <g transform="translate(68, 88) scale(1)">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="white" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="white" />
                </g>

                <circle cx="320" cy="100" r="30" className="fill-blue-600 stroke-white" strokeWidth="3" />
                <g transform="translate(308, 88) scale(1)">
                  <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.49 10 10-4.49 10-10 10zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8z" fill="white" />
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="white" />
                </g>

                <circle cx="80" cy="300" r="30" className="fill-teal-600 stroke-white" strokeWidth="3" />
                <g transform="translate(68, 288) scale(1.1)">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="white" />
                </g>

                <circle cx="320" cy="300" r="30" className="fill-emerald-500 stroke-white" strokeWidth="3" />
                <g transform="translate(308, 288) scale(1)">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="white" />
                </g>
              </svg>

              {/* Glowing decorative rings */}
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-saffron-500 text-white rounded-full flex items-center justify-center shadow-lg font-bold text-xs uppercase animate-bounce-slow">
                100%
              </div>
            </div>
          </div>

          {/* Right Column: Capabilities Details */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900 border border-emerald-100 dark:border-emerald-800 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  AI Features
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-display">
                {t.title}
              </h2>
              <p className="text-base text-emerald-800/60 dark:text-emerald-300/60 font-medium">
                {t.subtitle}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {capabilities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-white dark:bg-emerald-900/10 border border-emerald-100/60 dark:border-emerald-800/30 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-lg transition-all duration-300 flex flex-col items-start space-y-3 text-left"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-base">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-800/70 dark:text-emerald-300/65 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
