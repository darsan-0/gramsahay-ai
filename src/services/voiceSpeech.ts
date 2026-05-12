/**
 * Browser-only voice helpers (Web Speech API).
 *
 * - **SpeechRecognition** — free on-device speech-to-text in supported browsers.
 * - **speechSynthesis** — built-in text-to-speech; no cloud keys.
 *
 * Future: swap this module for a custom wake-word + streaming ASR service while
 * keeping the same function signatures used by `useVoiceAssistant`.
 */

import type { Language } from '../data/content';

/** BCP-47 tags aligned with UI language (government-style locale codes). */
export type VoiceRecognitionLocale = 'en-US' | 'te-IN';

export function voiceLocaleForUiLang(lang: Language): VoiceRecognitionLocale {
  return lang === 'te' ? 'te-IN' : 'en-US';
}

export function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Strip markdown / light HTML so TTS reads plain sentences (friendly assistant).
 */
export function stripTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
