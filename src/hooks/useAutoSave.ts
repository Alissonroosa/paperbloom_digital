import { useEffect, useState, useCallback } from 'react';

export interface UseAutoSaveOptions<T> {
  key: string;
  data: T;
  debounceMs?: number;
  enabled?: boolean;
}

export interface UseAutoSaveReturn<T> {
  isSaving: boolean;
  lastSaved: Date | null;
  restore: () => T | null;
  clear: () => void;
}

export function useAutoSave<T>({
  key,
  data,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn<T> {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(() => {
      try {
        setIsSaving(true);
        localStorage.setItem(
          key,
          JSON.stringify({
            data,
            savedAt: new Date().toISOString(),
          })
        );
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Silently fail - don't disrupt user experience
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [data, key, debounceMs, enabled]);

  const restore = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      return parsed.data as T;
    } catch (error) {
      console.error('Failed to restore auto-save:', error);
      return null;
    }
  }, [key]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear auto-save:', error);
    }
  }, [key]);

  return { isSaving, lastSaved, restore, clear };
}
