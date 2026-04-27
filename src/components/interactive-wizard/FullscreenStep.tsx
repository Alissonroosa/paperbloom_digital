'use client';

/**
 * FullscreenStep Component
 * 
 * A fullscreen container for wizard steps with centered content,
 * configurable gradient background, and staggered animations.
 * 
 * @see Requirements 1.5 - Step occupies 100dvh with centered content
 * @see Requirements 1.6 - Apply gradient background (configurable colors)
 * @see Requirements 2.5 - Staggered content animation (delays: 0.1s, 0.2s, 0.4s, 0.5s, 0.7s)
 * @see Requirements 2.6 - Progress indicator with scale transformation
 * @see Requirements 9.1 - Use min-h-[100dvh] for mobile browser chrome
 * @see Requirements 9.2 - Responsive padding (px-4 mobile, larger desktop)
 * @see Requirements 9.4 - Responsive font sizes
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { AnimatedEmoji } from './AnimatedEmoji';
import { ProgressIndicator } from './ProgressIndicator';
import { PriceBadge } from './PriceBadge';
import { useInteractiveWizardContext } from '@/contexts/InteractiveWizardContext';
import { DEFAULT_ANIMATION_CONFIG } from '@/types/interactive-wizard';

export interface FullscreenStepProps {
  /** Content to render inside the step */
  children: React.ReactNode;
  /** Optional emoji to display at the top with animation */
  emoji?: string;
  /** Main title for the step */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Whether to show the progress indicator (default: true) */
  showProgress?: boolean;
  /** Whether to show the back link (default: true) */
  showBackLink?: boolean;
  /** URL for the back link (default: '/') */
  backLinkHref?: string;
  /** Text for the back link (default: '← Voltar') */
  backLinkText?: string;
  /** Whether to show the demo link (default: false) */
  showDemoLink?: boolean;
  /** URL for the demo link */
  demoLinkHref?: string;
  /** Whether to show the persistent price badge below the subtitle (default: true) */
  showPriceBadge?: boolean;
  /** Optional context line shown next to the price (e.g., "Acesso para sempre") */
  priceContextLine?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FullscreenStep provides a fullscreen container for wizard steps.
 * 
 * Features:
 * - Full viewport height (min-h-[100dvh]) with centered content
 * - Configurable gradient background from wizard config
 * - AnimatedEmoji at the top
 * - Staggered content animation with Framer Motion
 * - ProgressIndicator integration
 * - Back link and demo link support
 * - Responsive padding
 * 
 * @example
 * ```tsx
 * <FullscreenStep
 *   emoji="💌"
 *   title="Vamos começar!"
 *   subtitle="Preencha as informações abaixo"
 *   showDemoLink
 *   demoLinkHref="/demo/12-cartas"
 * >
 *   <FormContent />
 * </FullscreenStep>
 * ```
 */
export function FullscreenStep({
  children,
  emoji,
  title,
  subtitle,
  showProgress = true,
  showBackLink = true,
  backLinkHref = '/',
  backLinkText = '← Voltar',
  showDemoLink = false,
  demoLinkHref,
  showPriceBadge = true,
  priceContextLine,
  className,
}: FullscreenStepProps): JSX.Element {
  const { state, config, goToStep } = useInteractiveWizardContext();
  const { contentStagger } = DEFAULT_ANIMATION_CONFIG;
  const delays = contentStagger.delays;

  // Build gradient class from config
  const { gradientColors } = config;
  const gradientClass = gradientColors.via
    ? `from-${gradientColors.from} via-${gradientColors.via} to-${gradientColors.to}`
    : `from-${gradientColors.from} to-${gradientColors.to}`;

  const handleStepClick = (step: number) => {
    // Convert from 1-indexed (UI) to 0-indexed (context)
    goToStep(step - 1);
  };

  return (
    <div
      className={`min-h-[100dvh] flex flex-col items-center justify-center px-4 md:px-6 lg:px-8 py-8 bg-gradient-to-br ${gradientClass} ${className ?? ''}`}
    >
      {/* Animated Emoji */}
      {emoji && (
        <AnimatedEmoji emoji={emoji} delay={delays[0]} />
      )}

      {/* Title with staggered animation */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delays[1] }}
        className="font-serif text-3xl md:text-4xl text-center mb-3 text-gray-800"
      >
        {title}
      </motion.h1>

      {/* Subtitle with staggered animation */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delays[2] }}
          className="text-center text-gray-600 mb-4 max-w-md"
        >
          {subtitle}
        </motion.p>
      )}

      {/* Persistent price badge with staggered animation */}
      {showPriceBadge && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delays[2] + 0.05 }}
          className="mb-6"
        >
          <PriceBadge
            productType={config.productType}
            variant="compact"
            contextLine={priceContextLine}
          />
        </motion.div>
      )}

      {/* Main content container with staggered animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delays[3] }}
        className="w-full max-w-md space-y-6"
      >
        {/* Navigation bar: back link, progress indicator, demo link */}
        <div className="flex justify-between items-center mb-2">
          {/* Back link */}
          {showBackLink ? (
            <Link
              href={backLinkHref}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              {backLinkText}
            </Link>
          ) : (
            <div className="w-16" /> // Spacer for alignment
          )}

          {/* Progress indicator */}
          {showProgress && (
            <ProgressIndicator
              totalSteps={config.totalSteps}
              currentStep={state.currentStep + 1} // Convert to 1-indexed for display
              completedSteps={new Set(
                Array.from(state.completedSteps).map((s) => s + 1) // Convert to 1-indexed
              )}
              onStepClick={handleStepClick}
              allowClickNavigation={true}
            />
          )}

          {/* Demo link */}
          {showDemoLink && demoLinkHref ? (
            <a
              href={demoLinkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors"
            >
              <ExternalLink size={14} />
              Demo
            </a>
          ) : (
            <div className="w-16" /> // Spacer for alignment
          )}
        </div>

        {/* Children content */}
        {children}
      </motion.div>

      {/* Bottom spacer for any additional content with final stagger delay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delays[4] }}
        className="mt-8"
      />
    </div>
  );
}
