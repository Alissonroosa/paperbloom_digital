'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { InteractiveWizardConfig } from '@/types/interactive-wizard';

// ============================================================================
// State Types
// ============================================================================

/**
 * State for the interactive wizard
 * @see Requirements 1.1, 1.2
 */
export interface InteractiveWizardState {
  /** Current step index (0-based) */
  currentStep: number;
  /** Set of completed step indices */
  completedSteps: Set<number>;
  /** Validation state for each step */
  stepValidation: Record<number, { isValid: boolean; errors: Record<string, string> }>;
  /** Whether navigation is in progress */
  isNavigating: boolean;
  /** Direction of current navigation */
  navigationDirection: 'forward' | 'backward';
}

// ============================================================================
// Context Type
// ============================================================================

/**
 * Context type for the interactive wizard
 * @see Requirements 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
export interface InteractiveWizardContextType {
  // State
  state: InteractiveWizardState;
  config: InteractiveWizardConfig;

  // Navigation
  /** Navigate to the next step (returns false if validation fails) */
  nextStep: () => boolean;
  /** Navigate to the previous step */
  prevStep: () => void;
  /** Navigate to a specific step (returns false if not allowed) */
  goToStep: (step: number) => boolean;
  /** Check if navigation to a step is allowed */
  canNavigateToStep: (step: number) => boolean;

  // Validation
  /** Validate the current step */
  validateCurrentStep: () => boolean;
  /** Set validation state for a step */
  setStepValidation: (
    step: number,
    validation: { isValid: boolean; errors: Record<string, string> }
  ) => void;

  // Completion
  /** Mark a step as completed */
  markStepCompleted: (step: number) => void;
  /** Check if a step is completed */
  isStepCompleted: (step: number) => boolean;

  // Auto-save
  /** Whether auto-save is in progress */
  isSaving: boolean;
  /** Timestamp of last save */
  lastSaved: Date | null;
}

// ============================================================================
// Context Creation
// ============================================================================

const InteractiveWizardContext = createContext<InteractiveWizardContextType | undefined>(
  undefined
);

// ============================================================================
// Provider Props
// ============================================================================

/**
 * Props for the InteractiveWizardProvider
 */
export interface InteractiveWizardProviderProps {
  children: ReactNode;
  /** Configuration for the wizard */
  config: InteractiveWizardConfig;
  /** Step inicial (0-based). Útil para retomar onde o usuário parou. */
  initialStep?: number;
  /** Callback when step changes */
  onStepChange?: (step: number, direction: 'forward' | 'backward') => void;
  /** Custom validation function for steps */
  validateStep?: (step: number) => { isValid: boolean; errors: Record<string, string> };
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * InteractiveWizardProvider Component
 * Provides wizard state and actions to all child components
 * 
 * @see Requirements 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */
export function InteractiveWizardProvider({
  children,
  config,
  initialStep = 0,
  onStepChange,
  validateStep,
}: InteractiveWizardProviderProps): JSX.Element {
  // ============================================================================
  // State
  // ============================================================================

  const [currentStep, setCurrentStep] = useState(() => {
    // Clamp initial step entre [0, totalSteps - 1]
    if (initialStep < 0) return 0;
    if (initialStep >= config.totalSteps) return config.totalSteps - 1;
    return initialStep;
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepValidation, setStepValidationState] = useState<
    Record<number, { isValid: boolean; errors: Record<string, string> }>
  >({});
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Refs for debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Computed State
  // ============================================================================

  const state: InteractiveWizardState = {
    currentStep,
    completedSteps,
    stepValidation,
    isNavigating,
    navigationDirection,
  };

  // ============================================================================
  // Validation Functions
  // ============================================================================

  /**
   * Set validation state for a specific step
   * @see Requirements 6.1, 6.4, 6.6
   */
  const setStepValidation = useCallback(
    (step: number, validation: { isValid: boolean; errors: Record<string, string> }) => {
      setStepValidationState((prev) => ({
        ...prev,
        [step]: validation,
      }));
    },
    []
  );

  /**
   * Validate the current step
   * @see Requirements 6.2, 6.3
   */
  const validateCurrentStep = useCallback((): boolean => {
    // If custom validator is provided, use it
    if (validateStep) {
      const result = validateStep(currentStep);
      setStepValidation(currentStep, result);
      return result.isValid;
    }

    // Check existing validation state
    const currentValidation = stepValidation[currentStep];
    if (currentValidation) {
      return currentValidation.isValid;
    }

    // Default to valid if no validation is set
    return true;
  }, [currentStep, validateStep, stepValidation, setStepValidation]);

  // ============================================================================
  // Completion Functions
  // ============================================================================

  /**
   * Mark a step as completed
   */
  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.add(step);
      return newSet;
    });
  }, []);

  /**
   * Check if a step is completed
   */
  const isStepCompleted = useCallback(
    (step: number): boolean => {
      return completedSteps.has(step);
    },
    [completedSteps]
  );

  // ============================================================================
  // Navigation Functions
  // ============================================================================

  /**
   * Check if navigation to a specific step is allowed
   * @see Requirements 6.3, 6.5
   */
  const canNavigateToStep = useCallback(
    (step: number): boolean => {
      // Can't navigate to invalid step indices
      if (step < 0 || step >= config.totalSteps) {
        return false;
      }

      // Can always go back to previous steps
      if (step < currentStep) {
        return true;
      }

      // Can navigate to current step
      if (step === currentStep) {
        return true;
      }

      // For forward navigation, check if all previous steps are completed
      // or if the step is the immediate next step and current step is valid
      if (step === currentStep + 1) {
        return validateCurrentStep();
      }

      // For jumping ahead, all intermediate steps must be completed
      for (let i = currentStep; i < step; i++) {
        if (!completedSteps.has(i)) {
          return false;
        }
      }

      return true;
    },
    [config.totalSteps, currentStep, completedSteps, validateCurrentStep]
  );

  /**
   * Navigate to the next step
   * @see Requirements 6.2, 6.3, 6.5
   */
  const nextStep = useCallback((): boolean => {
    // Can't go beyond last step
    if (currentStep >= config.totalSteps - 1) {
      return false;
    }

    // Validate current step before proceeding
    const isValid = validateCurrentStep();
    if (!isValid) {
      return false;
    }

    // Mark current step as completed
    markStepCompleted(currentStep);

    // Set navigation state
    setIsNavigating(true);
    setNavigationDirection('forward');

    // Navigate to next step
    const nextStepIndex = currentStep + 1;
    setCurrentStep(nextStepIndex);

    // Notify callback
    onStepChange?.(nextStepIndex, 'forward');

    // Reset navigation state after animation
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return true;
  }, [currentStep, config.totalSteps, validateCurrentStep, markStepCompleted, onStepChange]);

  /**
   * Navigate to the previous step
   */
  const prevStep = useCallback(() => {
    // Can't go before first step
    if (currentStep <= 0) {
      return;
    }

    // Set navigation state
    setIsNavigating(true);
    setNavigationDirection('backward');

    // Navigate to previous step
    const prevStepIndex = currentStep - 1;
    setCurrentStep(prevStepIndex);

    // Notify callback
    onStepChange?.(prevStepIndex, 'backward');

    // Reset navigation state after animation
    setTimeout(() => {
      setIsNavigating(false);
    }, 300);
  }, [currentStep, onStepChange]);

  /**
   * Navigate to a specific step
   * @see Requirements 6.3, 6.5
   */
  const goToStep = useCallback(
    (step: number): boolean => {
      // Check if navigation is allowed
      if (!canNavigateToStep(step)) {
        return false;
      }

      // Determine direction
      const direction = step > currentStep ? 'forward' : 'backward';

      // If going forward, validate and mark current step
      if (direction === 'forward' && step === currentStep + 1) {
        const isValid = validateCurrentStep();
        if (!isValid) {
          return false;
        }
        markStepCompleted(currentStep);
      }

      // Set navigation state
      setIsNavigating(true);
      setNavigationDirection(direction);

      // Navigate to step
      setCurrentStep(step);

      // Notify callback
      onStepChange?.(step, direction);

      // Reset navigation state after animation
      setTimeout(() => {
        setIsNavigating(false);
      }, 300);

      return true;
    },
    [canNavigateToStep, currentStep, validateCurrentStep, markStepCompleted, onStepChange]
  );

  // ============================================================================
  // Auto-Save Effect
  // ============================================================================

  /**
   * Auto-save state to sessionStorage
   * @see Requirements 8.1, 8.2, 8.3, 8.4, 8.5
   */
  useEffect(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation
    const debounceMs = config.autoSaveDebounceMs ?? 2000;
    
    saveTimeoutRef.current = setTimeout(() => {
      try {
        setIsSaving(true);

        const stateToSave = {
          currentStep,
          completedSteps: Array.from(completedSteps),
          stepValidation,
          savedAt: new Date().toISOString(),
        };

        sessionStorage.setItem(config.autoSaveKey, JSON.stringify(stateToSave));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentStep, completedSteps, stepValidation, config.autoSaveKey, config.autoSaveDebounceMs]);

  /**
   * Restore state from sessionStorage on mount
   * @see Requirements 8.3
   */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(config.autoSaveKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        if (typeof parsed.currentStep === 'number') {
          setCurrentStep(parsed.currentStep);
        }
        
        if (Array.isArray(parsed.completedSteps)) {
          setCompletedSteps(new Set(parsed.completedSteps));
        }
        
        if (parsed.stepValidation) {
          setStepValidationState(parsed.stepValidation);
        }
        
        if (parsed.savedAt) {
          setLastSaved(new Date(parsed.savedAt));
        }
      }
    } catch (error) {
      console.error('Failed to restore wizard state:', error);
    }
  }, [config.autoSaveKey]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue: InteractiveWizardContextType = {
    // State
    state,
    config,

    // Navigation
    nextStep,
    prevStep,
    goToStep,
    canNavigateToStep,

    // Validation
    validateCurrentStep,
    setStepValidation,

    // Completion
    markStepCompleted,
    isStepCompleted,

    // Auto-save
    isSaving,
    lastSaved,
  };

  return (
    <InteractiveWizardContext.Provider value={contextValue}>
      {children}
    </InteractiveWizardContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Custom hook to use the Interactive Wizard Context
 * Throws an error if used outside of InteractiveWizardProvider
 * 
 * @see Requirements 1.3
 */
export function useInteractiveWizardContext(): InteractiveWizardContextType {
  const context = useContext(InteractiveWizardContext);

  if (context === undefined) {
    throw new Error(
      'useInteractiveWizardContext must be used within an InteractiveWizardProvider'
    );
  }

  return context;
}

/**
 * Hook to get only the wizard state (read-only)
 */
export function useInteractiveWizardState() {
  const { state, config, isSaving, lastSaved } = useInteractiveWizardContext();
  return { state, config, isSaving, lastSaved };
}

/**
 * Hook to get only wizard navigation functions
 */
export function useInteractiveWizardNavigation() {
  const {
    state,
    config,
    nextStep,
    prevStep,
    goToStep,
    canNavigateToStep,
  } = useInteractiveWizardContext();

  return {
    currentStep: state.currentStep,
    totalSteps: config.totalSteps,
    isFirstStep: state.currentStep === 0,
    isLastStep: state.currentStep === config.totalSteps - 1,
    isNavigating: state.isNavigating,
    navigationDirection: state.navigationDirection,
    nextStep,
    prevStep,
    goToStep,
    canNavigateToStep,
  };
}

/**
 * Hook to get only wizard validation functions
 */
export function useInteractiveWizardValidation() {
  const {
    state,
    validateCurrentStep,
    setStepValidation,
  } = useInteractiveWizardContext();

  const currentStepValidation = state.stepValidation[state.currentStep];

  return {
    validateCurrentStep,
    setStepValidation,
    currentStepErrors: currentStepValidation?.errors ?? {},
    isCurrentStepValid: currentStepValidation?.isValid ?? true,
  };
}

/**
 * Hook to get wizard completion status
 */
export function useInteractiveWizardCompletion() {
  const {
    state,
    config,
    markStepCompleted,
    isStepCompleted,
  } = useInteractiveWizardContext();

  return {
    completedSteps: state.completedSteps,
    totalSteps: config.totalSteps,
    completedCount: state.completedSteps.size,
    markStepCompleted,
    isStepCompleted,
    isAllCompleted: state.completedSteps.size >= config.totalSteps,
  };
}

/**
 * Hook to get auto-save status
 */
export function useInteractiveWizardAutoSave() {
  const { isSaving, lastSaved, config } = useInteractiveWizardContext();

  /**
   * Clear the saved draft from sessionStorage
   * @see Requirements 8.6
   */
  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(config.autoSaveKey);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [config.autoSaveKey]);

  return {
    isSaving,
    lastSaved,
    autoSaveKey: config.autoSaveKey,
    clearDraft,
  };
}
