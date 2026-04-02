'use client';

/**
 * AnimatedEmoji Component
 * 
 * Displays an emoji with a spring-based scale animation.
 * Used as a visual emotional element in wizard steps.
 * 
 * @see Requirements 2.4 - Animated emoji with scale (0 to 1) and spring physics
 */

import { motion } from 'framer-motion';

export interface AnimatedEmojiProps {
  /** The emoji character to display */
  emoji: string;
  /** Animation delay in seconds (default: 0.1) */
  delay?: number;
  /** Custom CSS classes (default: 'text-6xl mb-6') */
  className?: string;
}

/**
 * AnimatedEmoji renders an emoji with a spring animation that scales from 0 to 1.
 * 
 * @example
 * ```tsx
 * <AnimatedEmoji emoji="💌" />
 * <AnimatedEmoji emoji="🎉" delay={0.3} className="text-8xl" />
 * ```
 */
export function AnimatedEmoji({
  emoji,
  delay = 0.1,
  className = 'text-6xl mb-6',
}: AnimatedEmojiProps): JSX.Element {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        damping: 10,
        delay,
      }}
      className={className}
      role="img"
      aria-label={`Emoji: ${emoji}`}
    >
      {emoji}
    </motion.div>
  );
}
