'use client';

/**
 * CollectionClientPage — Página de coleção sazonal
 * Hero temático com data limite + grid de produtos da coleção + FAQ.
 * Reutiliza ProductCard e padrões visuais da LojaClientPage.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, MessageCircle, Download } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import type { CatalogCollection, CatalogProduct } from '@/types/catalog';
import ProductCard from '@/components/loja/ProductCard';

const LOGO_MERCADO_PAGO = 'https://imagem.paperbloom.com.br/loja/assets/mercado-pago.svg';

interface CollectionClientPageProps {
  collection: CatalogCollection;
  products: CatalogProduct[];
}

function HowItWorksCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-primary/15 text-left">
      <div className="text-primary mb-2">{icon}</div>
      <h3 className="font-serif font-semibold text-text-main text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export default function CollectionClientPage({ collection, products }: CollectionClientPageProps) {
  useEffect(() => {
    analytics.viewLojaCatalog();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFAFA] to-white">
      <section className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">

          {/* ── Hero temático da coleção ── */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <span className="font-script text-3xl md:text-4xl text-primary mb-3 block">
              Coleção exclusiva
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-text-main mb-5">
              {collection.title.replace(/^Coleção /i, '')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              {collection.description}
            </p>
          </motion.div>

          {/* ── Como funciona ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto mb-10"
          >
            <HowItWorksCard
              icon={<MessageCircle size={22} />}
              title="1. Escolha e converse"
              description="Clique em encomendar no WhatsApp. Combinamos a personalização (nomes, fotos, mensagens)."
            />
            <HowItWorksCard
              icon={<ShieldCheck size={22} />}
              title="2. Pague com segurança"
              description="Link de pagamento Mercado Pago. PIX, boleto ou cartão em até 12× sem juros."
            />
            <HowItWorksCard
              icon={<Truck size={22} />}
              title="3. Entrega rastreada"
              description="Produzimos com carinho e enviamos via Mercado Envio com código de rastreio."
            />
            <HowItWorksCard
              icon={<Download size={22} />}
              title="Versão digital"
              description="Alguns produtos têm arte digital editável no Canva. Compra direto e baixa na hora."
            />
          </motion.div>

          {/* ── Selos ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground mb-10"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-600" />
              Pagamento seguro
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_MERCADO_PAGO} alt="Mercado Pago" className="h-4 w-auto" />
            </span>
            <span className="flex items-center gap-1.5">
              <Truck size={14} className="text-green-600" />
              Envio rastreado Mercado Envio
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-600">✓</span>
              Prévia da arte antes de imprimir
            </span>
          </motion.div>

          {/* ── Banner urgência data limite ── */}
          {collection.keyDates?.lastOrderDate && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-10 text-center max-w-3xl mx-auto"
            >
              <p className="text-xs md:text-sm text-text-main">
                ⚠️ <strong>Atenção:</strong> Encomende presentes físicos até{' '}
                <strong>{collection.keyDates.lastOrderDate}</strong> para receber a tempo do{' '}
                {collection.keyDates.deliveryEvent}.
              </p>
            </motion.div>
          )}

          {/* ── Grid de produtos da coleção ── */}
          {products.length > 0 ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.06, duration: 0.55 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-muted-foreground py-16">
              Nenhum produto disponível nessa coleção no momento.
            </p>
          )}

        </div>
      </section>
    </div>
  );
}
