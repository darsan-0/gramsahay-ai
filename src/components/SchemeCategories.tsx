import {
  Sprout,
  GraduationCap,
  Heart,
  Stethoscope,
  Shield,
  Briefcase,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { translations } from '../data/content';
import { useLanguage } from '../context/LanguageContext';
import { useIntersection } from '../hooks/useIntersection';
import type { SchemeRecord } from '../services/api';

interface SchemeCategoriesProps {
  /** Live data from GET /api/schemes?lang=… (language follows global context). */
  schemes: SchemeRecord[];
  schemesLoading: boolean;
  schemesError: string | null;
  onRetrySchemes: () => void;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout,
  GraduationCap,
  Heart,
  Stethoscope,
  Shield,
  Briefcase,
  TrendingUp,
};

const SCHEME_IMAGES: Record<string, string> = {
  farmers: 'https://images.pexels.com/photos/2255459/pexels-photo-2255459.jpeg?auto=compress&cs=tinysrgb&w=400',
  students: 'https://images.pexels.com/photos/5212703/pexels-photo-5212703.jpeg?auto=compress&cs=tinysrgb&w=400',
  women: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400',
  health: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400',
  pension: 'https://images.pexels.com/photos/2382904/pexels-photo-2382904.jpeg?auto=compress&cs=tinysrgb&w=400',
  employment: 'https://images.pexels.com/photos/2253573/pexels-photo-2253573.jpeg?auto=compress&cs=tinysrgb&w=400',
  entrepreneurship: 'https://images.pexels.com/photos/3769714/pexels-photo-3769714.jpeg?auto=compress&cs=tinysrgb&w=400',
};

const COLOR_MAP: Record<string, { icon: string; badge: string; hover: string; tag: string }> = {
  green: {
    icon: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    badge: 'bg-green-700 text-white',
    hover: 'hover:border-green-300 hover:shadow-green-100',
    tag: 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300',
  },
  sky: {
    icon: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-600 text-white',
    hover: 'hover:border-sky-300 hover:shadow-sky-100',
    tag: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
  },
  saffron: {
    icon: 'bg-saffron-100 dark:bg-saffron-900/30 text-saffron-700 dark:text-saffron-300',
    badge: 'bg-saffron-500 text-white',
    hover: 'hover:border-saffron-300 hover:shadow-saffron-100',
    tag: 'bg-saffron-50 dark:bg-saffron-900/20 text-saffron-700 dark:text-saffron-400',
  },
  red: {
    icon: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    badge: 'bg-red-600 text-white',
    hover: 'hover:border-red-300 hover:shadow-red-100',
    tag: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  },
  earth: {
    icon: 'bg-earth-100 dark:bg-earth-900/30 text-earth-700 dark:text-earth-300',
    badge: 'bg-earth-600 text-white',
    hover: 'hover:border-earth-300 hover:shadow-earth-100',
    tag: 'bg-earth-50 dark:bg-earth-900/20 text-earth-700 dark:text-earth-400',
  },
  blue: {
    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-600 text-white',
    hover: 'hover:border-blue-300 hover:shadow-blue-100',
    tag: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  },
  orange: {
    icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-500 text-white',
    hover: 'hover:border-orange-300 hover:shadow-orange-100',
    tag: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
  },
};

/**
 * Map machine `category_code` to UI assets (icons/images are decorative only;
 * localized titles and labels always come from the API).
 */
function visualsForScheme(scheme: SchemeRecord): {
  imageKey: string;
  iconName: string;
  colorKey: string;
} {
  const cat = (scheme.category_code ?? '').toLowerCase();
  if (cat === 'agriculture') {
    return { imageKey: 'farmers', iconName: 'Sprout', colorKey: 'green' };
  }
  if (cat === 'education') {
    return { imageKey: 'students', iconName: 'GraduationCap', colorKey: 'sky' };
  }
  if (cat === 'health') {
    return { imageKey: 'health', iconName: 'Stethoscope', colorKey: 'red' };
  }
  if (cat === 'pension') {
    return { imageKey: 'pension', iconName: 'Shield', colorKey: 'earth' };
  }
  if (cat === 'employment') {
    return { imageKey: 'employment', iconName: 'Briefcase', colorKey: 'blue' };
  }
  if (cat === 'women' || cat === 'women_welfare') {
    return { imageKey: 'women', iconName: 'Heart', colorKey: 'saffron' };
  }
  return { imageKey: 'entrepreneurship', iconName: 'TrendingUp', colorKey: 'orange' };
}

export default function SchemeCategories({
  schemes,
  schemesLoading: loading,
  schemesError: error,
  onRetrySchemes: refetch,
}: SchemeCategoriesProps) {
  const { lang } = useLanguage();
  const t = translations[lang].schemes;
  const { ref, visible } = useIntersection();

  return (
    <section id="schemes" className="py-20 bg-white dark:bg-green-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-200 dark:border-saffron-700 rounded-full mb-4">
            <Sprout className="w-4 h-4 text-saffron-600 dark:text-saffron-400" />
            <span className="text-saffron-700 dark:text-saffron-300 text-sm font-medium">
              {lang === 'en' ? 'Government Schemes' : 'ప్రభుత్వ పథకాలు'}
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-green-900 dark:text-green-50 font-display">{t.title}</h2>
          <p className="mt-3 text-green-700/70 dark:text-green-300/70 text-lg max-w-xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Loading: schemes are fetched live from Flask */}
        {loading && (
          <div className="space-y-6 py-4 text-green-700 dark:text-green-300" aria-live="polite">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" aria-hidden />
              <p className="text-sm font-medium">
              {lang === 'en' ? 'Loading schemes from server…' : 'సర్వర్ నుండి పథకాలు లోడ్ అవుతున్నాయి…'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-green-100 dark:border-green-800 bg-white dark:bg-green-900/30 overflow-hidden shadow-sm"
                >
                  <div className="h-36 skeleton-shimmer" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 rounded-full skeleton-shimmer w-3/4" />
                    <div className="h-3 rounded-full skeleton-shimmer w-full" />
                    <div className="h-3 rounded-full skeleton-shimmer w-5/6" />
                    <div className="h-7 rounded-xl skeleton-shimmer w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error: show message + retry (no fake data) */}
        {!loading && error && (
          <div
            className="max-w-xl mx-auto mb-8 flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200"
            role="alert"
          >
            <AlertCircle className="w-8 h-8 flex-shrink-0" aria-hidden />
            <div className="text-center sm:text-left flex-1">
              <p className="font-semibold text-sm">{lang === 'en' ? 'Could not load schemes' : 'పథకాలు లోడ్ చేయలేకపోయాము'}</p>
              <p className="text-xs mt-1 opacity-90">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-semibold whitespace-nowrap"
            >
              {lang === 'en' ? 'Retry' : 'మళ్లీ ప్రయత్నించండి'}
            </button>
          </div>
        )}

        {/* Scheme cards from GET /api/schemes */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {schemes.map((scheme, i) => {
              const { imageKey, iconName, colorKey } = visualsForScheme(scheme);
              const Icon = ICONS[iconName] || Sprout;
              const colors = COLOR_MAP[colorKey] || COLOR_MAP.green;
              const imgSrc = SCHEME_IMAGES[imageKey] ?? SCHEME_IMAGES.farmers;
              return (
                <article
                  key={scheme.id}
                  className={`group relative bg-white dark:bg-green-900/40 rounded-2xl border border-green-100 dark:border-green-700/60 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${colors.hover}`}
                  style={{
                    transitionDelay: `${i * 60}ms`,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(24px)',
                  }}
                >
                  <div className="h-36 overflow-hidden relative">
                    <img
                      src={imgSrc}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <span
                        className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${lang === 'en' ? 'capitalize' : ''} ${colors.badge}`}
                      >
                        {scheme.category}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 ${lang === 'te' ? 'font-telugu leading-relaxed' : ''}`}>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className={`p-2 rounded-xl ${colors.icon}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-green-900 dark:text-green-100 text-sm leading-snug">{scheme.scheme_name}</h3>
                    </div>

                    <p className="text-xs font-semibold text-green-800 dark:text-green-200 uppercase tracking-wide mb-1">
                      {lang === 'en' ? 'Benefits' : 'ప్రయోజనాలు'}
                    </p>
                    <p className="text-xs text-green-600/80 dark:text-green-400/80 leading-relaxed line-clamp-3">{scheme.benefits}</p>

                    <div className="mt-3 rounded-xl bg-green-50/80 dark:bg-green-950/40 border border-green-100 dark:border-green-800 p-3">
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 dark:text-green-200 uppercase tracking-wide mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {lang === 'en' ? 'Eligibility' : 'అర్హత'}
                    </p>
                    <p className="text-xs text-green-600/80 dark:text-green-400/80 leading-relaxed line-clamp-3">{scheme.eligibility}</p>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-300">
                      <span className={`px-2 py-0.5 rounded-md ${lang === 'en' ? 'capitalize' : ''} ${colors.tag}`}>{scheme.category}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && schemes.length === 0 && (
          <p className="text-center text-green-600 dark:text-green-400 text-sm py-8">
            {lang === 'en' ? 'No schemes returned from the API.' : 'API నుండి పథకాలు ఏవీ రాలేదు.'}
          </p>
        )}
      </div>
    </section>
  );
}
