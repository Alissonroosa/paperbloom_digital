'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Play } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { analytics } from '@/lib/analytics';

export interface HowItWorksStep {
  /** Número do passo (1-indexed) */
  number: number;
  /** Título emocional */
  title: string;
  /** Descrição curta (1-2 linhas) */
  description: string;
  /** 3 bullets verificáveis */
  bullets: string[];
  /** URL do vídeo MP4 (vertical 9:16) */
  videoSrc: string;
  /** Poster opcional (imagem antes do vídeo carregar) */
  posterSrc?: string;
}

interface HowItWorksCarouselProps {
  steps: HowItWorksStep[];
  /** URL pra qual os CTAs do final apontam (ex: /editor/12-cartas?source=after_how_it_works) */
  ctaHref: string;
  /** Label do CTA final (após o último passo) */
  ctaLabel?: string;
  /** Tracking source */
  trackingSource?: string;
}

/**
 * Carrossel "Como Funciona" — 1 passo por vez, com vídeo vertical à esquerda
 * em desktop e texto/bullets à direita. Em mobile, vídeo em cima, texto embaixo.
 *
 * Comportamento:
 * - Auto-advance quando o vídeo termina (até o último passo)
 * - Indicador de progresso clicável no topo (números + barra)
 * - Setas de navegação (anterior/próximo)
 * - Botão "Próximo passo →" abaixo do conteúdo
 * - No último passo, o CTA principal aparece em destaque
 * - Tracking automático: dispara evento ao mudar de passo
 */
export function HowItWorksCarousel({
  steps,
  ctaHref,
  ctaLabel = 'Criar minhas 12 cartas',
  trackingSource = 'how_it_works',
}: HowItWorksCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Só toca vídeo quando o carrossel está visível na viewport.
  // Antes, o autoplay disparava no mount — vídeo rodava (e até fazia auto-advance)
  // enquanto o usuário ainda estava no hero, sem ninguém ver.
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const total = steps.length;
  const isLast = currentIndex === total - 1;
  const step = steps[currentIndex];

  // Observa visibilidade do container. Dispara `setIsInView(true)` quando entra
  // (50% visível), e `false` quando sai — pausa o vídeo no fundo.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Avança pro próximo passo se houver, ou fica no último.
  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  // Tracking: dispara evento ao chegar em cada passo (idempotente — analytics.editorStep
  // não serve aqui porque é uma seção da LP, não do editor; uso evento genérico).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      // gtag direto pra não criar evento novo no analytics.ts pra esse caso pontual
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      w.gtag?.('event', 'how_it_works_step_view', {
        source: trackingSource,
        step_number: step.number,
        step_title: step.title,
      });
    } catch { /* ignore */ }
  }, [currentIndex, step.number, step.title, trackingSource]);

  // Controla play/pause do vídeo conforme:
  // - Mudança de passo: reseta pra 0 e dispara play
  // - Visibilidade da seção: só toca se estiver na viewport
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isInView) {
      v.currentTime = 0;
      // Some browsers só permitem autoplay com muted (já é o caso)
      v.play().catch(() => { /* autoplay bloqueado, sem problema */ });
    } else {
      v.pause();
    }
  }, [currentIndex, isInView]);

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto">
      {/* Indicador de progresso clicável */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {steps.map((s, i) => {
            const isActive = i === currentIndex;
            const isDone = i < currentIndex;
            return (
              <div key={s.number} className="flex items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => handleStepClick(i)}
                  className="flex items-center gap-2 group"
                  aria-label={`Ir para passo ${s.number}: ${s.title}`}
                >
                  <div
                    className={`
                      w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                      font-bold text-sm transition-all
                      ${isActive
                        ? 'bg-primary text-white shadow-lg scale-110'
                        : isDone
                          ? 'bg-primary/30 text-primary'
                          : 'bg-white border-2 border-primary/20 text-muted-foreground group-hover:border-primary/40'
                      }
                    `}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : s.number}
                  </div>
                  <span
                    className={`hidden sm:inline text-sm font-medium transition-colors ${
                      isActive ? 'text-text-main' : 'text-muted-foreground'
                    }`}
                  >
                    Passo {s.number}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-6 sm:w-12 rounded-full transition-colors ${isDone ? 'bg-primary/40' : 'bg-primary/15'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card do passo atual */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white rounded-3xl shadow-xl border border-primary/10 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:min-h-[520px]">
              {/* Vídeo — esquerda no desktop, topo no mobile */}
              <div className="md:w-2/5 bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-6 md:p-8">
                <div className="relative w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden shadow-lg bg-black aspect-[9/16]">
                  <video
                    ref={videoRef}
                    src={step.videoSrc}
                    poster={step.posterSrc}
                    muted
                    playsInline
                    preload="metadata"
                    onEnded={handleNext}
                    className="w-full h-full object-cover"
                  >
                    Seu navegador não suporta vídeos HTML5.
                  </video>
                </div>
              </div>

              {/* Texto — direita no desktop, abaixo no mobile */}
              <div className="md:w-3/5 p-6 md:p-10 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                    {step.number}
                  </span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Passo {step.number} de {total}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-3 leading-tight">
                  {step.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed mb-5">
                  {step.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {step.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-text-main">{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA de avanço — muda no último passo pra CTA principal */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {isLast ? (
                    <Link
                      href={ctaHref}
                      onClick={() => analytics.viewDemo(trackingSource)}
                      className="flex-1"
                    >
                      <Button
                        size="lg"
                        className="w-full text-base h-12 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30"
                      >
                        💌 {ctaLabel}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="lg"
                      onClick={handleNext}
                      className="flex-1 text-base h-12 rounded-full"
                    >
                      Próximo passo →
                    </Button>
                  )}

                  {currentIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="inline-flex items-center justify-center gap-1 px-4 h-12 rounded-full text-sm text-muted-foreground hover:text-text-main hover:bg-primary/5 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Setas grandes nos lados (só desktop, fora do card) */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
            aria-label="Passo anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentIndex < total - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
            aria-label="Próximo passo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Hint sutil — explica o auto-advance e atalho pro último passo */}
      {!isLast && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          <Play className="w-3 h-3 inline mr-1 fill-current" />
          O próximo passo abre automaticamente quando o vídeo termina
        </p>
      )}
    </div>
  );
}
