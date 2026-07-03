import { MessageSquare, Mic, Sparkles, CheckCircle, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations, type Language } from '../data/content';

interface FeaturesProps {
  lang: Language;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Mic,
  Sparkles,
  CheckCircle,
  Search,
  Users,
};

const FEATURE_STYLES = [
  {
    glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    glow: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]',
    iconBg: 'bg-saffron-500/10 dark:bg-saffron-500/20 text-saffron-600 dark:text-saffron-400 border-saffron-500/20',
  },
  {
    glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  {
    glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    glow: 'group-hover:shadow-[0_0_30px_rgba(234,88,12,0.15)]',
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  {
    glow: 'group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
];

export default function Features({ lang }: FeaturesProps) {
  const t = translations[lang].features;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="features" className="relative py-24 bg-white dark:bg-emerald-950 overflow-hidden">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-full"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              {lang === 'en' ? 'Platform Core' : 'వేదిక ప్రధాన లక్షణాలు'}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-emerald-950 dark:text-emerald-50 font-display"
          >
            {t.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg text-emerald-800/60 dark:text-emerald-300/60 max-w-xl mx-auto font-medium"
          >
            {t.subtitle}
          </motion.p>
        </div>

        {/* Features Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {t.items.map((feat, i) => {
            const Icon = ICONS[feat.icon] || Sparkles;
            const style = FEATURE_STYLES[i % FEATURE_STYLES.length];
            return (
              <motion.div
                key={feat.title}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className={`group p-8 rounded-3xl border border-emerald-100/60 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-900/10 hover:bg-white dark:hover:bg-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-700/50 hover:shadow-xl transition-all duration-300 text-left relative flex flex-col justify-between ${style.glow}`}
              >
                <div className="space-y-4">
                  {/* Icon Panel */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-bold ${style.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-lg group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-emerald-800/70 dark:text-emerald-300/60 leading-relaxed font-medium">
                      {feat.desc}
                    </p>
                  </div>
                </div>
                {/* Visual hover border decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/50 rounded-b-3xl transition-all duration-500" />
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
