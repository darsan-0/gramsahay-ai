import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations, type Language } from '../data/content';
import { useIntersection } from '../hooks/useIntersection';

interface StatisticsProps {
  lang: Language;
}

function AnimatedCounter({ target, suffix, duration = 2000 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useIntersection(0.3);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target, duration]);

  const formatted = count >= 1000 ? (count / 1000).toFixed(0) + 'K' : count.toString();

  return (
    <span ref={ref} className="tabular-nums">
      {target >= 1000 ? formatted : count}{suffix}
    </span>
  );
}

export default function Statistics({ lang }: StatisticsProps) {
  const t = translations[lang].stats;
  const { ref } = useIntersection();

  return (
    <section className="relative py-28 overflow-hidden bg-emerald-950">
      {/* Visual Ambient Overlays */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-saffron-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-saffron-500/20 border border-saffron-400/30 rounded-full">
            <BarChart3 className="w-3.5 h-3.5 text-saffron-400" />
            <span className="text-saffron-200 text-xs font-bold uppercase tracking-wider">
              {lang === 'en' ? 'Core Metrics' : 'కీలక కొలతలు'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-display">
            {t.title}
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {t.items.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="text-center p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 shadow-lg relative overflow-hidden group"
            >
              {/* Decorative Glow */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-saffron-500/5 rounded-full blur-xl group-hover:bg-saffron-500/10 transition-colors" />

              <div className="text-4xl sm:text-5xl font-black text-saffron-400 mb-2 font-display">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-emerald-100/75 text-xs sm:text-sm font-semibold uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
