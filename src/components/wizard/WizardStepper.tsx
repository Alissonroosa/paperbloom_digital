'use client';

import React from 'react';
import { STEP_LABELS } from '@/types/wizard';
import { Check } from 'lucide-react';

interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
  stepLabels?: string[];
}

/**
 * WizardStepper Component
 * Visual stepper showing all wizard steps with progress indication
 * Supports click navigation to completed steps
 */
export function WizardStepper({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
  stepLabels = STEP_LABELS,
}: WizardStepperProps) {
  const getStepStatus = (step: number): 'completed' | 'active' | 'pending' => {
    if (completedSteps.has(step)) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  const isStepClickable = (step: number): boolean => {
    // Can click on current step, completed steps, or previous steps
    return step <= currentStep || completedSteps.has(step);
  };

  const handleStepClick = (step: number) => {
    if (isStepClickable(step)) {
      onStepClick(step);
    }
  };

  return (
    <div className="w-full">
      {/* Stepper - Ultra Compact Horizontal */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(stepNumber);
          const isClickable = isStepClickable(stepNumber);
          const isLast = stepNumber === totalSteps;

          return (
            <React.Fragment key={stepNumber}>
              {/* Step Circle - Mini */}
              <button
                onClick={() => handleStepClick(stepNumber)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center
                  w-6 h-6 rounded-full font-semibold text-[10px]
                  transition-all duration-200
                  ${
                    status === 'completed'
                      ? 'bg-secondary text-white hover:bg-text-accent cursor-pointer'
                      : status === 'active'
                      ? 'bg-text-accent text-white ring-1 ring-primary'
                      : 'bg-gray-200 text-gray-400'
                  }
                  ${isClickable && status !== 'active' ? 'hover:scale-105' : ''}
                  ${!isClickable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  focus:outline-none focus:ring-1 focus:ring-text-accent
                `}
                aria-label={`Passo ${stepNumber} - ${stepLabels[index]} - ${
                  status === 'completed' ? 'Concluído' : status === 'active' ? 'Atual' : 'Pendente'
                }`}
                aria-current={status === 'active' ? 'step' : undefined}
                title={stepLabels[index]}
              >
                {status === 'completed' ? (
                  <Check className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </button>

              {/* Connector Line - Mini */}
              {!isLast && (
                <div
                  className={`
                    w-4 h-[1px]
                    transition-colors duration-300
                    ${
                      completedSteps.has(stepNumber)
                        ? 'bg-secondary'
                        : 'bg-gray-300'
                    }
                  `}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
