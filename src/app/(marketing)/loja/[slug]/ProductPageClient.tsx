'use client';

/**
 * ProductPageClient — Página de produto individual (PDP)
 * Exibe as duas experiências de compra (arte digital + versão física)
 * como cards distintos lado-a-lado em desktop, com selos Mercado Pago/Envios.
 * Cards visíveis acima da dobra. Dispara analytics.viewLojaProduct(slug) ao montar.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, ShieldCheck, Truck, Mail, Package, ArrowLeft } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { getProductValueForAnalytics, parsePriceFormatted } from '@/lib/loja-utils';
import type { CatalogCollection, CatalogProduct } from '@/types/catalog';
import ProductGallery from '@/components/loja/ProductGallery';
import ArtPurchaseButton from '@/components/loja/ArtPurchaseButton';

interface ProductPageClientProps {
  product: CatalogProduct;
  collection: CatalogCollection | null;
}

const LOGO_MERCADO_PAGO = 'https://imagem.paperbloom.com.br/loja/assets/mercado-pago.svg';
const LOGO_MERCADO_ENVIOS = 'https://imagem.paperbloom.com.br/loja/assets/mercado-envios.svg';
const LOGO_WHATSAPP = 'https://imagem.paperbloom.com.br/loja/assets/whatsapp.svg';

export default function ProductPageClient({ product, collection }: ProductPageClientProps) {
  useEffect(() => {
    analytics.viewLojaProduct({
      slug: product.slug,
      title: product.title,
      type: product.type,
      value: getProductValueForAnalytics(product),
    });
  }, [product]);

  const hasArt = !!product.art;
  const hasPhysical = product.type === 'physical_only' || product.type === 'both';
  const hasBoth = hasArt && hasPhysical;
  const keyDates = collection?.keyDates;

  const handleWhatsAppClick = () => {
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
    <div className="min-h-screen bg-gradient-to-b from-[#FFFAFA] to-white">
      <section className="pt-28 md:pt-32 pb-10">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">

          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-sm text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <a href="/loja" className="hover:text-primary transition-colors">
              Loja
            </a>
            <span className="mx-2">/</span>
            <span className="text-text-main">{product.title}</span>
          </motion.nav>

          {/* Layout principal: galeria + detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* Galeria — sticky em desktop para acompanhar leitura */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="lg:sticky lg:top-6 self-start flex flex-col gap-3"
            >
              <a
                href="/loja"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit px-3 py-1.5 rounded-full border border-primary/20 hover:border-primary/40 bg-white/70 hover:bg-white"
              >
                <ArrowLeft size={16} />
                Voltar para o catálogo
              </a>
              <ProductGallery images={product.images} title={product.title} />
            </motion.div>

            {/* Detalhes */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-4"
            >
              {/* Badge */}
              {product.badge && (
                <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold w-fit">
                  {product.badge}
                </span>
              )}

              {/* Título */}
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main leading-tight">
                {product.title}
              </h1>

              {/* Descrição curta */}
              <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed">
                {product.shortDescription}
              </p>

              {/* ── Bloco de compra (acima da dobra) ── */}
              <div className={`grid grid-cols-1 ${hasBoth ? 'xl:grid-cols-2' : ''} gap-3 mt-1`}>

                {/* Card Arte Digital */}
                {hasArt && product.art && (
                  <div className="bg-white rounded-xl p-4 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Download size={14} className="text-primary" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          Arte Digital
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        <Mail size={10} />
                        Imediata
                      </span>
                    </div>

                    <p className="text-2xl font-bold text-text-main mb-2">
                      {product.art.priceFormatted}
                    </p>

                    <ul className="space-y-1 mb-3 text-xs text-text-main">
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span>Link no email após pagamento</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span>Template Canva editável</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span>Imprima onde quiser</span>
                      </li>
                    </ul>

                    <ArtPurchaseButton
                      productSlug={product.slug}
                      productTitle={product.title}
                      priceFormatted={product.art.priceFormatted}
                      priceInCents={product.art.priceInCents}
                    />

                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-[11px] text-muted-foreground">Pagamento</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={LOGO_MERCADO_PAGO}
                        alt="Mercado Pago"
                        className="h-4 w-auto"
                      />
                    </div>
                  </div>
                )}

                {/* Card Versão Física */}
                {hasPhysical && product.physical && (
                  <div className="bg-white rounded-xl p-4 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Package size={14} className="text-primary" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                          Versão Física
                        </span>
                      </div>
                      {product.physical.productionTime && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          🕐 {product.physical.productionTime}
                        </span>
                      )}
                    </div>

                    <p className="text-2xl font-bold text-text-main mb-2">
                      {product.physical.priceFormatted ?? 'Consulte preço'}
                    </p>

                    <ul className="space-y-1 mb-3 text-xs text-text-main">
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span>100% personalizado via WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span>Prévia da arte antes de imprimir</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span>Envio rastreado Mercado Envios</span>
                      </li>
                    </ul>

                    <button
                      id={`btn-whatsapp-${product.slug}`}
                      onClick={handleWhatsAppClick}
                      aria-label={`Encomendar ${product.title} pelo WhatsApp`}
                      className="w-full inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-[#25D366] text-white text-sm font-bold tracking-wide shadow-md hover:bg-[#1FB855] hover:shadow-lg transition-all duration-300 active:scale-95"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={LOGO_WHATSAPP}
                        alt=""
                        className="h-5 w-5"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                      Encomendar no WhatsApp
                    </button>

                    <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={LOGO_MERCADO_PAGO}
                        alt="Mercado Pago"
                        className="h-4 w-auto"
                      />
                      <span className="text-[11px] text-muted-foreground">+</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={LOGO_MERCADO_ENVIOS}
                        alt="Mercado Envios"
                        className="h-4 w-auto"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Banner data limite — compacto, abaixo dos cards */}
              {hasPhysical && keyDates?.lastOrderDate && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-text-main">
                    ⏰ Encomende até <strong>{keyDates.lastOrderDate}</strong> para receber a tempo
                    do {keyDates.deliveryEvent}.
                  </p>
                </div>
              )}

              {/* ── Selos de segurança compactos ── */}
              <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-lg px-4 py-3 border border-primary/10">
                <div className="grid grid-cols-3 gap-2 text-[11px] text-text-main">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-green-600 shrink-0" />
                    <span>Pagamento seguro</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck size={14} className="text-green-600 shrink-0" />
                    <span>Envio rastreado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} className="text-green-600 shrink-0" />
                    <span>Arte por email</span>
                  </div>
                </div>
              </div>

              {/* Licença — apenas para produtos com arte */}
              {product.art?.licenseText && (
                <p className="text-xs text-muted-foreground border-t border-primary/10 pt-3">
                  🔒 {product.art.licenseText}
                </p>
              )}
            </motion.div>
          </div>

          {/* ─────────── Bloco full-width abaixo da galeria ─────────── */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mt-12 lg:mt-16"
          >
            {/* Sobre + Como funciona em 2 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

              {/* Coluna esquerda — Sobre este produto */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-primary/10 shadow-sm">
                <span className="font-script text-2xl text-primary block mb-1">
                  Conheça
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-4">
                  Sobre este produto
                </h2>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.longDescription}
                </div>
              </div>

              {/* Coluna direita — Como funciona (digital + físico em accordion natural) */}
              <div className="flex flex-col gap-6">
                {hasArt && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 border border-primary/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-primary/10 rounded-full p-2.5">
                        <Download size={20} className="text-primary" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-primary block">
                          Arte Digital
                        </span>
                        <h3 className="text-lg font-serif font-semibold text-text-main">
                          Como funciona
                        </h3>
                      </div>
                    </div>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-3">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                          1
                        </span>
                        <span>Clique em <strong>&ldquo;Comprar arte digital&rdquo;</strong> e informe seu email</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                          2
                        </span>
                        <span>Pague pelo Mercado Pago — PIX, boleto ou cartão em até 12× sem juros</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                          3
                        </span>
                        <span>Receba o link no email em até 5 minutos após a confirmação</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                          4
                        </span>
                        <span>Abra o template no Canva, personalize, baixe em alta resolução e imprima</span>
                      </li>
                    </ol>
                  </div>
                )}

                {hasPhysical && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 border border-primary/10 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-primary/10 rounded-full p-2.5">
                        <Package size={20} className="text-primary" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-primary block">
                          Versão Física
                        </span>
                        <h3 className="text-lg font-serif font-semibold text-text-main">
                          Como funciona
                        </h3>
                      </div>
                    </div>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-3">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                          1
                        </span>
                        <span>
                          Clique em <strong>&ldquo;Encomendar no WhatsApp&rdquo;</strong> e inicie a conversa
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                          2
                        </span>
                        <span>Combinamos a personalização (nomes, fotos, mensagens)</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                          3
                        </span>
                        <span>Enviamos prévia da arte para sua aprovação + orçamento de frete pelo CEP</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                          4
                        </span>
                        <span>
                          Você recebe um link seguro do <strong>Mercado Pago</strong> (PIX, cartão até 12×)
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                          5
                        </span>
                        <span>
                          Produzimos em {product.physical?.productionTime || '5-7 dias úteis'} e enviamos
                          via <strong>Mercado Envios</strong> com código de rastreio
                        </span>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* CTA recuperar arte */}
            {hasArt && (
              <p className="text-sm text-muted-foreground text-center mt-10">
                Já comprou esta arte digital?{' '}
                <a
                  href="/loja/recuperar-arte"
                  className="text-primary hover:text-secondary underline underline-offset-4 transition-colors"
                >
                  Recuperar minha arte
                </a>
              </p>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
