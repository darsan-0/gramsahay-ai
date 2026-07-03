import { useState, useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Mic, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations, type Language } from '../data/content';

interface HeroProps {
  lang: Language;
}

const CAROUSEL_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1592997573659-3b24d40d6606?auto=format&fit=crop&w=800&q=80',
    title: { en: 'Empowering Farmers', te: 'రైతులకు సాధికారత' },
    desc: { en: 'Access agricultural subsidies & crop insurance instantly.', te: 'వ్యవసాయ సబ్సిడీలు & పంట బీమా వివరాలు వెంటనే పొందండి.' }
  },
  {
    url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80',
    title: { en: 'Educational Growth', te: 'విద్యా రంగంలో ప్రగతి' },
    desc: { en: 'Find scholarship schemes for rural students easily.', te: 'గ్రామీణ విద్యార్థుల కోసం స్కాలర్‌షిప్ పథకాలను సులభంగా కనుగొనండి.' }
  },
  {
    url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    title: { en: 'Healthcare Support', te: 'ఆరోగ్య సంరక్షణ సహాయం' },
    desc: { en: 'Get complete medical coverage and health check details.', te: 'పూర్తి వైద్య కవరేజ్ మరియు ఆరోగ్య తనిఖీ వివరాలను పొందండి.' }
  },
  {
    url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
    title: { en: 'Digital Bharat', te: 'డిజిటల్ భారత్' },
    desc: { en: 'Bridging the digital divide with conversational AI.', te: 'సంభాషణ AI ద్వారా డిజిటల్ అంతరాన్ని తొలగించడం.' }
  }
];

export default function Hero({ lang }: HeroProps) {
  const t = translations[lang].hero;
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
    startTimer();
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    startTimer();
  };

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-hero-gradient bg-grid-pattern">
      {/* Decorative Blur Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-950/20 via-emerald-950/40 to-emerald-950/90 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-saffron-500/5 rounded-full blur-3xl pointer-events-none animate-float" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4.5 py-2 bg-saffron-500/10 border border-saffron-400/20 rounded-full backdrop-blur-md"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
              <span className="text-saffron-300 text-xs font-semibold uppercase tracking-wider">{t.badge}</span>
            </motion.div>

            {/* Title & Subtitle */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-display"
              >
                {t.title}
              </motion.h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-1 bg-gradient-to-r from-saffron-500 to-amber-400 rounded-full"
              />
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-emerald-100/90 font-medium leading-relaxed max-w-xl"
              >
                {t.subtitle}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-sm sm:text-base text-emerald-200/70 leading-relaxed max-w-lg"
              >
                {t.desc}
              </motion.p>
            </div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => scrollTo('#chat')}
                className="group flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-400 hover:to-saffron-500 text-white font-bold rounded-full shadow-[0_8px_20px_rgba(249,115,22,0.35)] transition-all duration-300 active:scale-95 text-sm uppercase tracking-wider"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                {t.cta1}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo('#schemes')}
                className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold rounded-full backdrop-blur-sm transition-all duration-300 active:scale-95 text-sm uppercase tracking-wider"
              >
                {t.cta2}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10 max-w-md"
            >
              {[
                { value: '175+', label: lang === 'en' ? 'Schemes Online' : 'పథకాలు ఆన్‌లైన్' },
                { value: '8', label: lang === 'en' ? 'Languages' : 'భాషలు' },
                { value: '50K+', label: lang === 'en' ? 'Helped Villagers' : 'సహాయం' },
              ].map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="text-xl sm:text-2xl font-bold text-saffron-400">{stat.value}</div>
                  <div className="text-[11px] font-semibold text-emerald-200/50 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>

          </div>

          {/* Right Column: Image Slideshow & Floating Cards */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0 flex justify-center items-center">
            
            {/* Glowing Border Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 rounded-[2rem] blur-2xl scale-105 pointer-events-none" />

            {/* Main Image Slideshow Container */}
            <div className="relative w-full max-w-md aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-teal-950/40">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIndex}
                  src={CAROUSEL_IMAGES[activeIndex].url}
                  alt={CAROUSEL_IMAGES[activeIndex].title[lang]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Image dark vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-transparent to-black/35" />

              {/* Left/Right Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/35 border border-white/10 hover:bg-black/60 text-white transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/35 border border-white/10 hover:bg-black/60 text-white transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Slide overlay text */}
              <div className="absolute bottom-6 left-6 right-6 p-5 glass-card-dark rounded-2xl border border-white/10 text-left space-y-1">
                <p className="text-[10px] font-bold tracking-wider text-saffron-400 uppercase">
                  {lang === 'en' ? 'AI Focus Areas' : 'AI ప్రాధాన్యత రంగాలు'}
                </p>
                <h3 className="text-base font-bold text-white leading-tight">
                  {CAROUSEL_IMAGES[activeIndex].title[lang]}
                </h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed">
                  {CAROUSEL_IMAGES[activeIndex].desc[lang]}
                </p>
              </div>

              {/* Carousel Indicators / Progress Bars */}
              <div className="absolute top-4 left-6 right-6 flex gap-2">
                {CAROUSEL_IMAGES.map((_, i) => (
                  <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-saffron-500 transition-all ${
                        i === activeIndex ? 'w-full duration-[5000ms] ease-linear' : i < activeIndex ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Badge: Voice Support */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-3 -right-3 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white border border-white/10 rounded-2xl shadow-xl z-20 text-xs font-bold"
            >
              <Mic className="w-4 h-4 text-saffron-300 animate-pulse" />
              <span className="font-sans">
                {lang === 'en' ? 'Telugu Voice Live' : 'తెలుగు వాయిస్ లైవ్'}
              </span>
            </motion.div>

            {/* Floating Badge: Real-time Connection */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-3 -left-3 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-teal-950 text-emerald-900 dark:text-emerald-50 border border-emerald-100 dark:border-white/10 rounded-2xl shadow-xl z-20 text-xs font-bold"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                {lang === 'en' ? '175+ Active Schemes' : '175+ యాక్టివ్ పథకాలు'}
              </span>
            </motion.div>

          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo('#schemes')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors focus:outline-none"
      >
        <span className="text-xs uppercase tracking-widest font-semibold">{lang === 'en' ? 'Explore Portal' : 'మరింత చూడండి'}</span>
        <ChevronDown className="w-4.5 h-4.5 animate-bounce" />
      </button>

    </section>
  );
}
