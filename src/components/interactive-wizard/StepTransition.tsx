'use client';

/**
 * StepTransition Component
 * 
 * Provides animated transitions between wizard steps using Framer Motion.
 * Supports bidirectional animations based on navigation direction.
 * 
 * @see Requirements 2.1 - Animate with opacity and x-axis movement (enter from right, exit to left)
 * @see Requirements 2.2 - Use Framer Motion AnimatePresence with mode="wait"
 * @see Requirements 2.3 - Complete within 300ms duration
 */

import { AnimatePresence, motion } from 'framer-motion';
import { DEFAULT_ANIMATION_CONFIG } from '@/types/interactive-wizard';

export interface StepTransitionProps {
  /** Content to be animated */
  children: React.ReactNode;
  /** Unique key for the current step (triggers animation on change) */
  stepKey: string | number;
  /** Navigation direction for animation (default: 'forward') */
  direction?: 'forward' | 'backward';
}

/**
 * StepTransition wraps content with animated transitions between wizard steps.
 * 
 * - Forward direction: enter from right (x: 50), exit to left (x: -50)
 * - Backward direction: enter from left (x: -50), exit to right (x: 50)
 * - Duration: 0.3 seconds (300ms)
 * - Uses AnimatePresence with mode="wait" for sequential animations
 * 
 * @example
 * ```tsx
 * <StepTransition stepKey={currentStep} direction="forward">
 *   <StepContent />
 * </StepTransition>
 * ```
 */
export function StepTransition({
  children,
  stepKey,
  direction = 'forward',
}: StepTransitionProps): JSX.Element {
  const { stepTransition } = DEFAULT_ANIMATION_CONFIG;
  
  // Calculate animation values based on direction
  const enterX = direction === 'forward' 
    ? stepTransition.enterFrom.x 
    : -stepTransition.enterFrom.x;
  
  const exitX = direction === 'forward' 
    ? stepTransition.exitTo.x 
    : -stepTransition.exitTo.x;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ 
          opacity: stepTransition.enterFrom.opacity, 
          x: enterX 
        }}
        animate={{ 
          opacity: stepTransition.enterTo.opacity, 
          x: stepTransition.enterTo.x 
        }}
        exit={{ 
          opacity: stepTransition.exitTo.opacity, 
          x: exitX 
        }}
        transition={{ 
          duration: stepTransition.duration 
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
