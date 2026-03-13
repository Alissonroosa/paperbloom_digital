'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface FallingEmojisProps {
  emoji: string;
  count?: number;
}

export function FallingEmojis({ emoji, count = 15 }: FallingEmojisProps) {
  // Generate random positions and delays for emojis
  const emojis = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
      size: 20 + Math.random() * 20,
      rotation: Math.random() * 360,
      swing: Math.random() * 50 - 25,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {emojis.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{
            left: `${item.left}%`,
            top: '-50px',
            fontSize: `${item.size}px`,
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, item.swing, -item.swing, 0],
            rotate: [0, item.rotation, -item.rotation, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'linear',
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}
