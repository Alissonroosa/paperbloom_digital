'use client';

/**
 * ProductActions — Container dos botões de compra
 * Renderização condicional baseada em product.type:
 * - art_only: apenas ArtPurchaseButton
 * - physical_only: apenas WhatsAppButton
 * - both: ambos os botões
 */

import type { CatalogProduct } from '@/types/catalog';
import WhatsAppButton from './WhatsAppButton';
import ArtPurchaseButton from './ArtPurchaseButton';

interface ProductActionsProps {
  product: CatalogProduct;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const showArt = product.type === 'art_only' || product.type === 'both';
  const showWhatsApp = product.type === 'physical_only' || product.type === 'both';

  return (
    <div className="flex flex-col gap-3">
      {showArt && product.art && (
        <ArtPurchaseButton
          productSlug={product.slug}
          productTitle={product.title}
          priceFormatted={product.art.priceFormatted}
        />
      )}
      {showWhatsApp && product.physical && (
        <WhatsAppButton
          productSlug={product.slug}
          whatsappMessage={product.physical.whatsappMessage}
          label={product.physical.label}
          variant={product.type === 'both' ? 'outline' : 'primary'}
        />
      )}
    </div>
  );
}
