'use client';

/**
 * LojaClientPage — Vitrine da loja Paper Bloom
 * Grid único de produtos + hero explicativo (WhatsApp + Mercado Pago + Mercado Envio)
 * + FAQ. Dispara analytics.viewLojaCatalog() ao montar.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, MessageCircle, Download } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import type { CatalogCollection, CatalogProduct } from '@/types/catalog';
import ProductCard from '@/components/loja/ProductCard';
import CollectionBanner from '@/components/loja/CollectionBanner';

const LOGO_MERCADO_PAGO = 'https://imagem.paperbloom.com.br/loja/assets/mercado-pago.svg';

interface LojaClientPageProps {
  products: CatalogProduct[];
  collection: CatalogCollection | null;
}

const FAQ_ITEMS = [
  {
    q: 'Como funciona a compra pelo WhatsApp?',
    a: 'Você clica em "Encomendar no WhatsApp" no produto desejado e cai numa conversa com nossa equipe com a mensagem já pronta. Combinamos a personalização (nomes, fotos, mensagens), enviamos uma prévia da arte para aprovação e um link de pagamento seguro pelo Mercado Pago.',
  },
  {
    q: 'Como é feito o pagamento e entrega?',
    a: 'Pagamento via Mercado Pago — PIX, boleto ou cartão em até 12× sem juros, totalmente seguro. Envio pelo Mercado Envio com código de rastreio. Você acompanha cada etapa: aprovação da arte, produção, postagem e entrega.',
  },
  {
    q: 'O que é a "Arte digital" que aparece em alguns produtos?',
    a: 'Alguns produtos têm uma versão em arte digital (template Canva editável) por um preço menor. Você compra direto pelo site, recebe o link por e-mail e imprime onde quiser. Ideal para quem quer economizar ou quer entregar imediatamente.',
  },
  {
    q: 'Quanto tempo para receber meu presente?',
    a: 'Artes digitais: entrega imediata por e-mail após o pagamento. Presentes físicos: produção em 5-10 dias úteis (varia por produto) + envio via Mercado Envio (3 a 10 dias dependendo da modalidade e CEP).',
  },
  {
    q: 'Vocês fazem troca?',
    a: 'Como todos os nossos produtos são personalizados, não realizamos trocas. Mas se houver qualquer erro de nossa parte (impressão, qualidade), refazemos sem custo adicional. Por isso enviamos sempre a prévia da arte para sua aprovação antes de imprimir.',
  },
  {
    q: 'Vocês entregam fora do Brasil?',
    a: 'No momento atendemos apenas pedidos com entrega no Brasil. Mas as artes digitais podem ser baixadas de qualquer lugar do mundo.',
  },
];

// Sub-componente — cards de "Como funciona"
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

export default function LojaClientPage({ products, collection }: LojaClientPageProps) {
  useEffect(() => {
    analytics.viewLojaCatalog();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFAFA] to-white">
      <section className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">

          {/* ── Hero institucional ── */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <span className="font-script text-3xl md:text-4xl text-primary mb-3 block">
              Nossa loja
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-text-main mb-5">
              Presentes feitos com amor
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Encomende presentes personalizados pelo WhatsApp ou baixe artes digitais imediatamente.
              Pagamento seguro via Mercado Pago e entrega rastreada via Mercado Envio.
            </p>
          </motion.div>

          {/* ── Como funciona — cards ── */}
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

          {/* ── Selos de segurança ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground mb-12"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-600" />
              Pagamento seguro
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_MERCADO_PAGO} alt="Mercado Pago" className="h-10 w-auto" />
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

          {/* ── Banner de coleção ativa (se houver) ── */}
          {collection && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="max-w-3xl mx-auto mb-10"
            >
              <CollectionBanner collection={collection} />
            </motion.div>
          )}

          {/* ── Grid único de produtos ── */}
          {products.length > 0 ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-center py-24"
            >
              <p className="font-script text-3xl text-primary mb-4">Em breve</p>
              <p className="text-muted-foreground">
                Nossa coleção de Dia dos Namorados está sendo finalizada com muito carinho. Volte em breve! 🌸
              </p>
            </motion.div>
          )}

          {/* ── Mini-FAQ ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-4 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-main text-center mb-8">
              Perguntas frequentes
            </h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map((faq, i) => (
                <details
                  key={i}
                  className="bg-white rounded-2xl p-6 border-2 border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <summary className="font-serif font-semibold text-text-main flex items-center justify-between list-none">
                    {faq.q}
                    <span className="text-primary text-2xl transition-transform group-open:rotate-45 shrink-0 ml-4">
                      +
                    </span>
                  </summary>
                  <p className="text-muted-foreground mt-3 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </motion.div>

          {/* ── CTA recuperar arte ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Já comprou uma arte digital e precisa baixar novamente?{' '}
              <a
                href="/loja/recuperar-arte"
                className="text-primary hover:text-secondary underline underline-offset-4 transition-colors"
              >
                Recuperar minha arte
              </a>
            </p>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
