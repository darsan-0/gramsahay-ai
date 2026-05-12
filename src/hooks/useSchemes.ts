import { useCallback, useEffect, useState } from 'react';
import type { Language } from '../data/content';
import { ApiError, fetchSchemes, type SchemeRecord } from '../services/api';

/**
 * Loads schemes from Flask with `?lang=` so card copy matches the UI language.
 * Refetches when `lang` changes (bilingual JSON served as single-language rows).
 */
export function useSchemes(lang: Language) {
  const [schemes, setSchemes] = useState<SchemeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSchemes(lang);
      setSchemes(data.schemes ?? []);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.status === 0 ? `${e.message} (is the Flask server running?)` : e.message);
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load schemes');
      }
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    void load();
  }, [load]);

  return { schemes, loading, error, refetch: load };
}
