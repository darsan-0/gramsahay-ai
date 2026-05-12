import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '../data/content';
import {
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  stripTextForSpeech,
  voiceLocaleForUiLang,
} from '../services/voiceSpeech';

/**
 * Voice assistant phases for UI (mic glow, banners, speaking pill).
 * `unsupported` means SpeechRecognition is missing (common on Firefox desktop).
 */
export type VoicePhase = 'idle' | 'listening' | 'speaking' | 'error' | 'unsupported';

export interface UseVoiceAssistantResult {
  phase: VoicePhase;
  /** User-facing error (permission, no speech, etc.) */
  voiceError: string | null;
  clearVoiceError: () => void;
  recognitionSupported: boolean;
  synthesisSupported: boolean;
  /** Start one-shot dictation; `onFinal` receives trimmed transcript. */
  startListening: (onFinal: (transcript: string) => void) => void;
  stopListening: () => void;
  /** Speak text with calm, clear defaults (government info style). */
  speak: (plainText: string) => void;
  stopSpeaking: () => void;
  /** Cancel both mic and speaker (e.g. new user turn). */
  cancelAll: () => void;
}

/**
 * Encapsulates Web Speech API lifecycle for GramSahay chat.
 * Stays UI-agnostic: parent decides what to do with transcripts (fill input, send).
 */
export function useVoiceAssistant(
  uiLang: Language,
  t: {
    voiceUnsupported: string;
    voicePermissionDenied: string;
    voiceNoSpeech: string;
    voiceAborted: string;
    voiceGenericError: string;
  }
): UseVoiceAssistantResult {
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onFinalRef = useRef<(text: string) => void>(() => {});

  const recognitionSupported = isSpeechRecognitionSupported();
  const synthesisSupported = isSpeechSynthesisSupported();

  const clearVoiceError = useCallback(() => {
    setVoiceError(null);
    setPhase(prev => (prev === 'error' || prev === 'unsupported' ? 'idle' : prev));
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        try {
          rec.abort();
        } catch {
          /* ignore */
        }
      }
      recognitionRef.current = null;
    }
  }, []);

  const cancelAll = useCallback(() => {
    stopListening();
    stopSpeaking();
    setPhase('idle');
  }, [stopListening, stopSpeaking]);

  const speak = useCallback(
    (plainText: string) => {
      if (!synthesisSupported || !plainText.trim()) return;
      stopSpeaking();
      const utterance = new SpeechSynthesisUtterance(stripTextForSpeech(plainText));
      utterance.lang = voiceLocaleForUiLang(uiLang);
      // Slightly slower, steady pitch — easier to follow scheme names and numbers.
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => setPhase('idle');
      utterance.onerror = () => setPhase('idle');
      setPhase('speaking');
      window.speechSynthesis.speak(utterance);
    },
    [stopSpeaking, synthesisSupported, uiLang]
  );

  const startListening = useCallback(
    (onFinal: (transcript: string) => void) => {
      clearVoiceError();
      const Ctor = getSpeechRecognitionConstructor();
      if (!Ctor) {
        setPhase('unsupported');
        setVoiceError(t.voiceUnsupported);
        return;
      }

      cancelAll();

      const rec = new Ctor();
      recognitionRef.current = rec;
      rec.lang = voiceLocaleForUiLang(uiLang);
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      onFinalRef.current = onFinal;

      rec.onstart = () => {
        setPhase('listening');
      };

      rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
        const code = ev.error;
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setVoiceError(t.voicePermissionDenied);
        } else if (code === 'no-speech') {
          setVoiceError(t.voiceNoSpeech);
        } else if (code === 'aborted') {
          setVoiceError(t.voiceAborted);
        } else {
          setVoiceError(t.voiceGenericError);
        }
        setPhase('error');
        recognitionRef.current = null;
      };

      rec.onend = () => {
        recognitionRef.current = null;
        setPhase(prev => (prev === 'listening' ? 'idle' : prev));
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            transcript += res[0].transcript;
          }
        }
        const trimmed = transcript.trim();
        if (trimmed) {
          onFinalRef.current(trimmed);
        }
      };

      try {
        rec.start();
      } catch {
        setVoiceError(t.voiceGenericError);
        setPhase('error');
        recognitionRef.current = null;
      }
    },
    [cancelAll, clearVoiceError, t, uiLang]
  );

  /** If UI language changes mid-session, stop any playback/recording safely. */
  useEffect(() => {
    cancelAll();
  }, [uiLang, cancelAll]);

  useEffect(() => () => cancelAll(), [cancelAll]);

  return {
    phase,
    voiceError,
    clearVoiceError,
    recognitionSupported,
    synthesisSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    cancelAll,
  };
}
