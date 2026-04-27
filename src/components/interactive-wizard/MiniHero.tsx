'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface MiniHeroProps {
  headline: string;
  socialProofText: string;
  videoSrc?: string;
  posterSrc?: string;
  fallbackEmoji?: string;
  className?: string;
}

export function MiniHero({
  headline,
  socialProofText,
  videoSrc,
  posterSrc,
  fallbackEmoji = '💌',
  className = '',
}: MiniHeroProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  const showVideo = !!videoSrc && !videoFailed;
  const showPoster = !showVideo && !!posterSrc && !posterFailed;
  const showFallback = !showVideo && !showPoster;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`space-y-3 ${className}`}
    >
      <div className="relative w-full aspect-[4/5] max-h-[280px] rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100">
        {showVideo && (
          <video
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
            className="w-full h-full object-cover"
          />
        )}

        {showPoster && (
          <img
            src={posterSrc}
            alt={headline}
            onError={() => setPosterFailed(true)}
            className="w-full h-full object-cover"
          />
        )}

        {showFallback && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl drop-shadow-sm" aria-hidden="true">
              {fallbackEmoji}
            </span>
          </div>
        )}
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-base font-serif font-semibold text-gray-800 leading-snug">
          {headline}
        </h2>
        <p className="text-xs text-gray-500">
          <span aria-hidden="true">⭐⭐⭐⭐⭐</span> {socialProofText}
        </p>
      </div>
    </motion.div>
  );
}
