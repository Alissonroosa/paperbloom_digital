'use client';

/**
 * WizardNavigation Component
 * 
 * Navigation buttons for the interactive wizard with support for
 * forward/backward navigation, finalization, and loading states.
 * 
 * @see Requirements 7.1 - "Continuar →" button for intermediate steps
 * @see Requirements 7.2 - "← Voltar" button for steps after the first
 * @see Requirements 7.3 - Link to home page on first step
 * @see Requirements 7.4 - "Finalizar Compra →" button for last step
 * @see Requirements 7.5 - Keyboard navigation (Enter to advance, Escape to go back)
 * @see Requirements 9.3 - Touch targets minimum 44x44 pixels
 */

import { Loader2 } from 'lucide-react';
import { useWizardKeyboardNavigation } from '@/hooks/useInteractiveWizard';

export interface WizardNavigationProps {
  /** Callback when next/continue button is clicked */
  onNext?: () => void;
  /** Callback when back button is clicked */
  onPrev?: () => void;
  /** Callback when finalize button is clicked (last step) */
  onFinalize?: () => void;
  /** Whether this is the first step (hides back button) */
  isFirstStep?: boolean;
  /** Whether this is the last step (shows finalize button instead of next) */
  isLastStep?: boolean;
  /** Whether a loading operation is in progress */
  isLoading?: boolean;
  /** Custom label for the next button (default: 'Continuar →') */
  nextLabel?: string;
  /** Custom label for the back button (default: '← Voltar') */
  prevLabel?: string;
  /** Custom label for the finalize button (default: 'Finalizar Compra →') */
  finalizeLabel?: string;
  /** Whether the user can proceed to the next step (enables/disables next button) */
  canProceed?: boolean;
  /** Whether keyboard navigation is enabled (default: true) */
  enableKeyboardNavigation?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * WizardNavigation provides navigation buttons for wizard steps.
 * 
 * Features:
 * - "Continuar →" button for intermediate steps
 * - "← Voltar" button for steps after the first
 * - "Finalizar Compra →" button for the last step
 * - Loading state with spinner
 * - canProceed prop to enable/disable next button
 * - Touch targets minimum 44x44 pixels for mobile accessibility
 * - Styled buttons with appropriate colors
 * 
 * @example
 * ```tsx
 * <WizardNavigation
 *   onNext={() => goToNextStep()}
 *   onPrev={() => goToPrevStep()}
 *   isFirstStep={currentStep === 0}
 *   isLastStep={currentStep === totalSteps - 1}
 *   canProceed={isFormValid}
 *   isLoading={isSaving}
 *   enableKeyboardNavigation={true}
 * />
 * ```
 */
export function WizardNavigation({
  onNext,
  onPrev,
  onFinalize,
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
  nextLabel = 'Continuar →',
  prevLabel = '← Voltar',
  finalizeLabel = 'Finalizar Compra →',
  canProceed = true,
  enableKeyboardNavigation = true,
  className,
}: WizardNavigationProps): JSX.Element {
  // Enable keyboard navigation (Enter to advance, Escape to go back)
  // @see Requirements 7.5
  useWizardKeyboardNavigation({
    onNext,
    onPrev,
    onFinalize,
    enabled: enableKeyboardNavigation && !isLoading,
    canProceed,
    isLastStep,
  });

  const handleNextClick = () => {
    if (isLoading || !canProceed) return;
    
    if (isLastStep && onFinalize) {
      onFinalize();
    } else if (onNext) {
      onNext();
    }
  };

  const handlePrevClick = () => {
    if (isLoading) return;
    onPrev?.();
  };

  // Determine the primary button label
  const primaryButtonLabel = isLastStep ? finalizeLabel : nextLabel;
  
  // Determine if primary button should be disabled
  const isPrimaryDisabled = isLoading || !canProceed;

  return (
    <div className={`flex flex-col gap-3 w-full ${className ?? ''}`}>
      {/* Primary action button (Next/Finalize) */}
      <button
        type="button"
        onClick={handleNextClick}
        disabled={isPrimaryDisabled}
        className={`
          w-full min-h-[44px] px-6 py-3
          rounded-lg font-medium text-white
          transition-all duration-200
          flex items-center justify-center gap-2
          ${isLastStep 
            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300' 
            : 'bg-pink-600 hover:bg-pink-700 focus:ring-pink-300'
          }
          ${isPrimaryDisabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-md active:scale-[0.98]'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-2
        `}
        aria-busy={isLoading}
        aria-disabled={isPrimaryDisabled}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Processando...</span>
          </>
        ) : (
          primaryButtonLabel
        )}
      </button>

      {/* Back button (hidden on first step) */}
      {!isFirstStep && (
        <button
          type="button"
          onClick={handlePrevClick}
          disabled={isLoading}
          className={`
            w-full min-h-[44px] px-6 py-3
            rounded-lg font-medium
            text-gray-700 bg-white border border-gray-300
            transition-all duration-200
            hover:bg-gray-50 hover:border-gray-400
            focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}
          `}
          aria-disabled={isLoading}
        >
          {prevLabel}
        </button>
      )}
    </div>
  );
}
