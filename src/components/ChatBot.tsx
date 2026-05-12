import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Bot,
  ChevronDown,
  Clock,
  GraduationCap,
  Heart,
  Mic,
  Send,
  Shield,
  Sparkles,
  Sprout,
  Stethoscope,
  UserRound,
  Volume2,
} from 'lucide-react';
import { translations, type Language } from '../data/content';
import { useLanguage } from '../context/LanguageContext';
import { useIntersection } from '../hooks/useIntersection';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { ApiError, postChatMessage, type SchemeRecord } from '../services/api';

interface ChatBotProps {
  /** Same scheme list as the schemes section — one source of truth from App. */
  schemes: SchemeRecord[];
  schemesLoading: boolean;
  schemesError: string | null;
  onRetrySchemes: () => void;
}

interface Message {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  time: string;
}

const PROMPT_CHIPS = [
  {
    key: 'farmer',
    icon: Sprout,
    label: 'Farmer Schemes',
    prompt: 'What schemes are available for farmers?',
  },
  {
    key: 'scholarship',
    icon: GraduationCap,
    label: 'Scholarships',
    prompt: 'What scholarships are available for rural students?',
  },
  {
    key: 'pension',
    icon: Shield,
    label: 'Pension Help',
    prompt: 'Tell me about pension schemes for elderly citizens.',
  },
  {
    key: 'health',
    icon: Stethoscope,
    label: 'Health Insurance',
    prompt: 'What health insurance schemes can my family use?',
  },
  {
    key: 'women',
    icon: Heart,
    label: 'Women Welfare',
    prompt: 'Which women welfare schemes are available?',
  },
];

/** Build assistant text from live API rows (no hardcoded scheme names in code). */
function formatSchemesDigest(schemes: SchemeRecord[], lang: Language): string {
  const benefitsLabel = lang === 'en' ? 'Benefits' : 'ప్రయోజనాలు';
  const eligibilityLabel = lang === 'en' ? 'Eligibility' : 'అర్హత';
  const header =
    lang === 'en'
      ? 'Here are the schemes currently returned by the GramSahay API:'
      : 'గ్రామ్‌సహాయ్ API ప్రస్తుతం ఇచ్చే పథకాలు:';

  const blocks = schemes.map(
    (s) =>
      `• **${s.scheme_name}** (${s.category})\n` +
      `  _${benefitsLabel}:_ ${s.benefits}\n` +
      `  _${eligibilityLabel}:_ ${s.eligibility}`
  );

  return `${header}\n\n${blocks.join('\n\n')}`;
}

export default function ChatBot({ schemes, schemesLoading, schemesError, onRetrySchemes }: ChatBotProps) {
  const { lang, setLang } = useLanguage();
  const t = translations[lang].chat;

  /** Strings passed into the voice hook (keeps hook free of i18n imports). */
  const voiceStrings = useMemo(
    () => ({
      voiceUnsupported: t.voiceUnsupported,
      voicePermissionDenied: t.voicePermissionDenied,
      voiceNoSpeech: t.voiceNoSpeech,
      voiceAborted: t.voiceAborted,
      voiceGenericError: t.voiceGenericError,
    }),
    [t.voiceAborted, t.voiceGenericError, t.voiceNoSpeech, t.voicePermissionDenied, t.voiceUnsupported]
  );

  const voice = useVoiceAssistant(lang, voiceStrings);

  const [readAloud, setReadAloud] = useState(true);
  const [voiceAutoSend, setVoiceAutoSend] = useState(true);
  const readAloudRef = useRef(readAloud);
  const voiceAutoSendRef = useRef(voiceAutoSend);
  useEffect(() => {
    readAloudRef.current = readAloud;
  }, [readAloud]);
  useEffect(() => {
    voiceAutoSendRef.current = voiceAutoSend;
  }, [voiceAutoSend]);

  const { ref, visible } = useIntersection();

  const initialMessages: Message[] = translations[lang].chat.messages.map(m => ({
    ...m,
    role: m.role as 'assistant' | 'user',
  }));

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  /** Avoid duplicating the schemes digest when React Strict Mode re-runs effects. */
  const schemesDigestAdded = useRef(false);

  /** Stable ref so voice STT callback always calls the latest sender (avoids stale closures). */
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => {});

  const sendMessage = useCallback(
    async (outgoing: string) => {
      const trimmed = outgoing.trim();
      if (!trimmed || isTyping) return;

      const userMsg: Message = {
        id: Date.now(),
        role: 'user',
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

    let replyToSpeak: string | null = null;

    try {
      const data = await postChatMessage({
        message: trimmed,
        language: lang,
      });
      const replyText =
        typeof data.reply === 'string' && data.reply.trim().length > 0
          ? data.reply.trim()
          : typeof data.response === 'string' && data.response.trim().length > 0
            ? data.response.trim()
          : lang === 'en'
            ? 'The server responded without a reply body.'
            : 'సర్వర్ సమాధానం లేకుండా ప్రతిస్పందించింది.';

      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
      replyToSpeak = replyText;
    } catch (e) {
      const fallback =
        e instanceof ApiError
          ? e.status === 0
            ? `${e.message} (${lang === 'en' ? 'check Flask is running on port 5000' : 'Flask పోర్ట్ 5000లో అమలవుతోందో తనిఖీ చేయండి'})`
            : e.message
          : lang === 'en'
            ? 'Something went wrong while contacting the server.'
            : 'సర్వర్‌ను సంప్రదించడంలో ఏదో తప్పు జరిగింది.';

      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: fallback,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
      replyToSpeak = fallback;
    } finally {
      setIsTyping(false);
    }

    if (replyToSpeak && readAloudRef.current && voice.synthesisSupported) {
      voice.speak(replyToSpeak);
    }
    },
    [isTyping, lang, voice]
  );

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    setMessages(
      translations[lang].chat.messages.map(m => ({
        ...m,
        role: m.role as 'assistant' | 'user',
      }))
    );
    schemesDigestAdded.current = false;
  }, [lang]);

  /** After schemes load from Flask, append one assistant bubble with real rows. */
  useEffect(() => {
    if (schemesLoading || schemesError || schemes.length === 0) return;
    if (schemesDigestAdded.current) return;
    schemesDigestAdded.current = true;

    const digest: Message = {
      id: Date.now(),
      role: 'assistant',
      text: formatSchemesDigest(schemes, lang),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, digest]);
  }, [schemesLoading, schemesError, schemes, lang]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback(() => {
    void sendMessage(input.trim());
  }, [input, sendMessage]);

  const handleMicClick = useCallback(() => {
    voice.clearVoiceError();
    if (!voice.recognitionSupported) return;

    if (voice.phase === 'listening') {
      voice.stopListening();
      return;
    }
    if (voice.phase === 'speaking') {
      voice.stopSpeaking();
      return;
    }

    voice.startListening(text => {
      setInput(text);
      if (voiceAutoSendRef.current) {
        void sendMessageRef.current(text);
      }
    });
  }, [voice]);

  const handleSuggestion = (prompt: string) => {
    setInput(prompt);
  };

  const renderMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} className={i > 0 ? 'block mt-1' : ''} />;
    });
  };

  /** Bilingual UI only for now; extra languages can map here when data exists. */
  const messageFontClass = lang === 'te' ? 'font-telugu leading-relaxed' : '';

  const micListening = voice.phase === 'listening';
  const micSpeaking = voice.phase === 'speaking';

  return (
    <section id="chat" className="py-20 bg-earth-50 dark:bg-green-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={ref}
          className={`text-center mb-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 text-sm font-medium">
              {lang === 'en' ? 'AI Assistant' : 'AI సహాయకుడు'}
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-green-900 dark:text-green-50 font-display">{t.title}</h2>
          <p className="mt-3 text-green-700/70 dark:text-green-300/70 text-lg max-w-xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Suggestions panel */}
          <div className={`lg:col-span-2 space-y-4 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">
              {lang === 'en' ? 'Quick Prompts' : 'త్వరిత ప్రాంప్టులు'}
            </h3>
            {PROMPT_CHIPS.map((s) => {
              const Icon = s.icon;
              return (
              <button
                key={s.label}
                type="button"
                onClick={() => handleSuggestion(s.prompt)}
                className="w-full flex items-center gap-3 p-4 bg-white/90 dark:bg-green-900/70 rounded-2xl border border-green-100 dark:border-green-700 hover:border-green-300 dark:hover:border-green-500 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group text-left"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-700 ring-1 ring-green-100 transition-all group-hover:bg-green-700 group-hover:text-white dark:bg-green-800 dark:text-green-200 dark:ring-green-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold text-green-900 dark:text-green-100 text-sm group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">{s.label}</div>
                  <div className="text-xs text-green-600/60 dark:text-green-400/60 mt-0.5 line-clamp-1">{s.prompt}</div>
                </div>
              </button>
              );
            })}

            {/* Mirrors navbar: drives the same context + POST /api/chat `language` field. */}
            <div className="p-4 bg-white dark:bg-green-900/60 rounded-2xl border border-green-100 dark:border-green-700">
              <label className="block text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">
                {t.selectLang}
              </label>
              <div className="relative">
                <select
                  value={lang}
                  onChange={e => setLang(e.target.value === 'te' ? 'te' : 'en')}
                  className={`w-full appearance-none bg-earth-50 dark:bg-green-800 text-green-900 dark:text-green-100 rounded-xl px-3 py-2.5 text-sm border border-green-200 dark:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 pr-8 ${lang === 'te' ? 'font-telugu' : ''}`}
                >
                  <option value="en">English</option>
                  <option value="te">తెలుగు</option>
                </select>
                <ChevronDown className="w-4 h-4 text-green-600 dark:text-green-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* API status: schemes power both gallery and digest */}
            <div className="p-4 bg-green-700 rounded-2xl text-white">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-saffron-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">
                    {lang === 'en' ? 'Live API' : 'లైవ్ API'}
                  </p>
                  <p className="text-xs text-green-200 leading-relaxed">
                    {schemesLoading && (lang === 'en' ? 'Loading schemes…' : 'పథకాలు లోడ్ అవుతున్నాయి…')}
                    {!schemesLoading && schemesError && (
                      <>
                        {lang === 'en' ? 'Schemes error: ' : 'పథకాల లోడ్ లోపం: '}
                        {schemesError}
                        <button
                          type="button"
                          onClick={() => {
                            void onRetrySchemes();
                          }}
                          className="block mt-2 underline font-semibold text-white"
                        >
                          {lang === 'en' ? 'Retry' : 'మళ్లీ ప్రయత్నించండి'}
                        </button>
                      </>
                    )}
                    {!schemesLoading && !schemesError && (
                      <>
                        {lang === 'en'
                          ? `Connected to Flask — ${schemes.length} scheme(s) loaded.`
                          : `Flask కు అనుసంధానమైంది — ${schemes.length} పథకం(లు) లోడ్ అయ్యాయి.`}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat window */}
          <div className={`lg:col-span-3 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="bg-white/95 dark:bg-green-900/70 rounded-[2rem] border border-green-100 dark:border-green-700 shadow-2xl shadow-green-900/10 overflow-hidden backdrop-blur">
              {/* Chat header */}
              <div className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-700 px-5 py-4 flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center ring-1 ring-white/20 ai-pulse-glow">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-green-800" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">GramSahay AI</p>
                  <p className="text-green-300 text-xs">{lang === 'en' ? 'Online • Multilingual Support' : 'ఆన్‌లైన్ • బహుభాషా మద్దతు'}</p>
                </div>
                <div className="ml-auto flex gap-1.5">
                  {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="h-[26rem] overflow-y-auto px-4 sm:px-5 py-5 space-y-5 bg-gradient-to-b from-earth-50/70 via-white to-white dark:from-green-950/50 dark:via-green-950/20 dark:to-green-900/30">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 animate-message-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-9 h-9 bg-green-700 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-green-900/20">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div className="w-9 h-9 bg-saffron-500 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-saffron-900/20">
                        <UserRound className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div
                        className={`px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'assistant'
                            ? 'bg-white dark:bg-green-800 text-green-900 dark:text-green-100 rounded-tl-md border border-green-100 dark:border-green-700'
                            : 'bg-gradient-to-br from-green-700 to-emerald-600 text-white rounded-tr-md'
                        } ${messageFontClass}`}
                      >
                        {renderMessage(msg.text)}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-500/70 dark:text-green-500/50 px-1">
                        <span>{msg.role === 'assistant' ? 'GramSahay AI' : lang === 'en' ? 'You' : 'మీరు'}</span>
                        <Clock className="h-3 w-3" />
                        <span>{msg.time}</span>
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2.5">
                    <div className="w-9 h-9 bg-green-700 rounded-2xl flex items-center justify-center flex-shrink-0 ai-pulse-glow">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-green-800 border border-green-100 dark:border-green-700 shadow-sm rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map(i => (
                          <span
                            key={i}
                            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                        <span className="text-xs text-green-500/80 ml-2">
                          {lang === 'en' ? 'GramSahay AI is typing...' : t.typing}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Voice status strip: listening / speaking / errors (Web Speech API only) */}
              {(micListening || micSpeaking || voice.voiceError || voice.phase === 'error' || voice.phase === 'unsupported') && (
                <div
                  className={`px-5 py-2.5 flex items-center gap-3 border-t border-green-100 dark:border-green-700 ${
                    voice.voiceError || voice.phase === 'error' || voice.phase === 'unsupported'
                      ? 'bg-red-50 dark:bg-red-950/30'
                      : micSpeaking
                        ? 'bg-sky-50 dark:bg-sky-950/20'
                        : 'bg-green-50 dark:bg-green-900/30'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {micListening && (
                    <div className="flex items-end gap-0.5 h-7" aria-hidden>
                      {[0, 1, 2, 3, 4].map(i => (
                        <span
                          key={i}
                          className="w-1 rounded-full bg-green-600 dark:bg-green-400 origin-bottom voice-wave-bar"
                          style={{
                            height: `${10 + (i % 3) * 8}px`,
                            animationDelay: `${i * 0.12}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {micSpeaking && <Volume2 className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0 animate-pulse" aria-hidden />}
                  <p className={`text-xs font-medium flex-1 ${lang === 'te' ? 'font-telugu' : ''} ${voice.voiceError || voice.phase === 'error' || voice.phase === 'unsupported' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
                    {voice.voiceError ||
                      (micSpeaking ? t.voiceSpeaking : micListening ? t.voiceListening : t.voiceUnsupported)}
                  </p>
                </div>
              )}

              {/* Input + voice (mic uses browser SpeechRecognition — no cloud keys) */}
              <div className="px-5 py-4 border-t border-green-100 dark:border-green-700 bg-white dark:bg-green-900/40 space-y-3">
                {!voice.recognitionSupported && (
                  <p className={`text-[11px] text-amber-800 dark:text-amber-200/90 leading-snug ${lang === 'te' ? 'font-telugu' : ''}`}>
                    {t.voiceUnsupported}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-green-800 dark:text-green-200">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-green-300 text-green-700 focus:ring-green-500"
                      checked={readAloud}
                      onChange={e => setReadAloud(e.target.checked)}
                    />
                    <span className={lang === 'te' ? 'font-telugu' : ''}>{t.readAloudLabel}</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-green-300 text-green-700 focus:ring-green-500"
                      checked={voiceAutoSend}
                      onChange={e => setVoiceAutoSend(e.target.checked)}
                    />
                    <span className={lang === 'te' ? 'font-telugu' : ''}>{t.autoSendVoiceLabel}</span>
                  </label>
                </div>

                <div className="flex gap-2.5 items-center">
                  <div className="relative flex-shrink-0">
                    {micListening && (
                      <span className="absolute inset-0 rounded-2xl bg-green-400/40 animate-ping" aria-hidden />
                    )}
                    <button
                      type="button"
                      onClick={handleMicClick}
                      disabled={!voice.recognitionSupported || isTyping}
                      title={
                        !voice.recognitionSupported
                          ? t.voiceUnsupported
                          : micListening
                            ? t.voiceStopMic
                            : t.voiceTapMic
                      }
                      aria-label={micListening ? t.voiceStopMic : t.voiceTapMic}
                      aria-pressed={micListening}
                      className={`relative z-10 p-3 rounded-2xl transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                        micListening
                          ? 'mic-glow-active bg-green-600 text-white ring-2 ring-green-300/80 scale-105'
                          : micSpeaking
                            ? 'bg-sky-600 text-white animate-pulse'
                            : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-800 hover:-translate-y-0.5'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && void handleSend()}
                    placeholder={t.placeholder}
                    className={`min-h-12 flex-1 bg-earth-50 dark:bg-green-800 text-green-900 dark:text-green-100 placeholder-green-500/50 dark:placeholder-green-400/40 rounded-2xl px-4 py-3 text-base sm:text-sm border border-green-200 dark:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${lang === 'te' ? 'font-telugu' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="p-3 bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl transition-all hover:-translate-y-0.5 flex-shrink-0 shadow-md"
                    aria-label={t.send}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
