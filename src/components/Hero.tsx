import { ArrowRight, MessageCircle, Sparkles, ChevronDown } from 'lucide-react';
import { translations, type Language } from '../data/content';

interface HeroProps {
  lang: Language;
}

export default function Hero({ lang }: HeroProps) {
  const t = translations[lang].hero;

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient">
      {/* Background image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/2253573/pexels-photo-2253573.jpeg?auto=compress&cs=tinysrgb&w=1600')" }}
      />

      {/* Radial overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-950/60 via-green-900/40 to-green-950/80" />

      {/* Floating circles decoration */}
      <div className="absolute top-20 right-16 w-72 h-72 bg-saffron-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-600/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-saffron-500/20 border border-saffron-400/40 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-saffron-300" />
              <span className="text-saffron-200 text-sm font-medium">{t.badge}</span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight font-display">
                {t.title}
              </h1>
              <div className="mt-1 h-1 w-24 bg-gradient-to-r from-saffron-400 to-saffron-600 rounded-full" />
            </div>

            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-green-100/90 font-medium leading-relaxed">
              {t.subtitle}
            </p>

            <p className="text-base text-green-200/70 leading-relaxed max-w-lg">
              {t.desc}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => scrollTo('#chat')}
                className="group flex items-center gap-2.5 px-7 py-3.5 bg-saffron-500 hover:bg-saffron-400 text-white font-semibold rounded-full shadow-lg hover:shadow-saffron-500/30 hover:shadow-xl transition-all duration-300 animate-pulse-glow"
              >
                <MessageCircle className="w-5 h-5" />
                {t.cta1}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo('#schemes')}
                className="flex items-center gap-2.5 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/30 backdrop-blur-sm transition-all duration-300"
              >
                {t.cta2}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { value: '175+', label: lang === 'en' ? 'Schemes' : 'పథకాలు' },
                { value: '8', label: lang === 'en' ? 'Languages' : 'భాషలు' },
                { value: '50K+', label: lang === 'en' ? 'Users Helped' : 'సహాయం' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-saffron-300">{stat.value}</div>
                  <div className="text-xs text-green-200/60 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual card */}
          <div className="relative hidden lg:flex justify-center items-center">
            {/* Main card */}
            <div className="relative w-full max-w-md">
              {/* Background glow */}
              <div className="absolute inset-0 bg-green-400/20 rounded-3xl blur-2xl scale-110" />

              {/* Card */}
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                {/* Image */}
                <div className="relative h-56 rounded-2xl overflow-hidden mb-5">
                  <img
                    src="https://images.pexels.com/photos/2255459/pexels-photo-2255459.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="Rural farmer with smartphone"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-950/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white/90 dark:bg-green-900/90 backdrop-blur-sm rounded-xl px-3 py-2">
                      <p className="text-green-900 dark:text-green-100 text-xs font-medium">
                        {lang === 'en' ? '"Found PM Kisan scheme in minutes!"' : '"PM కిసాన్ పథకం నిమిషాల్లో కనుగొన్నాను!"'}
                      </p>
                      <p className="text-green-600 dark:text-green-400 text-[10px] mt-0.5">— {lang === 'en' ? 'Ravi Kumar, Farmer, AP' : 'రవి కుమార్, రైతు, AP'}</p>
                    </div>
                  </div>
                </div>

                {/* Chat preview */}
                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-green-800/60 rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[260px]">
                      <p className="text-white text-xs leading-relaxed">
                        {lang === 'en'
                          ? 'I found 5 schemes you may be eligible for. Shall I explain each one?'
                          : 'మీకు అర్హత ఉన్న 5 పథకాలు కనుగొన్నాను. వివరిస్తానా?'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-saffron-500/80 rounded-2xl rounded-tr-none px-3.5 py-2.5 max-w-[200px]">
                      <p className="text-white text-xs">
                        {lang === 'en' ? 'Yes, please tell me more!' : 'అవును, మరింత చెప్పండి!'}
                      </p>
                    </div>
                  </div>
                  {/* Typing indicator */}
                  <div className="flex gap-2">
                    <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-green-800/60 rounded-2xl rounded-tl-none px-3.5 py-2.5">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map(i => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-saffron-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce-slow">
                AI Powered
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-green-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-green-100 animate-float-slow">
                {lang === 'en' ? 'Telugu Support' : 'తెలుగు మద్దతు'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => scrollTo('#schemes')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors"
      >
        <span className="text-xs">{lang === 'en' ? 'Scroll to explore' : 'అన్వేషించండి'}</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
}
