/**
 * GramSahay AI — API client (native fetch only).
 *
 * All backend calls go through this module so URLs, error handling, and
 * future auth headers stay in one place. The Flask app defaults to port 5000.
 */

import type { Language } from '../data/content';

/** Base URL for the Flask backend (override in production via Vite env). */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://127.0.0.1:5000';

/**
 * One scheme row after GET /api/schemes?lang=…
 * (`category_code` = machine filter; `category` = localized label)
 */
export interface SchemeRecord {
  id: string;
  category_code?: string;
  scheme_name: string;
  category: string;
  eligibility: string;
  benefits: string;
  documents: string[];
  language_support: string[];
}

/** JSON body shape for GET /api/schemes success response */
export interface SchemesListResponse {
  count: number;
  language?: string;
  schemes: SchemeRecord[];
}

/** JSON body for POST /api/chat (backend may evolve fields over time) */
export interface ChatApiResponse {
  status?: string;
  category?: string | null;
  schemes?: SchemeRecord[];
  reply?: string;
  response?: string;
  engine?: string;
  echo?: { message?: string; language?: string };
  requested_language?: string;
  recommendation_preview?: unknown;
  error?: string;
}

/** Thrown when the server returns a non-OK status or invalid JSON */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Low-level JSON fetch helper: builds URL, checks response, parses JSON.
 * Reusable for any future endpoint (e.g. streaming chat, voice metadata).
 */
async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers ?? {}),
  };

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Network error: could not reach the server';
    throw new ApiError(message, 0);
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      if (!response.ok) {
        throw new ApiError(text || response.statusText, response.status, text);
      }
      throw new ApiError('Invalid JSON from server', response.status, text);
    }
  }

  if (!response.ok) {
    const errObj = data as { error?: string; detail?: string } | null;
    const msg =
      errObj?.error ?? errObj?.detail ?? `Request failed (${response.status})`;
    throw new ApiError(msg, response.status, text);
  }

  return data as T;
}

/**
 * Fetch all schemes from the Flask JSON database in the requested UI language.
 * GET /api/schemes?lang=en|te
 */
export async function fetchSchemes(lang: Language): Promise<SchemesListResponse> {
  const code = lang === 'te' ? 'te' : 'en';
  return fetchJson<SchemesListResponse>(`/api/schemes?lang=${encodeURIComponent(code)}`, {
    method: 'GET',
  });
}

/**
 * Send a chat message to the backend rule-based recommender.
 * POST /api/chat — `language` selects Telugu vs English copy in `reply` and `schemes`.
 */
export async function postChatMessage(payload: {
  message: string;
  language: string;
  context?: Record<string, unknown>;
}): Promise<ChatApiResponse> {
  return fetchJson<ChatApiResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
