'use client';

/**
 * ProgressIndicator Component
 * 
 * Displays circular dots indicating wizard progress.
 * Supports click navigation to completed steps.
 * 
 * @see Requirements 3.1 - Display circular dots for each step
 * @see Requirements 3.2 - Highlight current step with scale-125 and distinct color
 * @see Requirements 3.3 - Show completed steps with secondary color
 * @see Requirements 3.4 - Position at top of each step
 * @see Requirements 3.5 - Support configurable colors per product
 * @see Requirements 7.6 - Navigate to completed steps on click
 */

export interface ProgressIndicatorProps {
  /** Total number of steps in the wizard */
  totalSteps: number;
  /** Current active step (1-indexed) */
  currentStep: number;
  /** Set of completed step numbers */
  completedSteps: Set<number>;
  /** Tailwind background color class for active step (default: 'bg-pink-400') */
  activeColor?: string;
  /** Tailwind background color class for completed steps (default: 'bg-pink-300') */
  completedColor?: string;
  /** Tailwind background color class for pending steps (default: 'bg-gray-300') */
  pendingColor?: string;
  /** Callback when a step dot is clicked */
  onStepClick?: (step: number) => void;
  /** Whether to allow click navigation to completed steps (default: true) */
  allowClickNavigation?: boolean;
}

/**
 * ProgressIndicator renders circular dots for each wizard step.
 * 
 * - Current step: highlighted with scale-125 and activeColor
 * - Completed steps: shown with completedColor, clickable when allowClickNavigation is true
 * - Pending steps: shown with pendingColor, not clickable
 * 
 * @example
 * ```tsx
 * <ProgressIndicator
 *   totalSteps={5}
 *   currentStep={2}
 *   completedSteps={new Set([1])}
 *   onStepClick={(step) => goToStep(step)}
 * />
 * ```
 */
export function ProgressIndicator({
  totalSteps,
  currentStep,
  completedSteps,
  activeColor = 'bg-pink-400',
  completedColor = 'bg-pink-300',
  pendingColor = 'bg-gray-300',
  onStepClick,
  allowClickNavigation = true,
}: ProgressIndicatorProps): JSX.Element {
  const handleStepClick = (step: number) => {
    // Only allow navigation to completed steps
    if (allowClickNavigation && completedSteps.has(step) && onStepClick) {
      onStepClick(step);
    }
  };

  const getStepColor = (step: number): string => {
    if (step === currentStep) {
      return activeColor;
    }
    if (completedSteps.has(step)) {
      return completedColor;
    }
    return pendingColor;
  };

  const isClickable = (step: number): boolean => {
    return allowClickNavigation && completedSteps.has(step) && step !== currentStep;
  };

  return (
    <div 
      className="flex gap-2" 
      role="navigation" 
      aria-label="Progresso do formulário"
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const color = getStepColor(step);
        const clickable = isClickable(step);
        const isCurrent = step === currentStep;
        const isCompleted = completedSteps.has(step);

        return (
          <button
            key={step}
            type="button"
            onClick={() => handleStepClick(step)}
            disabled={!clickable}
            className={`
              w-2.5 h-2.5 rounded-full transition-all duration-200
              ${color}
              ${isCurrent ? 'scale-125' : ''}
              ${clickable ? 'cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2' : 'cursor-default'}
            `}
            aria-label={`Etapa ${step}${isCurrent ? ' (atual)' : ''}${isCompleted ? ' (concluída)' : ''}`}
            aria-current={isCurrent ? 'step' : undefined}
          />
        );
      })}
    </div>
  );
}
