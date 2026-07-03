import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../data/content';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { lang } = useLanguage();
  const t = translations[lang].contact;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    message: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setSubmitting(true);
    // Simulate API dispatch delay
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', role: '', message: '' });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 bg-white dark:bg-emerald-950 overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-100 dark:border-saffron-850 rounded-full">
            <HelpCircle className="w-3.5 h-3.5 text-saffron-550" />
            <span className="text-saffron-800 dark:text-saffron-300 text-xs font-bold uppercase tracking-wider">
              {lang === 'en' ? 'Support Center' : 'సహాయ కేంద్రం'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50 font-display">
            {t.title}
          </h2>
          <p className="text-base sm:text-lg text-emerald-800/60 dark:text-emerald-300/60 max-w-xl mx-auto font-medium">
            {t.subtitle}
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl glass-card-light dark:glass-card-dark border border-emerald-100 dark:border-white/10 shadow-xl h-full flex flex-col justify-center text-left">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-800/60 dark:text-emerald-300/65 uppercase tracking-wide">
                      {lang === 'en' ? 'Your Name' : 'మీ పేరు'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t.namePlaceholder}
                      className="w-full px-4.5 py-3 rounded-xl bg-stone-50 dark:bg-emerald-900/10 border border-emerald-100/60 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  {/* Email field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-800/60 dark:text-emerald-300/65 uppercase tracking-wide">
                      {lang === 'en' ? 'Email Address' : 'ఈమెయిల్ చిరునామా'}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t.emailPlaceholder}
                      className="w-full px-4.5 py-3 rounded-xl bg-stone-50 dark:bg-emerald-900/10 border border-emerald-100/60 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Phone field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-800/60 dark:text-emerald-300/65 uppercase tracking-wide">
                      {lang === 'en' ? 'Phone Number' : 'ఫోన్ నంబర్'}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={t.phonePlaceholder}
                      className="w-full px-4.5 py-3 rounded-xl bg-stone-50 dark:bg-emerald-900/10 border border-emerald-100/60 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  {/* Role selection dropdown */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-800/60 dark:text-emerald-300/65 uppercase tracking-wide">
                      {lang === 'en' ? 'Occupation / Profile' : 'వృత్తి / ప్రొఫైల్'}
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-emerald-900/10 border border-emerald-100/60 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-55 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="" disabled>{t.rolePlaceholder}</option>
                      <option value="farmer">{t.roles.farmer}</option>
                      <option value="student">{t.roles.student}</option>
                      <option value="women">{t.roles.women}</option>
                      <option value="pensioner">{t.roles.pensioner}</option>
                      <option value="other">{t.roles.other}</option>
                    </select>
                  </div>
                </div>

                {/* Message field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-800/60 dark:text-emerald-300/65 uppercase tracking-wide">
                    {lang === 'en' ? 'Your Message' : 'మీ సందేశం'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t.messagePlaceholder}
                    className="w-full px-4.5 py-3 rounded-xl bg-stone-50 dark:bg-emerald-900/10 border border-emerald-100/60 dark:border-emerald-800/50 text-emerald-950 dark:text-emerald-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold rounded-full shadow-[0_4px_14px_rgba(16,185,129,0.3)] text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all focus:outline-none"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t.submit}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Submission success alerts */}
              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-left text-emerald-800 dark:text-emerald-300"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <p className="text-xs font-semibold leading-relaxed">
                      {t.success}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: CSI Office Details */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-950 text-white shadow-xl text-left space-y-6 h-full flex flex-col justify-center border border-white/5 relative overflow-hidden group">
              {/* Background ambient light */}
              <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-emerald-550/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              
              <div className="space-y-2 relative z-10">
                <h3 className="text-xl font-bold font-display">{t.infoTitle}</h3>
                <p className="text-xs sm:text-sm text-emerald-250/70 leading-relaxed font-medium">
                  {t.infoDesc}
                </p>
              </div>

              <div className="space-y-4.5 relative z-10">
                {/* Email address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4.5 h-4.5 text-saffron-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-300/50 uppercase tracking-widest">{lang === 'en' ? 'Email Support' : 'ఈమెయిల్ మద్దతు'}</p>
                    <p className="text-sm font-semibold text-emerald-50">{translations[lang].footer.contactEmail}</p>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4.5 h-4.5 text-saffron-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-300/50 uppercase tracking-widest">{lang === 'en' ? 'Phone Hotline' : 'ఫోన్ హాట్‌లైన్'}</p>
                    <p className="text-sm font-semibold text-emerald-50">{translations[lang].footer.contactPhone}</p>
                  </div>
                </div>

                {/* Office address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4.5 h-4.5 text-saffron-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-300/50 uppercase tracking-widest">{lang === 'en' ? 'College Chapter Cell' : 'కళాశాల చాప్టర్ సెల్'}</p>
                    <p className="text-sm font-semibold text-emerald-50 leading-snug">{t.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
