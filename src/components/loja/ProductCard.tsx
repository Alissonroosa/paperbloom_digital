'use client';

/**
 * ProductCard — Card de produto para a vitrine da loja
 * Mostra preço principal (físico), tag de arte digital quando disponível,
 * botão direto de WhatsApp e link "Ver detalhes" para a PDP.
 */

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { analytics } from '@/lib/analytics';
import { parsePriceFormatted } from '@/lib/loja-utils';
import type { CatalogProduct } from '@/types/catalog';
import ArtPurchaseButton from './ArtPurchaseButton';

const LOGO_WHATSAPP = 'https://imagem.paperbloom.com.br/loja/assets/whatsapp.svg';

interface ProductCardProps {
  product: CatalogProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const coverImage = product.images[0] || null;
  const hasArt = !!product.art;
  const hasPhysical = product.type === 'physical_only' || product.type === 'both';
  const physicalPrice = product.physical?.priceFormatted;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.physical) return;

    analytics.clickWhatsAppCheckout({
      slug: product.slug,
      title: product.title,
      value: parsePriceFormatted(product.physical.priceFormatted),
    });

    const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || '';
    const encodedMessage = encodeURIComponent(product.physical.whatsappMessage);
    const url = phone
      ? `https://wa.me/${phone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      id={`product-card-${product.id}`}
      className="relative overflow-hidden bg-white rounded-2xl border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl h-full flex flex-col"
    >
      {/* Badge superior direito */}
      {product.badge && (
        <div className="absolute top-4 right-4 z-10 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
          {product.badge}
        </div>
      )}

      {/* Imagem clicável para PDP */}
      <Link
        href={`/loja/${product.slug}`}
        className="block group"
        aria-label={`Ver detalhes de ${product.title}`}
      >
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#FFFAFA] rounded-t-2xl">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFFAFA] to-[#f5e6e6]">
              <span className="font-script text-4xl text-primary opacity-40">🌸</span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="flex flex-col gap-3 p-6 flex-1">
        {/* Prazo de produção — exibido apenas para produtos físicos */}
        {product.physical?.productionTime && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-primary">🕐</span>
            Produção em {product.physical.productionTime}
          </p>
        )}

        {/* Título (clicável) */}
        <Link href={`/loja/${product.slug}`} className="block">
          <h3 className="text-xl font-serif font-semibold text-text-main leading-snug hover:text-text-accent transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Descrição curta */}
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {product.shortDescription}
        </p>

        {/* Bloco de preços + CTAs — cada modalidade com fundo sutil próprio */}
        <div className="pt-3 mt-auto">
          <div className="flex flex-col gap-2">

            {/* Linha Encomendar produto (fundo verde sutil) */}
            {hasPhysical && (
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-green-50/70">
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-green-700">
                    Encomendar produto
                  </span>
                  <span className="text-base font-bold text-text-main truncate">
                    {physicalPrice ?? 'Consulte'}
                  </span>
                </div>
                <button
                  id={`btn-whatsapp-card-${product.id}`}
                  onClick={handleWhatsAppClick}
                  aria-label={`Encomendar ${product.title} pelo WhatsApp`}
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-[#25D366] text-white text-xs font-bold tracking-wide shadow-sm hover:bg-[#1FB855] hover:shadow-md transition-all duration-300 active:scale-95"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={LOGO_WHATSAPP}
                    alt=""
                    className="h-4 w-4"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                  WhatsApp
                </button>
              </div>
            )}

            {/* Linha Comprar arte digital (fundo rose sutil) */}
            {hasArt && product.art && (
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-primary/10">
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                    Comprar arte digital
                  </span>
                  <span className="text-base font-bold text-text-main truncate">
                    {product.art.priceFormatted}
                  </span>
                </div>
                <div className="shrink-0 w-[120px]">
                  <ArtPurchaseButton
                    productSlug={product.slug}
                    productTitle={product.title}
                    priceFormatted={product.art.priceFormatted}
                    priceInCents={product.art.priceInCents}
                    size="sm"
                    label="Comprar"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Link Ver detalhes */}
          <Link
            href={`/loja/${product.slug}`}
            className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors mt-3 underline underline-offset-4"
          >
            Ver detalhes
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
