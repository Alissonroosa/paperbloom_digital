'use client';

/**
 * CollectionBanner — banner discreto que aponta para a coleção ativa.
 * Usado em /loja (catálogo geral) e na homepage (bloco da Loja).
 * Não renderiza nada se não houver coleção ativa.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CatalogCollection } from '@/types/catalog';

interface CollectionBannerProps {
  collection: CatalogCollection | null;
  /** Visual compacto (1 linha) para uso em listas; default false (visual completo) */
  compact?: boolean;
}

export default function CollectionBanner({ collection, compact = false }: CollectionBannerProps) {
  if (!collection) return null;

  const href = `/loja/colecao/${collection.slug}`;

  if (compact) {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/15 border border-primary/30 rounded-full px-4 py-2 text-xs md:text-sm text-text-main transition-colors"
      >
        <span>🌸</span>
        <span>
          <strong>Coleção {collection.title.replace(/^Coleção /i, '')}</strong> está no ar
        </span>
        <ArrowRight size={14} className="text-primary" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group block bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 border-2 border-primary/20 hover:border-primary/40 rounded-2xl p-5 md:p-6 transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className="font-script text-xl md:text-2xl text-primary block leading-tight">
            🌸 Coleção em destaque
          </span>
          <h3 className="text-lg md:text-xl font-serif font-bold text-text-main mt-1">
            {collection.title}
          </h3>
          {collection.keyDates?.lastOrderDate && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Encomende até <strong>{collection.keyDates.lastOrderDate}</strong> para o{' '}
              {collection.keyDates.deliveryEvent}
            </p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-2.5 transition-all">
          Ver coleção
          <ArrowRight size={18} />
        </div>
      </div>
    </Link>
  );
}
