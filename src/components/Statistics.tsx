import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
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
  const { ref, visible } = useIntersection();

  const BG_IMAGE = 'https://images.pexels.com/photos/2253573/pexels-photo-2253573.jpeg?auto=compress&cs=tinysrgb&w=1400';

  return (
    <section className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url('${BG_IMAGE}')` }}
      />
      <div className="absolute inset-0 bg-green-950/85" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-saffron-500/20 border border-saffron-400/30 rounded-full mb-4">
            <BarChart3 className="w-4 h-4 text-saffron-300" />
            <span className="text-saffron-200 text-sm font-medium">
              {lang === 'en' ? 'Our Impact' : 'మా ప్రభావం'}
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-display">{t.title}</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {t.items.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300"
              style={{
                transitionDelay: `${i * 100}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
              }}
            >
              <div className="text-4xl lg:text-5xl font-bold text-saffron-300 mb-2 font-display">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-white/70 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
