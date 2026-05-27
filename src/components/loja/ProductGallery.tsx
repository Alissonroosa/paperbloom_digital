'use client';

/**
 * ProductGallery — Galeria de imagens do produto
 * - Imagem principal com navegação por setas e indicadores
 * - Thumbnails: scroll horizontal, suporta até 8 imagens
 * - Para 4 ou menos: thumbnails preenchem a largura sem scroll
 * - Para 5-8: scroll horizontal com scrollbar oculta
 * Lazy loading via next/image.
 */

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-[#FFFAFA] to-[#f5e6e6] flex items-center justify-center border-2 border-primary/10">
        <span className="font-script text-6xl text-primary opacity-30">🌸</span>
      </div>
    );
  }

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="flex flex-col gap-4">
      {/* Imagem principal / carrossel mobile */}
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#FFFAFA] border-2 border-primary/10 group">
        <Image
          src={images[activeIndex]}
          alt={`${title} — imagem ${activeIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={activeIndex === 0}
        />

        {/* Controles de navegação — apenas se houver mais de 1 imagem */}
        {images.length > 1 && (
          <>
            <button
              id="gallery-prev"
              onClick={prev}
              aria-label="Imagem anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-text-main rounded-full p-2 shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              id="gallery-next"
              onClick={next}
              aria-label="Próxima imagem"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-text-main rounded-full p-2 shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <ChevronRight size={20} />
            </button>

            {/* Indicadores de posição */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  id={`gallery-dot-${i}`}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Ver imagem ${i + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    i === activeIndex
                      ? 'bg-primary w-4'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails — exibidos apenas quando há mais de 1 imagem, até 8 fotos com scroll horizontal */}
      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
          {images.slice(0, 8).map((src, i) => (
            <button
              key={i}
              id={`gallery-thumb-${i}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver imagem ${i + 1}`}
              className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                i === activeIndex
                  ? 'border-primary shadow-md'
                  : 'border-primary/10 hover:border-primary/30'
              }`}
              style={{ width: `calc((100% - ${Math.min(images.length, 8) - 1} * 0.5rem) / ${Math.min(images.length, 4)})` }}
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={src}
                  alt={`${title} — miniatura ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
