import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import DOMPurify from 'dompurify';
import {
  Bot,
  ChevronDown,
  Clock,
  GraduationCap,
  Heart,
  MessageSquare,
  Mic,
  Minimize2,
  Send,
  Shield,
  Sparkles,
  Sprout,
  Stethoscope,
  UserRound,
  Volume2,
  X,
} from 'lucide-react';
import { translations, type Language } from '../data/content';
import { useLanguage } from '../context/LanguageContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { ApiError, postChatMessage, type SchemeRecord } from '../services/api';
import { ChatEmptyIllustration } from './PremiumVisuals';

interface ChatBotProps {
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
  { key: 'farmer', icon: Sprout, label: 'Farmer Schemes', prompt: 'What schemes are available for farmers?' },
  { key: 'scholarship', icon: GraduationCap, label: 'Scholarships', prompt: 'What scholarships are available for rural students?' },
  { key: 'pension', icon: Shield, label: 'Pension Help', prompt: 'Tell me about pension schemes for elderly citizens.' },
  { key: 'health', icon: Stethoscope, label: 'Health Insurance', prompt: 'What health insurance schemes can my family use?' },
  { key: 'women', icon: Heart, label: 'Women Welfare', prompt: 'Which women welfare schemes are available?' },
];

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSchemeId, setActiveSchemeId] = useState<string | null>(null);
  const [previousSchemeIds, setPreviousSchemeIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<Record<string, any>>({});
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const schemesDigestAdded = useRef(false);
  const readAloudRef = useRef(readAloud);
  const voiceAutoSendRef = useRef(voiceAutoSend);
  const sendMessageRef = useRef<(text: string) => Promise<void>>(async () => {});

  useEffect(() => {
    readAloudRef.current = readAloud;
  }, [readAloud]);

  useEffect(() => {
    voiceAutoSendRef.current = voiceAutoSend;
  }, [voiceAutoSend]);

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
        const history = messages.map(m => ({
          role: m.role,
          text: m.text
        }));

        const data = await postChatMessage({
          message: trimmed,
          language: lang,
          context: {
            history,
            active_scheme_id: activeSchemeId,
            previous_scheme_ids: previousSchemeIds,
            user_profile: userProfile
          }
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

        if (data.schemes) {
          const ids = data.schemes.map((s: any) => s.id).filter((id: any): id is string => typeof id === 'string');
          setPreviousSchemeIds(ids);
          if (ids.length === 1) {
            setActiveSchemeId(ids[0]);
          } else if (ids.length > 1) {
            setActiveSchemeId(null);
          }
        }

        if (data.active_scheme_id) {
          setActiveSchemeId(data.active_scheme_id);
        }
        if (data.user_profile) {
          setUserProfile(data.user_profile);
        }
      } catch (e) {
        const fallback =
          e instanceof ApiError
            ? e.status === 429
              ? lang === 'en'
                ? 'Too many requests. Please wait a moment before trying again.'
                : 'అభ్యర్థనలు పరిమితి దాటాయి. దయచేసి కాసేపు ఆగి మళ్ళీ ప్రయత్నించండి.'
              : e.status === 0
                ? `${e.message} (${lang === 'en' ? 'check Flask is running on port 5000' : 'Flask పోర్ట్ 5000లో అమలవుతోందో తనిఖీ చేయండి'})`
                : e.message
            : lang === 'en'
              ? 'Something went wrong while contacting the server.'
              : 'సర్వర్‌ను సంప్రదించడంలో ఏదో తప్పు జరిగింది.';

        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            text: fallback,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
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
    setMessages([]);
    schemesDigestAdded.current = false;
    setActiveSchemeId(null);
    setPreviousSchemeIds([]);
    setUserProfile({});
  }, [lang]);

  useEffect(() => {
    if (schemesLoading || schemesError || schemes.length === 0) return;
    if (schemesDigestAdded.current) return;
    schemesDigestAdded.current = true;
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: 'assistant',
        text: formatSchemesDigest(schemes, lang),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [schemesLoading, schemesError, schemes, lang]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isOpen]);

  const handleSend = useCallback(() => {
    void sendMessage(input.trim());
  }, [input, sendMessage]);

  const handleMicClick = useCallback(() => {
    voice.clearVoiceError();
    if (!voice.recognitionSupported) return;
    if (voice.phase === 'listening') return voice.stopListening();
    if (voice.phase === 'speaking') return voice.stopSpeaking();
    voice.startListening((text) => {
      setInput(text);
      if (voiceAutoSendRef.current) {
        void sendMessageRef.current(text);
      }
    });
  }, [voice]);

  const renderMessage = (text: string) =>
    text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      const clean = DOMPurify.sanitize(formatted);
      return <span key={i} dangerouslySetInnerHTML={{ __html: clean }} className={i > 0 ? 'mt-1 block' : ''} />;
    });

  const messageFontClass = lang === 'te' ? 'font-telugu leading-relaxed' : '';
  const micListening = voice.phase === 'listening';
  const micSpeaking = voice.phase === 'speaking';
  const showVoiceStatus = micListening || micSpeaking || voice.voiceError || voice.phase === 'error' || voice.phase === 'unsupported';
  const hasConversation = messages.length > 0;

  return (
    <>
      <div id="chat" className="absolute top-0 h-px w-px opacity-0" />

      <div className="fixed bottom-4 right-4 z-[90] sm:bottom-6 sm:right-6">
        <div
          className={`pointer-events-none fixed inset-0 bg-green-950/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
          aria-hidden={!isOpen}
        />

        <div
          className={`pointer-events-auto fixed bottom-[5.25rem] left-4 right-4 origin-bottom-right transition-all duration-300 sm:left-auto sm:right-6 sm:w-[420px] ${
            isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-6 scale-95 opacity-0'
          }`}
          role="dialog"
          aria-modal="false"
          aria-label="GramSahay AI chat widget"
        >
          <div className="max-sm:h-[calc(100dvh-7rem)] overflow-hidden rounded-3xl border border-white/60 bg-white/85 shadow-[0_16px_45px_rgba(2,44,34,0.28)] backdrop-blur-xl dark:border-green-700 dark:bg-green-950/88 sm:h-[min(74vh,760px)] sm:min-h-[560px]">
            <header className="flex items-center gap-3 border-b border-white/60 bg-gradient-to-r from-[#0a4f2b] via-[#0a6134] to-[#117a42] px-4 py-3.5 dark:border-green-700 sm:px-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">GramSahay Assistant</p>
                <p className="text-[11px] text-green-100/80">{lang === 'en' ? 'AI-powered government help' : 'AI ఆధారిత ప్రభుత్వ సహాయం'}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="relative">
                  <select
                    value={lang}
                    onChange={e => setLang(e.target.value === 'te' ? 'te' : 'en')}
                    className={`appearance-none rounded-lg border border-white/25 bg-white/10 py-1 pl-2.5 pr-7 text-[11px] font-medium text-white outline-none transition-colors focus:border-white/45 ${lang === 'te' ? 'font-telugu' : ''}`}
                  >
                    <option className="text-green-900" value="en">EN</option>
                    <option className="text-green-900" value="te">తెలుగు</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/80" />
                </div>
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/15 hover:text-white" aria-label="Minimize chat">
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-white/90 transition-colors hover:bg-white/15 hover:text-white sm:hidden" aria-label="Close chat">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="flex h-[calc(100%-4rem)] flex-col">
              <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
                {!hasConversation ? (
                  <div className="flex h-full flex-col justify-between gap-5 rounded-2xl border border-green-100/70 bg-white/70 p-4 dark:border-green-800 dark:bg-green-900/35">
                    <div className="space-y-3">
                      <div className="h-28 overflow-hidden rounded-xl border border-green-100/80 bg-white/70 dark:border-green-700/60 dark:bg-green-900/40">
                        <ChatEmptyIllustration />
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-green-700 dark:border-green-700 dark:bg-green-900/70 dark:text-green-200">
                        <Sparkles className="h-3.5 w-3.5" />
                        {lang === 'en' ? 'Welcome' : 'స్వాగతం'}
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight text-green-950 dark:text-green-50">
                        {lang === 'en' ? 'Ask me about Andhra Pradesh schemes' : 'ఆంధ్రప్రదేశ్ పథకాల గురించి అడగండి'}
                      </h3>
                      <p className={`text-sm leading-relaxed text-green-700/80 dark:text-green-200/80 ${lang === 'te' ? 'font-telugu' : ''}`}>
                        {lang === 'en'
                          ? 'Get eligibility, benefits, documents, and application guidance in seconds.'
                          : 'అర్హత, ప్రయోజనాలు, అవసరమైన పత్రాలు, దరఖాస్తు మార్గదర్శకం వెంటనే పొందండి.'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-700/80 dark:text-green-300/90">
                        {lang === 'en' ? 'Suggested Prompts' : 'సూచిత ప్రశ్నలు'}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {PROMPT_CHIPS.slice(0, 4).map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setInput(item.prompt)}
                              className="flex items-start gap-2 rounded-xl border border-green-100 bg-white px-3 py-2.5 text-left text-xs text-green-800 shadow-sm transition-all hover:border-green-300 hover:shadow-md dark:border-green-700 dark:bg-green-900/70 dark:text-green-100"
                            >
                              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-300" />
                              <span className="leading-relaxed">{item.prompt}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="rounded-xl bg-green-900 px-3 py-2 text-[11px] text-green-100/90">
                        {schemesLoading && (lang === 'en' ? 'Loading live scheme database...' : 'లైవ్ పథకాల డేటాబేస్ లోడ్ అవుతోంది...')}
                        {!schemesLoading && schemesError && (
                          <>
                            {lang === 'en' ? `Could not load schemes: ${schemesError}` : `పథకాలు లోడ్ కాలేదు: ${schemesError}`}
                            <button type="button" onClick={() => void onRetrySchemes()} className="ml-2 underline">
                              {lang === 'en' ? 'Retry' : 'మళ్లీ'}
                            </button>
                          </>
                        )}
                        {!schemesLoading && !schemesError && (
                          lang === 'en' ? `${schemes.length} schemes connected from API.` : `API నుండి ${schemes.length} పథకాలు కనెక్ట్ అయ్యాయి.`
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex animate-message-in gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          msg.role === 'assistant' ? 'bg-green-700 text-white' : 'bg-saffron-500 text-white'
                        }`}>
                          {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                        </div>
                        <div className={`flex max-w-[84%] flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed sm:text-sm ${
                            msg.role === 'assistant'
                              ? 'rounded-tl-md border border-green-100 bg-white text-green-900 shadow-sm dark:border-green-700 dark:bg-green-900 dark:text-green-100'
                              : 'rounded-tr-md bg-gradient-to-br from-green-700 to-emerald-600 text-white shadow-sm'
                          } ${messageFontClass}`}>
                            {renderMessage(msg.text)}
                          </div>
                          <span className="inline-flex items-center gap-1 px-1 text-[10px] text-green-700/60 dark:text-green-300/60">
                            <span>{msg.role === 'assistant' ? 'AI' : lang === 'en' ? 'You' : 'మీరు'}</span>
                            <Clock className="h-3 w-3" />
                            <span>{msg.time}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-700 text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-2xl rounded-tl-none border border-green-100 bg-white px-3.5 py-2.5 shadow-sm dark:border-green-700 dark:bg-green-900">
                          <div className="flex items-center gap-1">
                            {[0, 1, 2].map((i) => (
                              <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-green-500" style={{ animationDelay: `${i * 0.14}s` }} />
                            ))}
                            <span className="ml-2 text-[11px] text-green-700/80 dark:text-green-300/80">
                              {lang === 'en' ? 'AI is thinking...' : 'AI స్పందిస్తోంది...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={endRef} />
                  </div>
                )}
              </div>

              {showVoiceStatus && (
                <div
                  className={`flex min-h-10 items-center gap-2.5 border-y border-green-100 px-4 py-2 text-xs dark:border-green-700 ${
                    voice.voiceError || voice.phase === 'error' || voice.phase === 'unsupported'
                      ? 'bg-red-50 text-red-800 dark:bg-red-950/35 dark:text-red-200'
                      : micSpeaking
                        ? 'bg-sky-50 text-sky-800 dark:bg-sky-950/25 dark:text-sky-200'
                        : 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {micListening && (
                    <div className="flex h-5 items-end gap-0.5" aria-hidden>
                      {[0, 1, 2, 3].map(i => (
                        <span key={i} className="voice-wave-bar w-1 rounded-full bg-current" style={{ height: `${7 + (i % 2) * 6}px`, animationDelay: `${i * 0.12}s` }} />
                      ))}
                    </div>
                  )}
                  {micSpeaking && <Volume2 className="h-4 w-4 animate-pulse" aria-hidden />}
                  <span className={lang === 'te' ? 'font-telugu' : ''}>
                    {voice.voiceError || (micSpeaking ? t.voiceSpeaking : micListening ? t.voiceListening : t.voiceUnsupported)}
                  </span>
                </div>
              )}

              <div className="space-y-2 border-t border-green-100 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-green-700 dark:bg-green-950/95 sm:p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-green-800 dark:text-green-200">
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input type="checkbox" checked={readAloud} onChange={e => setReadAloud(e.target.checked)} className="rounded border-green-300 text-green-700 focus:ring-green-500" />
                    <span className={lang === 'te' ? 'font-telugu' : ''}>{t.readAloudLabel}</span>
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5">
                    <input type="checkbox" checked={voiceAutoSend} onChange={e => setVoiceAutoSend(e.target.checked)} className="rounded border-green-300 text-green-700 focus:ring-green-500" />
                    <span className={lang === 'te' ? 'font-telugu' : ''}>{t.autoSendVoiceLabel}</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={!voice.recognitionSupported || isTyping}
                    title={!voice.recognitionSupported ? t.voiceUnsupported : micListening ? t.voiceStopMic : t.voiceTapMic}
                    aria-label={micListening ? t.voiceStopMic : t.voiceTapMic}
                    aria-pressed={micListening}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                      micListening
                        ? 'bg-green-600 text-white ring-2 ring-green-300/80'
                        : micSpeaking
                          ? 'animate-pulse bg-sky-600 text-white'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                    }`}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && void handleSend()}
                    placeholder={t.placeholder}
                    className={`h-11 flex-1 rounded-2xl border border-green-200 bg-green-50/70 px-4 text-sm text-green-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-green-900 dark:text-green-100 ${lang === 'te' ? 'font-telugu' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-700 to-emerald-600 text-white shadow-md transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
                    aria-label={t.send}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(v => !v)}
          aria-label={isOpen ? (lang === 'en' ? 'Close chat widget' : 'చాట్ విండో మూసివేయి') : (lang === 'en' ? 'Open chat widget' : 'చాట్ విండో తెరువు')}
          className="group ml-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/50 bg-gradient-to-br from-green-700 to-emerald-600 text-white shadow-[0_10px_28px_rgba(3,86,50,0.45)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_14px_34px_rgba(3,86,50,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
        >
          {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </button>
      </div>
    </>
  );
}
