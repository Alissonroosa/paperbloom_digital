'use client';

/**
 * PriceBadge Component
 *
 * Badge de preço persistente exibido em todos os steps do editor.
 * Lê preço dinâmico via usePrices e mostra ancoragem "De/Por" quando disponível.
 *
 * @see .kiro/specs/editor-12-cartas-redesign/01-editor-ancoragem-preco/design.md
 */

import { usePrices } from '@/hooks/usePrices';
import type { ProductType } from '@/types/interactive-wizard';

const PRODUCT_TYPE_TO_PRICE_ID: Record<ProductType, string> = {
  'card-collection': 'card-collection',
  'digital-message': 'message',
  'gender-reveal': 'gender-reveal',
};

export interface PriceBadgeProps {
  /** Tipo do produto (do wizard config) */
  productType: ProductType;
  /** Variante visual: compact para barra fixa no editor, large para checkout */
  variant?: 'compact' | 'large';
  /** Linha de microcopy contextual ao lado do preço (ex: "Acesso para sempre") */
  contextLine?: string;
  /** Classes adicionais */
  className?: string;
}

export function PriceBadge({
  productType,
  variant = 'compact',
  contextLine = 'Acesso para sempre',
  className,
}: PriceBadgeProps): JSX.Element | null {
  const { prices } = usePrices();

  const priceId = PRODUCT_TYPE_TO_PRICE_ID[productType];
  const price = prices[priceId];

  if (!price) {
    return null;
  }

  const hasDiscount =
    price.priceFromCents !== null &&
    price.priceFromCents > price.priceCents &&
    !!price.priceFromFormatted;

  const discountPercent = hasDiscount
    ? Math.round((1 - price.priceCents / (price.priceFromCents as number)) * 100)
    : 0;

  if (variant === 'large') {
    return (
      <div
        className={`inline-flex flex-col items-center gap-1 rounded-2xl bg-white/90 backdrop-blur-sm border border-pink-200 shadow-sm px-6 py-4 ${className ?? ''}`}
      >
        {hasDiscount && (
          <p className="text-sm text-gray-400 line-through">
            De {price.priceFromFormatted}
          </p>
        )}
        <p className="text-4xl font-bold text-pink-600">{price.priceFormatted}</p>
        {hasDiscount && (
          <span className="text-xs font-semibold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
            {discountPercent}% OFF
          </span>
        )}
        <p className="text-xs text-gray-500 mt-1">{contextLine}</p>
      </div>
    );
  }

  // compact (default)
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-pink-200/70 shadow-sm px-3 py-1.5 text-xs ${className ?? ''}`}
    >
      {hasDiscount ? (
        <>
          <span className="text-gray-400 line-through">
            {price.priceFromFormatted}
          </span>
          <span className="font-bold text-pink-600 text-sm">
            {price.priceFormatted}
          </span>
          <span className="font-semibold text-pink-600 bg-pink-100 px-1.5 py-0.5 rounded-full text-[10px]">
            {discountPercent}% OFF
          </span>
        </>
      ) : (
        <span className="font-bold text-pink-600 text-sm">{price.priceFormatted}</span>
      )}
      <span className="text-gray-500 hidden sm:inline">•</span>
      <span className="text-gray-600 hidden sm:inline">{contextLine}</span>
    </div>
  );
}
