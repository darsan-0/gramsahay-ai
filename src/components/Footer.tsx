import { useState } from 'react';
import { Leaf, Mail, Phone, Twitter, Facebook, Youtube, Instagram, ArrowUp, Send, Check } from 'lucide-react';
import { translations, type Language } from '../data/content';

interface FooterProps {
  lang: Language;
}

export default function Footer({ lang }: FooterProps) {
  const t = translations[lang].footer;
  const nav = translations[lang].nav;

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const links = [
    { label: nav.home, href: '#home' },
    { label: nav.schemes, href: '#schemes' },
    { label: nav.features, href: '#features' },
    { label: nav.faq, href: '#faq' },
    { label: nav.contact, href: '#contact' },
  ];

  return (
    <footer className="bg-emerald-950 text-white overflow-hidden border-t border-emerald-900/50">
      
      {/* Premium CTA Banner */}
      <div className="relative py-14 px-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 border-b border-white/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            {lang === 'en' ? 'Start exploring welfare schemes today' : 'ఈరోజే సంక్షేమ పథకాలు అన్వేషించడం ప్రారంభించండి'}
          </h3>
          <p className="text-emerald-250/70 text-xs sm:text-sm font-semibold tracking-wide uppercase">
            {lang === 'en'
              ? 'Free • Multilingual • AI-Powered • Designed for Rural India'
              : 'ఉచితం • బహుభాషా • AI-ఆధారిత • గ్రామీణ భారత్ కోసం రూపొందించబడింది'}
          </p>
          <button
            onClick={() => scrollTo('#chat')}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-400 hover:to-saffron-500 text-white font-bold rounded-full shadow-[0_8px_24px_rgba(249,115,22,0.35)] transition-all duration-300 active:scale-95 text-xs uppercase tracking-wider focus:outline-none"
          >
            <Leaf className="w-4 h-4 animate-bounce" />
            {lang === 'en' ? 'Chat with GramSahay AI' : 'గ్రామ్‌సహాయ్ AI తో చాట్ చేయండి'}
          </button>
        </div>
      </div>

      {/* Main Structured Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 items-start">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <button
              onClick={() => scrollTo('#home')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <Leaf className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white">GramSahay</span>
                <span className="text-saffron-400 font-bold ml-1">AI</span>
              </div>
            </button>
            <p className="text-emerald-200/60 text-xs sm:text-sm leading-relaxed font-medium">
              {t.about}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-saffron-500/10 border border-saffron-500/20 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 bg-saffron-400 rounded-full animate-ping" />
              <span className="text-saffron-300 text-[10px] font-bold uppercase tracking-wider">{t.csi}</span>
            </div>

            {/* Social Icons */}
            <div className="flex gap-2">
              {[Twitter, Facebook, Youtube, Instagram].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 bg-white/5 hover:bg-emerald-650 hover:scale-105 rounded-xl border border-white/5 flex items-center justify-center transition-all duration-300 focus:outline-none"
                  aria-label="Social handle"
                >
                  <Icon className="w-4 h-4 text-emerald-200/80" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick links Column */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2">
              {t.links}
            </h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-emerald-250/70 hover:text-white text-xs sm:text-sm font-medium transition-colors focus:outline-none"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="lg:col-span-3 text-left space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2">
              {t.contact}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-saffron-400 shrink-0" />
                <span className="text-emerald-250/70 text-xs sm:text-sm font-medium truncate">{t.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-saffron-400 shrink-0" />
                <span className="text-emerald-250/70 text-xs sm:text-sm font-medium">{t.contactPhone}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="pt-3 space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-900/30 rounded-xl border border-white/5 shadow-sm">
                <div className="w-5 h-5 bg-saffron-500 rounded flex items-center justify-center shrink-0">
                  <Leaf className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider">Digital India Initiative</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-900/30 rounded-xl border border-white/5 shadow-sm">
                <div className="w-5 h-5 bg-sky-650 rounded flex items-center justify-center shrink-0">
                  <Leaf className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider">Rural Empowerment</span>
              </div>
            </div>
          </div>

          {/* Newsletter subscription box (client-side only) */}
          <div className="lg:col-span-3 text-left space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/5 pb-2">
              {lang === 'en' ? 'Newsletter' : 'వార్తా పత్రిక'}
            </h4>
            <p className="text-emerald-200/60 text-xs leading-relaxed font-medium">
              {lang === 'en' ? 'Subscribe to get notified about new government schemes.' : 'కొత్త ప్రభుత్వ పథకాల సమాచారం కోసం సబ్‌స్క్రైబ్ చేసుకోండి.'}
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={lang === 'en' ? 'Enter email...' : 'ఈమెయిల్ చిరునామా...'}
                className="w-full pl-3.5 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-emerald-200/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="absolute right-1 p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors focus:outline-none"
              >
                {subscribed ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
            {subscribed && (
              <p className="text-[11px] font-bold text-saffron-400 animate-pulse">
                {lang === 'en' ? 'Thank you for subscribing!' : 'సబ్‌స్క్రైబ్ చేసుకున్నందుకు ధన్యవాదాలు!'}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-emerald-900 py-6 bg-emerald-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-emerald-400/50 text-[10px] sm:text-xs font-medium text-center order-2 sm:order-1">
            {t.rights}
          </p>
          <p className="text-emerald-500/40 text-[10px] sm:text-xs font-semibold order-3 sm:order-2">
            {t.disclaimer}
          </p>
          <button
            onClick={scrollTop}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider order-1 sm:order-3 focus:outline-none"
          >
            <ArrowUp className="w-4 h-4" />
            {lang === 'en' ? 'Back to top' : 'పైకి వెళ్ళు'}
          </button>
        </div>
      </div>

    </footer>
  );
}
