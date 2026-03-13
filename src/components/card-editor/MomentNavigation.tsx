'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { ThematicMoment, MomentCompletionStatus } from '@/contexts/CardCollectionEditorContext';
import { CheckCircle2, Circle } from 'lucide-react';

/**
 * MomentNavigation Component Props
 * Requirements: 7.1, 7.2, 7.4, 9.5
 */
export interface MomentNavigationProps {
  moments: ThematicMoment[];
  currentMomentIndex: number;
  onMomentChange: (index: number) => void;
  completionStatus: Record<number, MomentCompletionStatus>;
  className?: string;
}

/**
 * MomentNavigation Component
 * 
 * Displays navigation between the 3 thematic moments with:
 * - 3 navigation buttons with moment titles
 * - Visual indicator of active moment
 * - Progress display for each moment (X/4 cards completed)
 * - Direct navigation between moments
 * - Responsive layout (stacked on mobile, horizontal on tablet/desktop)
 * - Optimized with React.memo to prevent unnecessary re-renders
 * 
 * Features:
 * - Active moment highlighted with distinct styling
 * - Completion percentage shown for each moment
 * - Accessible keyboard navigation
 * - Responsive breakpoints for different screen sizes
 * 
 * Requirements: 7.1, 7.2, 7.4, 9.5
 */
export const MomentNavigation = React.memo(function MomentNavigation({
  moments,
  currentMomentIndex,
  onMomentChange,
  completionStatus,
  className,
}: MomentNavigationProps) {
  return (
    <nav
      className={cn('w-full', className)}
      aria-label="Navegação entre momentos temáticos"
    >
      {/* Mobile: Stacked Layout */}
      <div className="flex flex-col gap-3 sm:hidden">
        {moments.map((moment) => {
          const isActive = moment.index === currentMomentIndex;
          const status = completionStatus[moment.index] || {
            totalCards: 4,
            completedCards: 0,
            percentage: 0,
          };

          return (
            <MomentButton
              key={moment.index}
              moment={moment}
              isActive={isActive}
              status={status}
              onClick={() => onMomentChange(moment.index)}
            />
          );
        })}
      </div>

      {/* Tablet/Desktop: Horizontal Layout */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        {moments.map((moment) => {
          const isActive = moment.index === currentMomentIndex;
          const status = completionStatus[moment.index] || {
            totalCards: 4,
            completedCards: 0,
            percentage: 0,
          };

          return (
            <MomentButton
              key={moment.index}
              moment={moment}
              isActive={isActive}
              status={status}
              onClick={() => onMomentChange(moment.index)}
            />
          );
        })}
      </div>
    </nav>
  );
});

/**
 * MomentButton Component Props
 */
interface MomentButtonProps {
  moment: ThematicMoment;
  isActive: boolean;
  status: MomentCompletionStatus;
  onClick: () => void;
}

/**
 * MomentButton Component
 * 
 * Individual button for each thematic moment
 * Shows title, description, and completion status
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const MomentButton = React.memo(function MomentButton({ moment, isActive, status, onClick }: MomentButtonProps) {
  const isComplete = status.completedCards === status.totalCards;

  return (
    <Button
      variant={isActive ? 'primary' : 'outline'}
      onClick={onClick}
      className={cn(
        'h-auto p-4 flex flex-col items-start gap-3 text-left transition-all duration-200',
        isActive
          ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md'
          : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300 hover:border-gray-400',
        'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      )}
      aria-label={`${moment.title} - ${status.completedCards} de ${status.totalCards} cartas completas`}
      aria-current={isActive ? 'step' : undefined}
    >
      {/* Header with Number and Status Icon */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {/* Moment Number Badge */}
          <Badge
            variant="secondary"
            className={cn(
              'text-xs font-semibold px-2 py-0.5',
              isActive
                ? 'bg-blue-500 text-white border-blue-400'
                : 'bg-gray-100 text-gray-700 border-gray-200'
            )}
          >
            {moment.index + 1}
          </Badge>

          {/* Completion Icon */}
          {isComplete ? (
            <CheckCircle2
              className={cn(
                'w-5 h-5',
                isActive ? 'text-green-300' : 'text-green-500'
              )}
              aria-label="Momento completo"
            />
          ) : (
            <Circle
              className={cn(
                'w-5 h-5',
                isActive ? 'text-blue-300' : 'text-gray-400'
              )}
              aria-label="Momento incompleto"
            />
          )}
        </div>

        {/* Progress Badge */}
        <Badge
          variant="secondary"
          className={cn(
            'text-xs font-medium px-2 py-0.5',
            isActive
              ? 'bg-blue-500 text-white border-blue-400'
              : isComplete
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-gray-100 text-gray-600 border-gray-200'
          )}
        >
          {status.completedCards}/{status.totalCards}
        </Badge>
      </div>

      {/* Title */}
      <h3
        className={cn(
          'text-sm sm:text-base font-semibold leading-tight',
          isActive ? 'text-white' : 'text-gray-900'
        )}
      >
        {moment.title}
      </h3>

      {/* Description */}
      <p
        className={cn(
          'text-xs sm:text-sm leading-snug line-clamp-2',
          isActive ? 'text-blue-100' : 'text-gray-600'
        )}
      >
        {moment.description}
      </p>

      {/* Progress Bar */}
      <div className="w-full">
        <div
          className={cn(
            'h-1.5 rounded-full overflow-hidden',
            isActive ? 'bg-blue-500' : 'bg-gray-200'
          )}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out',
              isActive ? 'bg-white' : 'bg-blue-600'
            )}
            style={{ width: `${status.percentage}%` }}
            role="progressbar"
            aria-valuenow={status.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${status.percentage}% completo`}
          />
        </div>
      </div>
    </Button>
  );
});
