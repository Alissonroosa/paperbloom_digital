/**
 * Interactive Wizard Hooks
 * 
 * This module provides a clean public API for consuming the Interactive Wizard system.
 * It re-exports hooks from InteractiveWizardContext with simplified names for easier use.
 * 
 * @see Requirements 1.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 * 
 * @example
 * ```tsx
 * import { useInteractiveWizard, useWizardNavigation, useWizardValidation } from '@/hooks/useInteractiveWizard';
 * 
 * function MyStep() {
 *   const wizard = useInteractiveWizard();
 *   const { nextStep, prevStep, isLastStep } = useWizardNavigation();
 *   const { validateCurrentStep, currentStepErrors } = useWizardValidation();
 *   
 *   return (
 *     <div>
 *       <button onClick={prevStep}>← Voltar</button>
 *       <button onClick={nextStep}>
 *         {isLastStep ? 'Finalizar' : 'Continuar →'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect, useCallback } from 'react';

// Re-export the main context hook as useInteractiveWizard
export { useInteractiveWizardContext as useInteractiveWizard } from '@/contexts/InteractiveWizardContext';

// Re-export navigation hook with simplified name
export { useInteractiveWizardNavigation as useWizardNavigation } from '@/contexts/InteractiveWizardContext';

// Re-export validation hook with simplified name
export { useInteractiveWizardValidation as useWizardValidation } from '@/contexts/InteractiveWizardContext';

// Re-export other useful hooks for convenience
export {
  useInteractiveWizardState as useWizardState,
  useInteractiveWizardCompletion as useWizardCompletion,
  useInteractiveWizardAutoSave as useWizardAutoSave,
} from '@/contexts/InteractiveWizardContext';

// Re-export types for consumers
export type {
  InteractiveWizardContextType,
  InteractiveWizardState,
  InteractiveWizardProviderProps,
} from '@/contexts/InteractiveWizardContext';

// Re-export the provider for convenience
export { InteractiveWizardProvider } from '@/contexts/InteractiveWizardContext';

/**
 * Hook for keyboard navigation in the wizard
 * 
 * Enables:
 * - Enter key to advance to the next step
 * - Escape key to go back to the previous step
 * 
 * @see Requirements 7.5 - Keyboard navigation support
 * 
 * @param options Configuration options
 * @param options.onNext Callback when Enter is pressed (defaults to wizard nextStep)
 * @param options.onPrev Callback when Escape is pressed (defaults to wizard prevStep)
 * @param options.enabled Whether keyboard navigation is enabled (default: true)
 * @param options.canProceed Whether the user can proceed to next step (default: true)
 * 
 * @example
 * ```tsx
 * function MyStep() {
 *   const { nextStep, prevStep } = useWizardNavigation();
 *   
 *   // Enable keyboard navigation for this step
 *   useWizardKeyboardNavigation({
 *     onNext: nextStep,
 *     onPrev: prevStep,
 *     canProceed: isFormValid,
 *   });
 *   
 *   return <div>...</div>;
 * }
 * ```
 */
export function useWizardKeyboardNavigation(options: {
  onNext?: () => void | boolean;
  onPrev?: () => void;
  onFinalize?: () => void;
  enabled?: boolean;
  canProceed?: boolean;
  isLastStep?: boolean;
} = {}): void {
  const {
    onNext,
    onPrev,
    onFinalize,
    enabled = true,
    canProceed = true,
    isLastStep = false,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger if user is typing in an input, textarea, or contenteditable
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // For Enter key, only proceed if not in a text input (allow in buttons)
      if (event.key === 'Enter') {
        // Allow Enter in textareas for multiline input
        if (target.tagName === 'TEXTAREA') return;
        
        // Allow Enter in inputs that are not buttons
        if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'button') {
          // Only prevent default for text-like inputs
          const inputType = (target as HTMLInputElement).type;
          if (['text', 'email', 'password', 'search', 'tel', 'url'].includes(inputType)) {
            return;
          }
        }

        if (!canProceed) return;

        event.preventDefault();
        
        if (isLastStep && onFinalize) {
          onFinalize();
        } else if (onNext) {
          onNext();
        }
      }

      // Escape key to go back
      if (event.key === 'Escape') {
        // Allow Escape even in inputs to go back
        event.preventDefault();
        onPrev?.();
      }
    },
    [enabled, canProceed, isLastStep, onNext, onPrev, onFinalize]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
