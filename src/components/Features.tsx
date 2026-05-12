import { MessageSquare, Mic, Sparkles, CheckCircle, Search, Users } from 'lucide-react';
import { translations, type Language } from '../data/content';
import { useIntersection } from '../hooks/useIntersection';

interface FeaturesProps {
  lang: Language;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare, Mic, Sparkles, CheckCircle, Search, Users,
};

const COLORS = [
  { bg: 'bg-green-50 dark:bg-green-900/30', icon: 'text-green-700 dark:text-green-300', border: 'border-green-100 dark:border-green-700', accent: 'bg-green-700' },
  { bg: 'bg-saffron-50 dark:bg-saffron-900/20', icon: 'text-saffron-700 dark:text-saffron-300', border: 'border-saffron-100 dark:border-saffron-700', accent: 'bg-saffron-500' },
  { bg: 'bg-sky-50 dark:bg-sky-900/20', icon: 'text-sky-700 dark:text-sky-300', border: 'border-sky-100 dark:border-sky-700', accent: 'bg-sky-600' },
  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-100 dark:border-emerald-700', accent: 'bg-emerald-600' },
  { bg: 'bg-earth-50 dark:bg-earth-900/20', icon: 'text-earth-700 dark:text-earth-400', border: 'border-earth-100 dark:border-earth-700', accent: 'bg-earth-600' },
  { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-700 dark:text-blue-300', border: 'border-blue-100 dark:border-blue-700', accent: 'bg-blue-600' },
];

export default function Features({ lang }: FeaturesProps) {
  const t = translations[lang].features;
  const { ref, visible } = useIntersection();

  return (
    <section id="features" className="py-20 bg-earth-gradient dark:bg-green-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 text-sm font-medium">
              {lang === 'en' ? 'Platform Features' : 'వేదిక లక్షణాలు'}
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-green-900 dark:text-green-50 font-display">{t.title}</h2>
          <p className="mt-3 text-green-700/70 dark:text-green-300/70 text-lg max-w-xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.items.map((feat, i) => {
            const Icon = ICONS[feat.icon] || Sparkles;
            const c = COLORS[i % COLORS.length];
            return (
              <div
                key={feat.title}
                className={`group p-6 rounded-2xl border ${c.bg} ${c.border} hover:shadow-lg transition-all duration-300`}
                style={{
                  transitionDelay: `${i * 80}ms`,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(24px)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${c.accent} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 dark:text-green-100 text-base mb-1.5 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-green-700/70 dark:text-green-400/70 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
