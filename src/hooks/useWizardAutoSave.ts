import { useEffect, useState, useCallback } from 'react';
import { WizardState } from '@/types/wizard';

export interface UseWizardAutoSaveOptions {
  key: string;
  state: WizardState;
  debounceMs?: number;
  enabled?: boolean;
}

export interface UseWizardAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  restore: () => WizardState | null;
  clear: () => void;
}

/**
 * Custom hook for auto-saving wizard state to localStorage
 * Saves wizard state after 2 seconds of inactivity
 * Includes current step in saved state
 */
export function useWizardAutoSave({
  key,
  state,
  debounceMs = 2000,
  enabled = true,
}: UseWizardAutoSaveOptions): UseWizardAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(() => {
      try {
        setIsSaving(true);
        
        // Serialize the state, converting Set to Array for JSON
        const serializedState = {
          ...state,
          completedSteps: Array.from(state.completedSteps),
          // Convert Date objects to ISO strings
          data: {
            ...state.data,
            specialDate: state.data.specialDate?.toISOString() || null,
          },
          ui: {
            ...state.ui,
            lastSaved: state.ui.lastSaved?.toISOString() || null,
          },
        };
        
        localStorage.setItem(
          key,
          JSON.stringify({
            state: serializedState,
            savedAt: new Date().toISOString(),
          })
        );
        
        setLastSaved(new Date());
      } catch (error) {
        console.error('Wizard auto-save failed:', error);
        // Silently fail - don't disrupt user experience
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [state, key, debounceMs, enabled]);

  const restore = useCallback((): WizardState | null => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      const restoredState = parsed.state;
      
      // Deserialize: Convert Array back to Set
      if (restoredState.completedSteps) {
        restoredState.completedSteps = new Set(restoredState.completedSteps);
      }
      
      // Convert ISO strings back to Date objects
      if (restoredState.data?.specialDate) {
        restoredState.data.specialDate = new Date(restoredState.data.specialDate);
      }
      
      if (restoredState.ui?.lastSaved) {
        restoredState.ui.lastSaved = new Date(restoredState.ui.lastSaved);
      }
      
      return restoredState as WizardState;
    } catch (error) {
      console.error('Failed to restore wizard auto-save:', error);
      return null;
    }
  }, [key]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear wizard auto-save:', error);
    }
  }, [key]);

  return { isSaving, lastSaved, restore, clear };
}
