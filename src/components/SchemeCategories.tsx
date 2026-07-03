import { useState, useMemo } from 'react';
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
  Search,
  X,
  FileText,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../data/content';
import { useLanguage } from '../context/LanguageContext';
import type { SchemeRecord } from '../services/api';

interface SchemeCategoriesProps {
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

const COLOR_MAP: Record<string, { icon: string; badge: string; hover: string; tag: string; glow: string; panel: string; border: string }> = {
  green: {
    icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-600 text-white',
    hover: 'hover:border-emerald-300 hover:shadow-emerald-100/30 dark:hover:shadow-none',
    tag: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
    glow: 'from-emerald-300/20 to-teal-300/5 dark:from-emerald-500/10 dark:to-teal-500/2',
    panel: 'from-emerald-500/10 to-teal-500/5 dark:from-emerald-600/15 dark:to-teal-600/5',
    border: 'border-emerald-100 dark:border-emerald-900/40'
  },
  sky: {
    icon: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-600 text-white',
    hover: 'hover:border-sky-300 hover:shadow-sky-100/30 dark:hover:shadow-none',
    tag: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400',
    glow: 'from-sky-300/20 to-blue-300/5 dark:from-sky-500/10 dark:to-blue-500/2',
    panel: 'from-sky-500/10 to-blue-500/5 dark:from-sky-600/15 dark:to-blue-600/5',
    border: 'border-sky-100 dark:border-sky-900/40'
  },
  saffron: {
    icon: 'bg-saffron-100 dark:bg-saffron-900/30 text-saffron-700 dark:text-saffron-300',
    badge: 'bg-saffron-500 text-white',
    hover: 'hover:border-saffron-300 hover:shadow-saffron-100/30 dark:hover:shadow-none',
    tag: 'bg-saffron-50 dark:bg-saffron-950/40 text-saffron-750 dark:text-saffron-400',
    glow: 'from-amber-300/20 to-orange-300/5 dark:from-amber-500/10 dark:to-orange-500/2',
    panel: 'from-amber-500/10 to-orange-500/5 dark:from-amber-600/15 dark:to-orange-600/5',
    border: 'border-saffron-100 dark:border-saffron-900/40'
  },
  red: {
    icon: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    badge: 'bg-red-650 text-white',
    hover: 'hover:border-red-350 hover:shadow-red-100/30 dark:hover:shadow-none',
    tag: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400',
    glow: 'from-red-300/20 to-rose-300/5 dark:from-red-500/10 dark:to-rose-500/2',
    panel: 'from-red-500/10 to-rose-500/5 dark:from-red-600/15 dark:to-rose-600/5',
    border: 'border-red-100 dark:border-red-900/40'
  },
  earth: {
    icon: 'bg-stone-100 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300',
    badge: 'bg-stone-600 text-white',
    hover: 'hover:border-stone-300 hover:shadow-stone-100/30 dark:hover:shadow-none',
    tag: 'bg-stone-50 dark:bg-stone-950/40 text-stone-750 dark:text-stone-400',
    glow: 'from-stone-300/20 to-zinc-300/5 dark:from-stone-500/10 dark:to-zinc-500/2',
    panel: 'from-stone-500/10 to-zinc-500/5 dark:from-stone-600/15 dark:to-zinc-600/5',
    border: 'border-stone-100 dark:border-stone-900/40'
  },
  blue: {
    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-600 text-white',
    hover: 'hover:border-blue-300 hover:shadow-blue-100/30 dark:hover:shadow-none',
    tag: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
    glow: 'from-indigo-300/20 to-blue-300/5 dark:from-indigo-500/10 dark:to-blue-500/2',
    panel: 'from-indigo-500/10 to-blue-500/5 dark:from-indigo-600/15 dark:to-indigo-600/5',
    border: 'border-blue-100 dark:border-blue-900/40'
  },
  orange: {
    icon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-500 text-white',
    hover: 'hover:border-orange-350 hover:shadow-orange-100/30 dark:hover:shadow-none',
    tag: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
    glow: 'from-orange-300/20 to-yellow-300/5 dark:from-orange-500/10 dark:to-yellow-500/2',
    panel: 'from-orange-500/10 to-yellow-500/5 dark:from-orange-600/15 dark:to-orange-600/5',
    border: 'border-orange-100 dark:border-orange-900/40'
  },
};

function visualsForScheme(scheme: SchemeRecord): { iconName: string; colorKey: string } {
  const cat = (scheme.category_code ?? '').toLowerCase();
  if (cat === 'agriculture' || cat === 'farmers') {
    return { iconName: 'Sprout', colorKey: 'green' };
  }
  if (cat === 'education' || cat === 'students') {
    return { iconName: 'GraduationCap', colorKey: 'sky' };
  }
  if (cat === 'health') {
    return { iconName: 'Stethoscope', colorKey: 'red' };
  }
  if (cat === 'pension') {
    return { iconName: 'Shield', colorKey: 'earth' };
  }
  if (cat === 'employment') {
    return { iconName: 'Briefcase', colorKey: 'blue' };
  }
  if (cat === 'women' || cat === 'women_welfare') {
    return { iconName: 'Heart', colorKey: 'saffron' };
  }
  return { iconName: 'TrendingUp', colorKey: 'orange' };
}

export default function SchemeCategories({
  schemes,
  schemesLoading: loading,
  schemesError: error,
  onRetrySchemes: refetch,
}: SchemeCategoriesProps) {
  const { lang } = useLanguage();
  const t = translations[lang].schemes;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tabs = useMemo(() => {
    return [
      { key: 'all', label: lang === 'en' ? 'All Schemes' : 'అన్ని పథకాలు', icon: Sparkles },
      { key: 'agriculture', label: lang === 'en' ? 'Farmers' : 'రైతులు', icon: Sprout },
      { key: 'education', label: lang === 'en' ? 'Students' : 'విద్యార్థులు', icon: GraduationCap },
      { key: 'women_welfare', label: lang === 'en' ? 'Women' : 'మహిళలు', icon: Heart },
      { key: 'health', label: lang === 'en' ? 'Health' : 'ఆరోగ్యం', icon: Stethoscope },
      { key: 'pension', label: lang === 'en' ? 'Pension' : 'పెన్షన్', icon: Shield },
      { key: 'employment', label: lang === 'en' ? 'Employment' : 'ఉపాధి', icon: Briefcase },
      { key: 'entrepreneurship', label: lang === 'en' ? 'Business' : 'వ్యాపారం', icon: TrendingUp }
    ];
  }, [lang]);

  const filteredSchemes = useMemo(() => {
    return schemes.filter((s) => {
      const catCode = (s.category_code ?? '').toLowerCase();
      
      const matchesCategory =
        selectedCategory === 'all' ||
        catCode === selectedCategory.toLowerCase() ||
        (selectedCategory === 'women_welfare' && catCode === 'women') ||
        (selectedCategory === 'agriculture' && catCode === 'farmers') ||
        (selectedCategory === 'education' && catCode === 'students');

      const matchesSearch =
        s.scheme_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.benefits.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.eligibility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [schemes, selectedCategory, searchQuery]);

  return (
    <section id="schemes" className="py-24 bg-stone-50 dark:bg-emerald-950/20 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-saffron-50 dark:bg-saffron-900/30 border border-saffron-100 dark:border-saffron-800 rounded-full">
            <Sprout className="w-3.5 h-3.5 text-saffron-600 dark:text-saffron-400" />
            <span className="text-saffron-850 dark:text-saffron-300 text-xs font-bold uppercase tracking-wider">
              {lang === 'en' ? 'Welfare Registry' : 'సంక్షేమ పథకాలు'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-emerald-950 dark:text-emerald-50 font-display">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-emerald-800/60 dark:text-emerald-300/60 max-w-xl mx-auto font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Filter Controls (Search + Categories) */}
        <div className="mb-12 space-y-6">
          {/* Search Input Box */}
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-emerald-600/70" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search schemes by name, benefit, or criteria...' : 'పేరు, ప్రయోజనం, లేదా అర్హత ద్వారా పథకాలు వెతకండి...'}
              className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl text-emerald-950 dark:text-emerald-50 placeholder-emerald-900/30 dark:placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-emerald-600/70 hover:text-emerald-900"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = selectedCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 focus:outline-none ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white dark:bg-emerald-900/15 border border-emerald-100/50 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 hover:border-emerald-250 dark:hover:border-emerald-700'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6 py-12 text-emerald-700 dark:text-emerald-300" aria-live="polite">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-sm font-semibold uppercase tracking-wider">
                {lang === 'en' ? 'Fetching Scheme Database...' : 'పథకాల డేటాబేస్ లోడ్ అవుతోంది...'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-emerald-100/60 dark:border-emerald-800/35 bg-white dark:bg-emerald-900/10 overflow-hidden shadow-sm h-96 skeleton-shimmer"
                />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            className="max-w-xl mx-auto mb-8 flex flex-col sm:flex-row items-center gap-4 p-5 rounded-3xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200 shadow-md"
            role="alert"
          >
            <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
            <div className="text-center sm:text-left flex-1 space-y-1">
              <p className="font-bold text-sm">{lang === 'en' ? 'Connection Error' : 'కనెక్టివిటీ లోపం'}</p>
              <p className="text-xs text-red-700/80 dark:text-red-300/85 leading-relaxed">{error}</p>
            </div>
            <button
              type="button"
              onClick={refetch}
              className="px-5 py-2.5 rounded-full bg-red-650 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-sm"
            >
              {lang === 'en' ? 'Retry' : 'మళ్లీ ప్రయత్నించండి'}
            </button>
          </div>
        )}

        {/* Schemes Cards Grid */}
        {!loading && !error && (
          <AnimatePresence mode="popLayout">
            {filteredSchemes.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredSchemes.map((scheme) => {
                  const { iconName, colorKey } = visualsForScheme(scheme);
                  const Icon = ICONS[iconName] || Sprout;
                  const colors = COLOR_MAP[colorKey] || COLOR_MAP.green;
                  
                  return (
                    <motion.article
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      key={scheme.id}
                      className={`group relative overflow-hidden rounded-3xl border ${colors.border} bg-white dark:bg-emerald-950/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${colors.hover}`}
                    >
                      {/* Gradient Header Banner */}
                      <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${colors.panel} p-5 flex items-center justify-between`}>
                        <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl ${colors.glow}`} />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_55%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.1),transparent_55%)]" />
                        
                        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 ${colors.icon} shadow-sm z-10`}>
                          <Icon className="h-5.5 w-5.5" />
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 ${colors.badge}`}>
                          {scheme.category}
                        </span>
                      </div>

                      {/* Main Card Body */}
                      <div className={`p-5 flex-1 flex flex-col justify-between ${lang === 'te' ? 'font-telugu leading-relaxed' : ''}`}>
                        <div className="space-y-4 text-left">
                          <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-base leading-snug min-h-12 flex items-center">
                            {scheme.scheme_name}
                          </h3>

                          {/* Benefits description */}
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-emerald-800/40 dark:text-emerald-100/30 uppercase tracking-widest">
                              {lang === 'en' ? 'Benefits' : 'ప్రయోజనాలు'}
                            </p>
                            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed line-clamp-3 font-medium">
                              {scheme.benefits}
                            </p>
                          </div>

                          {/* Eligibility parameters */}
                          <div className="rounded-2xl bg-emerald-55/30 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/40 p-4 space-y-1">
                            <p className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800/40 dark:text-emerald-100/30 uppercase tracking-widest">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              {lang === 'en' ? 'Eligibility' : 'అర్హత'}
                            </p>
                            <p className="text-xs text-emerald-800/85 dark:text-emerald-300/85 leading-relaxed line-clamp-2 font-medium">
                              {scheme.eligibility}
                            </p>
                          </div>
                        </div>

                        {/* Needed Document checklist */}
                        {scheme.documents && scheme.documents.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-emerald-100/50 dark:border-emerald-800/30 text-left">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700/60 dark:text-emerald-300/50 uppercase tracking-wider">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{lang === 'en' ? 'Required Documents' : 'అవసరమైన పత్రాలు'}</span>
                            </div>
                            <p className="text-[11px] text-emerald-800/70 dark:text-emerald-300/65 font-medium truncate mt-1">
                              {scheme.documents.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center space-y-3"
              >
                <p className="text-emerald-700/60 dark:text-emerald-300/50 text-sm font-semibold">
                  {lang === 'en' ? 'No matching schemes found.' : 'తగిన పథకాలు ఏవీ కనుగొనబడలేదు.'}
                </p>
                <button
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md focus:outline-none"
                >
                  {lang === 'en' ? 'Reset Filters' : 'ఫిల్టర్లు రీసెట్ చేయండి'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
