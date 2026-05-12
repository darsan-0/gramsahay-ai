import { Leaf, Mail, Phone, Twitter, Facebook, Youtube, Instagram, ArrowUpCircle } from 'lucide-react';
import { translations, type Language } from '../data/content';

interface FooterProps {
  lang: Language;
}

export default function Footer({ lang }: FooterProps) {
  const t = translations[lang].footer;
  const nav = translations[lang].nav;

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
    <footer id="contact" className="bg-green-950 text-white">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-green-800 to-green-700 px-4 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2 font-display">
            {lang === 'en' ? 'Start exploring welfare schemes today' : 'ఈరోజే సంక్షేమ పథకాలు అన్వేషించడం ప్రారంభించండి'}
          </h3>
          <p className="text-green-200 text-sm mb-6">
            {lang === 'en'
              ? 'Free • Multilingual • AI-Powered • Designed for Rural India'
              : 'ఉచితం • బహుభాషా • AI-ఆధారిత • గ్రామీణ భారత్ కోసం రూపొందించబడింది'}
          </p>
          <button
            onClick={() => scrollTo('#chat')}
            className="inline-flex items-center gap-2 px-7 py-3 bg-saffron-500 hover:bg-saffron-400 text-white font-semibold rounded-full shadow-lg transition-all"
          >
            <Leaf className="w-5 h-5" />
            {lang === 'en' ? 'Chat with GramSahay AI' : 'గ్రామ్‌సహాయ్ AI తో చాట్ చేయండి'}
          </button>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white">GramSahay</span>
                <span className="text-saffron-400 font-bold ml-1">AI</span>
              </div>
            </div>
            <p className="text-green-300/70 text-sm leading-relaxed mb-4 max-w-sm">
              {t.about}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-saffron-500/20 border border-saffron-500/30 rounded-full">
              <span className="w-2 h-2 bg-saffron-400 rounded-full animate-pulse" />
              <span className="text-saffron-300 text-xs font-semibold">{t.csi}</span>
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[Twitter, Facebook, Youtube, Instagram].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 bg-green-800 hover:bg-green-700 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-green-300" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">{t.links}</h4>
            <ul className="space-y-2.5">
              {links.map(link => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-green-300/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">{t.contact}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-saffron-400 flex-shrink-0 mt-0.5" />
                <span className="text-green-300/70 text-sm">{t.contactEmail}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-saffron-400 flex-shrink-0 mt-0.5" />
                <span className="text-green-300/70 text-sm">{t.contactPhone}</span>
              </div>
            </div>

            {/* Govt badges */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-900 rounded-lg border border-green-700">
                <div className="w-6 h-6 bg-saffron-500 rounded flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs text-green-300">Digital India Initiative</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-900 rounded-lg border border-green-700">
                <div className="w-6 h-6 bg-sky-600 rounded flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs text-green-300">Rural Empowerment Project</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-green-800 px-4 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-green-400/60 text-xs text-center">{t.rights}</p>
          <p className="text-green-500/40 text-xs">{t.disclaimer}</p>
          <button
            onClick={scrollTop}
            className="flex items-center gap-1.5 text-green-400 hover:text-white transition-colors text-xs"
          >
            <ArrowUpCircle className="w-4 h-4" />
            {lang === 'en' ? 'Back to top' : 'పైకి వెళ్ళు'}
          </button>
        </div>
      </div>
    </footer>
  );
}
