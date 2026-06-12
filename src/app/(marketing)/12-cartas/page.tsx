"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PhoneMockup } from "@/components/ui/PhoneMockup";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Calendar,
  Heart,
  Lock,
  Gift,
  ChevronDown,
  Sparkles,
  Check,
  Play,
  Music,
  Image,
  MessageSquare,
  Unlock,
  Star,
  X,
  Smartphone,
  Zap,
  Pen,
} from "lucide-react";
import { usePrices } from "@/hooks/usePrices";
import { captureUtmsFromUrl } from "@/lib/utm";
import { analytics } from "@/lib/analytics";
import type { HowItWorksStep } from "@/components/landing/HowItWorksCarousel";

// Lazy load do carrossel — ele só importa quando o usuário scrolla até ele.
// Reduz JS inicial da LP (vídeo player + lógica de transição = grande).
// ssr:false porque o componente usa IntersectionObserver e video refs.
// Skeleton mantém altura aproximada pra evitar CLS quando carregar.
const HowItWorksCarousel = dynamic(
  () => import("@/components/landing/HowItWorksCarousel").then(m => m.HowItWorksCarousel),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-5xl mx-auto min-h-[520px] bg-white/40 rounded-3xl border border-primary/10 animate-pulse" />
    ),
  }
);

// Vídeos do "Como Funciona" hospedados no R2 (CDN imagem.paperbloom).
// Cada um tem ~10s, formato vertical 9:16 (gravação de tela do celular).
const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: 1,
    title: "Conte quem é a pessoa amada",
    description:
      "Diga pra quem é e o seu nome. Em segundos a IA já gera as 12 cartas com mensagens emocionantes — você só ajusta o que quiser.",
    bullets: [
      "Nome do destinatário",
      "Seu nome",
      "IA gera as 12 cartas automaticamente",
    ],
    videoSrc:
      "https://imagem.paperbloom.com.br/meta-ads/criativos/12-cartas/20260605_021452_Passo_1.mp4",
  },
  {
    number: 2,
    title: "Personalize com sua história",
    description:
      "Troque qualquer mensagem que a IA escreveu. Adicione foto em cada carta, escolha uma música do YouTube e uma foto coringa pra dar identidade.",
    bullets: [
      "Editar texto de cada carta",
      "Foto individual em cada uma",
      "Música que toca quando a carta abre",
    ],
    videoSrc:
      "https://imagem.paperbloom.com.br/meta-ads/criativos/12-cartas/20260605_021519_Passo_2.mp4",
  },
  {
    number: 3,
    title: "Você decide quando e como entregar",
    description:
      "Receba o link no email + um painel pra acompanhar. Envie por WhatsApp, gere o QR Code pra imprimir, ou faça aquela surpresa presencial.",
    bullets: [
      "Link mágico no seu email",
      "QR Code pra imprimir e presentear",
      "Painel pra acompanhar quais cartas foram abertas",
    ],
    videoSrc:
      "https://imagem.paperbloom.com.br/meta-ads/criativos/12-cartas/20260605_021526_Passo_3.mp4",
  },
];

// Logos oficiais hospedados no CDN da Paperbloom — mesmo padrão usado na /loja.
const LOGO_WHATSAPP = "https://imagem.paperbloom.com.br/loja/assets/whatsapp.svg";
const LOGO_MERCADO_PAGO = "https://imagem.paperbloom.com.br/loja/assets/mercado-pago.svg";

// WhatsApp support helpers — usado em vários pontos da LP pra direcionar dúvidas
// pra equipe de suporte (você quer atendimento direto até validar objeções).
const SUPPORT_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || "5551992698003";
const SUPPORT_MESSAGE_DEFAULT =
  "Olá! Tenho uma dúvida sobre as 12 Cartas da Paper Bloom.";

function buildSupportWhatsAppUrl(message: string = SUPPORT_MESSAGE_DEFAULT): string {
  return `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Botão "Falar com a equipe" reutilizável.
 * `source` identifica o local na LP pra tracking.
 * `variant`: text-link (inline discreto) ou outline (botão visível).
 */
function WhatsAppSupportButton({
  source,
  variant = "outline",
  message,
  className = "",
}: {
  source: string;
  variant?: "outline" | "text-link";
  message?: string;
  className?: string;
}) {
  const url = buildSupportWhatsAppUrl(message);
  const handleClick = () => analytics.contactWhatsApp(source);

  if (variant === "text-link") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 text-sm font-medium text-[#25D366] hover:text-[#1FB855] underline-offset-2 hover:underline ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_WHATSAPP} alt="" className="h-4 w-4" aria-hidden="true" />
        Falar com a equipe no WhatsApp
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      // group: na hover o ícone vira branco junto com o texto (filter trick)
      className={`group inline-flex items-center justify-center gap-2 px-6 h-12 rounded-full border-2 border-[#25D366] text-[#25D366] font-medium hover:bg-[#25D366] hover:text-white transition-colors ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_WHATSAPP}
        alt=""
        aria-hidden="true"
        className="h-4 w-4 transition-[filter] group-hover:[filter:brightness(0)_invert(1)]"
      />
      Tirar dúvida pelo WhatsApp
    </a>
  );
}

/**
 * Sticky CTA mobile — aparece no rodapé após scroll >30% da página.
 * Mostra preço (ancorado) + CTA de demo (não pula direto pro editor pra tráfego frio).
 * Some no topo pra não atropelar o hero, e no rodapé pra não duplicar com Final CTA.
 */
function MobileStickyCTA({ priceFormatted }: { priceFormatted?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const ratio = window.scrollY / total;
      // Aparece entre 25% e 88% do scroll (não atrapalha hero nem rodapé)
      setVisible(ratio > 0.25 && ratio < 0.88);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-2 pointer-events-none">
      <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-primary/20 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <p className="text-[10px] text-muted-foreground leading-tight">a partir de</p>
          <p className="text-lg font-bold text-primary leading-none">{priceFormatted || "R$ 29,90"}</p>
        </div>
        <Link
          href="/demo/card-collection?source=mobile_sticky_cta"
          onClick={() => analytics.viewDemo("mobile_sticky_cta")}
          className="flex-1"
        >
          <Button size="sm" className="w-full h-11 text-sm rounded-full">
            <Play className="w-4 h-4 mr-1.5 fill-current" />
            Sentir a experiência
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Botão flutuante de WhatsApp — aparece após 20s da LP.
 * Em LP (tráfego frio) reduz pra 20s vs editor (30s) — usuário precisa de mais
 * suporte na fase de descoberta.
 */
function FloatingWhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 20000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <a
      href={buildSupportWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analytics.contactWhatsApp("floating_button")}
      aria-label="Tirar dúvida pelo WhatsApp"
      title="Tirar dúvida pelo WhatsApp"
      // Em mobile, sobe acima do MobileStickyCTA (~bottom-24). Em desktop fica bottom-4.
      className="fixed bottom-24 md:bottom-4 right-4 z-50 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] h-12 w-12 sm:w-auto sm:px-4 sm:py-3 text-sm font-medium text-white shadow-lg ring-1 ring-black/5 transition-all hover:scale-105 hover:bg-[#1FB855] hover:shadow-xl"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_WHATSAPP}
        alt=""
        aria-hidden="true"
        className="h-5 w-5"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <span className="hidden sm:inline">Tirar dúvida</span>
    </a>
  );
}

// Demo card data
// 12 cartas mostradas no mockup do hero — mesmo número e estilo do produto real.
// Usadas só visualmente (não interativas). Quando o usuário toca, vai pra /demo.
const DEMO_CARDS = [
  { order: 1, title: "Dia difícil", emoji: "💪", color: "#E8B4B8" },
  { order: 2, title: "Insegurança", emoji: "🌟", color: "#B4D4E8" },
  { order: 3, title: "Distância", emoji: "🌍", color: "#E8D4B4" },
  { order: 4, title: "Estresse", emoji: "🧘", color: "#D4E8B4" },
  { order: 5, title: "Te amo", emoji: "💕", color: "#F4B4D4" },
  { order: 6, title: "Aniversário", emoji: "🎂", color: "#D4B4F4" },
  { order: 7, title: "Conquista", emoji: "🏆", color: "#F4D4B4" },
  { order: 8, title: "Saudade", emoji: "💌", color: "#B4F4D4" },
  { order: 9, title: "Risadas", emoji: "😄", color: "#F4E8B4" },
  { order: 10, title: "Briga boba", emoji: "🤍", color: "#B4D4F4" },
  { order: 11, title: "Sonho", emoji: "✨", color: "#E8B4F4" },
  { order: 12, title: "Pra sempre", emoji: "♾️", color: "#F4B4B4" },
];

/**
 * Mini-mockup interativo do produto.
 *
 * Mostra 4 cartas (grid 2×2) como prévia visual — não as 12, pra manter o mockup
 * leve e a hero limpa. O footer indica "1 de 12 cartas" pra deixar claro que
 * o produto real tem todas.
 *
 * Cada carta é tocável — ao tocar, abre um modal DENTRO do mockup com cadeado
 * animado e CTA pra demo completa. A metáfora se mantém: o modal "vive" no
 * telefone, não estoura pra fora.
 *
 * Por que isso funciona melhor que o mockup estático:
 *   - Confirma a expectativa do usuário (tocar = algo acontece)
 *   - Vira mini-trailer da demo, gerando curiosidade
 *   - Cada toque é mais uma chance de levar pra /demo/card-collection
 *
 * `onCtaClick` é disparado em qualquer interação que leva pra demo.
 */
function DemoPreviewStatic({ onCtaClick }: { onCtaClick?: () => void }) {
  const [tappedCard, setTappedCard] = useState<typeof DEMO_CARDS[number] | null>(null);
  // 6 cartas em grid 2×3 — equilíbrio entre densidade visual e legibilidade.
  // Footer mostra "+ 6 cartas" pra reforçar que o produto tem mais.
  const previewCards = DEMO_CARDS.slice(0, 6);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-primary/5 via-white to-primary/10 overflow-hidden flex flex-col">
      {/* Header compacto — pt-7 pra escapar do notch do PhoneMockup (barra preta h-18 no top-0) */}
      <div className="text-center pt-7 pb-2 px-4 flex-shrink-0">
        <p className="font-serif text-[13px] text-gray-800 leading-tight">Para: Amor ❤️</p>
        <p className="text-[10px] text-gray-500 leading-tight">De: Seu amor</p>
      </div>

      {/* Grid 2×3 — cards com aspect 5/6 (mais quadrados que 3/4) pra caber as 3 linhas
          no espaço útil do PhoneMockup (600px). min-h-0 permite o grid encolher se faltar. */}
      <div className="grid grid-cols-2 gap-1.5 px-2.5 flex-1 min-h-0 content-start">
        {previewCards.map((card) => (
          <button
            key={card.order}
            type="button"
            onClick={() => setTappedCard(card)}
            className="relative rounded-lg aspect-[5/6] flex flex-col items-center justify-center px-1.5 py-1.5 bg-white shadow-sm border border-primary/10 transition-transform hover:scale-[1.05] active:scale-95 cursor-pointer"
            style={{ backgroundColor: `${card.color}25` }}
            aria-label={`Carta ${card.order}: ${card.title}`}
          >
            {/* Cadeado em círculo destacado — central, claramente visível */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center mb-0.5"
              style={{ backgroundColor: `${card.color}60` }}
            >
              <Lock className="w-3 h-3 text-primary/70" aria-hidden="true" />
            </div>

            <span className="text-sm leading-none" aria-hidden="true">{card.emoji}</span>
            <p className="text-[7px] text-primary/70 font-semibold leading-tight mt-0.5">
              Carta {card.order}
            </p>
            <p className="text-[9px] text-gray-800 leading-tight font-medium text-center line-clamp-1">
              {card.title}
            </p>
          </button>
        ))}
      </div>

      {/* CTA no rodapé — flex-shrink-0 garante que nunca seja comprimido */}
      <div className="px-3 pt-2 pb-3 flex-shrink-0">
        <Link
          href="/demo/card-collection?source=hero_mockup_button"
          onClick={() => onCtaClick?.()}
          className="block"
        >
          <div className="w-full bg-primary text-white text-center rounded-full py-2 px-3 shadow-md text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all">
            <Play className="w-3 h-3 fill-current" aria-hidden="true" />
            Abrir demo (30s)
          </div>
        </Link>
        <p className="text-[9px] text-center text-gray-400 mt-1">
          + 6 cartas na demo · sem cadastro
        </p>
      </div>

      {/* Modal interno — sobe dentro do mockup quando uma carta é tocada.
          Não usa AnimatePresence pra não somar peso ao bundle (mockup é só visual).
          Posicionado absolute pra cobrir o conteúdo do telefone. */}
      {tappedCard && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setTappedCard(null)}
        >
          <div
            className="relative w-full bg-white rounded-2xl shadow-2xl p-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar */}
            <button
              type="button"
              onClick={() => setTappedCard(null)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-3 h-3 text-gray-400" aria-hidden="true" />
            </button>

            {/* Cadeado animado */}
            <div className="relative inline-flex items-center justify-center mb-2">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              {/* Sparkles */}
              <span className="absolute -top-1 -right-1 text-xs" aria-hidden="true">✨</span>
              <span className="absolute -bottom-1 -left-1 text-xs" aria-hidden="true">✨</span>
            </div>

            <p className="text-[10px] font-semibold text-text-main mb-1">
              {tappedCard.emoji} {tappedCard.title}
            </p>
            <p className="text-[9px] text-muted-foreground leading-tight mb-3">
              Pra sentir a experiência completa, preparamos uma demonstração igual à que seu amor verá.
            </p>

            <Link
              href="/demo/card-collection?source=hero_mockup_card"
              onClick={() => onCtaClick?.()}
              className="block"
            >
              <div className="w-full bg-primary text-white text-center rounded-full py-2 px-3 shadow-md text-[10px] font-semibold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all">
                <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                Abrir demonstração
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setTappedCard(null)}
              className="text-[9px] text-gray-400 hover:text-gray-600 mt-2 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente interativo antigo — mantido pra eventual reuso, mas não está sendo usado.
// O hero passou a usar DemoPreviewStatic + Link pra /demo/card-collection.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _DemoPreviewInteractive() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [openedCards, setOpenedCards] = useState<number[]>([]);
  const [showMessage, setShowMessage] = useState(false);

  const handleCardClick = (order: number) => {
    if (openedCards.includes(order)) return;
    setSelectedCard(order);
  };

  const handleOpenCard = () => {
    if (selectedCard && !openedCards.includes(selectedCard)) {
      setOpenedCards([...openedCards, selectedCard]);
      setShowMessage(true);
    }
  };

  const handleBack = () => {
    setSelectedCard(null);
    setShowMessage(false);
  };

  const reset = () => {
    setSelectedCard(null);
    setOpenedCards([]);
    setShowMessage(false);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-primary/5 via-white to-primary/10 overflow-hidden">
      <AnimatePresence mode="wait">
        {!selectedCard && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full p-4"
          >
            <div className="text-center mb-3">
              <p className="font-serif text-sm text-gray-800">Para: Amor ❤️</p>
              <p className="text-xs text-gray-500">De: Seu amor</p>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              {DEMO_CARDS.map((card) => {
                const isOpened = openedCards.includes(card.order);
                return (
                  <motion.button
                    key={card.order}
                    onClick={() => handleCardClick(card.order)}
                    whileHover={{ scale: isOpened ? 1 : 1.02 }}
                    whileTap={{ scale: isOpened ? 1 : 0.98 }}
                    className={`relative rounded-xl p-3 text-left transition-all ${
                      isOpened
                        ? "bg-gray-100 opacity-60"
                        : "bg-white shadow-md hover:shadow-lg border border-primary/10"
                    }`}
                    style={{ backgroundColor: isOpened ? undefined : `${card.color}20` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{card.emoji}</span>
                      {isOpened ? (
                        <Unlock className="w-3 h-3 text-gray-400" />
                      ) : (
                        <Lock className="w-3 h-3 text-primary/60" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-600 line-clamp-2 leading-tight">
                      {card.title}
                    </p>
                    {isOpened && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
                        <span className="text-xs text-gray-500">Aberta ✓</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              {openedCards.length}/4 cartas abertas
            </p>
            {openedCards.length > 0 && (
              <button onClick={reset} className="text-[10px] text-primary underline mt-1">
                Reiniciar demo
              </button>
            )}
          </motion.div>
        )}

        {selectedCard && !showMessage && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center h-full p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
            >
              <Lock className="w-8 h-8 text-primary" />
            </motion.div>
            <h3 className="font-serif text-lg text-gray-800 mb-2">
              {DEMO_CARDS.find((c) => c.order === selectedCard)?.title}
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Esta carta só pode ser aberta uma única vez. Tem certeza?
            </p>
            <div className="flex gap-3">
              <Button size="sm" variant="outline" onClick={handleBack} className="text-xs">
                Voltar
              </Button>
              <Button
                size="sm"
                onClick={handleOpenCard}
                className="text-xs bg-primary hover:bg-primary/90"
              >
                Abrir Carta 💌
              </Button>
            </div>
          </motion.div>
        )}

        {selectedCard && showMessage && (
          <motion.div
            key="message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full"
          >
            <div
              className="flex-1 p-6 flex flex-col items-center justify-center text-center"
              style={{
                backgroundColor: `${DEMO_CARDS.find((c) => c.order === selectedCard)?.color}30`,
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 8 }}
                className="text-5xl mb-4"
              >
                {DEMO_CARDS.find((c) => c.order === selectedCard)?.emoji}
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-serif text-sm text-gray-800 mb-4"
              >
                {DEMO_CARDS.find((c) => c.order === selectedCard)?.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs text-gray-600 leading-relaxed"
              >
                Sei que hoje não está sendo fácil, mas quero que saiba que você é mais forte do que
                imagina. Eu acredito em você, sempre. ❤️
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 flex items-center gap-2 text-[10px] text-gray-400"
              >
                <Music className="w-3 h-3" />
                <span>♪ Música tocando...</span>
              </motion.div>
            </div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={handleBack}
              className="p-3 text-xs text-primary font-medium"
            >
              ← Voltar às cartas
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  // Dispara analytics.faqOpen só na primeira abertura por sessão de cada pergunta.
  // Permite ver quais objeções os usuários mais buscam responder.
  const hasTracked = useRef(false);

  const handleToggle = () => {
    const next = !isOpen;
    if (next && !hasTracked.current) {
      hasTracked.current = true;
      analytics.faqOpen(question, "lp_12_cartas");
    }
    setIsOpen(next);
  };

  return (
    <div className="border border-primary/10 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
      <button
        onClick={handleToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-primary/5 transition-colors duration-200"
      >
        <span className="font-semibold text-text-main text-lg pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[600px]" : "max-h-0"
        }`}
      >
        <div className="px-6 pb-5 text-muted-foreground leading-relaxed">{answer}</div>
      </div>
    </div>
  );
}

// Card templates preview
const CARD_THEMES = [
  {
    group: "Momentos de Apoio",
    emoji: "💪",
    cards: [
      "Dia difícil",
      "Insegurança",
      "Distância",
      "Estresse",
    ],
    color: "from-rose-100 to-pink-100",
  },
  {
    group: "Celebração e Romance",
    emoji: "💕",
    cards: [
      "Quanto te amo",
      "Aniversário juntos",
      "Conquista",
      "Noite de chuva",
    ],
    color: "from-pink-100 to-purple-100",
  },
  {
    group: "Conflitos e Risadas",
    emoji: "😊",
    cards: [
      "Primeira briga",
      "Dar risada",
      "Te irritei",
      "Não conseguir dormir",
    ],
    color: "from-purple-100 to-indigo-100",
  },
];

export default function DozeCartasLP() {
  const { prices } = usePrices();
  const cardCollectionPrice = prices['card-collection'];

  // Captura UTMs (first-touch) + ViewContent do Pixel.
  // - UTMs ficam em sessionStorage e são lidos quando o editor cria a collection.
  // - ViewProduct alimenta o algoritmo do Meta com sinal de "interesse" pra otimização
  //   de campanhas e construção de audiência de remarketing.
  useEffect(() => {
    captureUtmsFromUrl();
    analytics.viewProduct('card-collection');
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section — todo o conteúdo render direto (sem motion + opacity:0).
          Antes usava framer-motion com initial opacity 0 + delays 0.1s, 0.2s, 0.3s, 0.4s, 0.6s, 0.8s
          que faziam o LCP do mobile chegar a 6.7s (texto invisível até JS carregar e animação rodar).
          Agora renderiza visível no SSR — LCP reduzido drasticamente.

          Mobile: pt-24 (96px) reserva espaço pro header fixo + 32px de respiro
                  pra evitar o "amontoado" reportado pelo usuário. */}
      <section className="relative pt-24 pb-16 md:py-28 overflow-hidden bg-gradient-to-br from-primary/5 via-[#FFFAFA] to-primary/10 flex flex-col items-center justify-center min-h-[90vh]">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-[100px]" />
        </div>

        <div className="container px-4 md:px-8 relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Column: Text Content — Hero conversion-focused.
                Ordem: headline benefício → sub explicativo → 3 bullets de feature →
                CTA único dominante + botão demo secundário → trust elements + urgência. */}
            <div className="flex-1 text-center lg:text-left">
              {/* Headline curto e direto — verbo de ação ("surpreenda") + emoção pura.
                  Detalhes do "como" ficam no sub e nos bullets logo abaixo. */}
              <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-text-main mb-4 md:mb-5 leading-[1.05]">
                Surpreenda{" "}
                <span className="text-primary italic">quem você ama</span>
              </h1>

              {/* Sub-headline curto que explica O QUE É em 1 frase.
                  Trocada a frase "só pode ser aberta uma vez" — disparava medo de produto
                  efêmero. Agora foca na permanência ("pra sempre"). */}
              <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                12 cartas digitais com fotos, música e mensagens suas.
                Pra ela revisitar sempre que precisar.
              </p>

              {/* 3 bullets de feature — narrativa do processo de criação em ordem:
                  rapidez (objeção "consigo fazer?") → IA + você (objeção "vocês fazem?") →
                  personalização emocional (gancho pro CTA). */}
              <ul className="mb-7 space-y-2 max-w-md mx-auto lg:mx-0">
                <li className="flex items-center gap-2 text-sm md:text-base text-text-main justify-center lg:justify-start">
                  <Smartphone className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span><strong>Você cria sozinho(a)</strong> em poucos minutos, no celular</span>
                </li>
                <li className="flex items-center gap-2 text-sm md:text-base text-text-main justify-center lg:justify-start">
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span>Nossa <strong>IA sugere as mensagens</strong>, você edita do jeito que quiser</span>
                </li>
                <li className="flex items-center gap-2 text-sm md:text-base text-text-main justify-center lg:justify-start">
                  <Music className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  <span>Personalize com <strong>suas fotos</strong> e <strong>a música favorita</strong> de vocês</span>
                </li>
              </ul>

              {/* CTA único dominante + botão secundário pra demo.
                  Inversão de hierarquia: editor é primário (intenção de conversão).
                  Demo agora como outline pra ter peso visual real (era link discreto antes). */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
                <Link href="/editor/12-cartas?source=hero_button" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-lg px-10 h-14 rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                  >
                    💌 Criar minhas 12 cartas
                  </Button>
                </Link>

                <Link
                  href="/demo/card-collection?source=hero_button"
                  onClick={() => analytics.viewDemo('hero_button')}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-base px-6 h-12 rounded-full border-2 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all"
                  >
                    <Play className="w-4 h-4 mr-1.5 fill-current" aria-hidden="true" />
                    Ver demonstração (30s)
                  </Button>
                </Link>
              </div>

              {/* Trust elements + urgência — pagamento, entrega, sem assinatura, deadline DN. */}
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                  Pagamento via
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={LOGO_MERCADO_PAGO}
                    alt="Mercado Pago"
                    className="h-5 w-auto"
                  />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                  Entrega imediata
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                  Sem assinatura
                </span>
              </div>

              {/* Urgência sazonal */}
              <p className="mt-4 text-xs font-semibold text-red-600 inline-flex items-center gap-1.5 justify-center lg:justify-start">
                ⏳ Promoção Dia dos Namorados — válida até 12/06
              </p>
            </div>

            {/* Right Column: Phone Preview — todo o mockup é clicável e leva
                pra demo cinematográfica completa em /demo/card-collection.
                Antes tinha mini-demo interativa que canibalizava a demo full;
                agora é um único fluxo de demonstração.
                Removido motion wrapper externo (estava opacity:0 inicialmente). */}
            <div className="flex-1 relative w-full max-w-[350px] lg:max-w-none flex justify-center">
              {/* Mockup do telefone — não mais envelopado por Link externo.
                  O CTA ficou DENTRO do mockup (botão "Abrir demo"), mais explícito
                  e legível que esperar o usuário descobrir que o mockup é clicável.
                  O mockup em si fica como visual hero. */}
              <div className="relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -z-10" />

                <div className="text-center mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-flex items-center gap-2 text-sm font-medium bg-white/80 backdrop-blur-sm text-primary px-4 py-2 rounded-full shadow-sm border border-primary/10"
                  >
                    👀 Veja como funciona
                  </motion.div>
                </div>

                <PhoneMockup className="shadow-2xl shadow-primary/20">
                  <DemoPreviewStatic onCtaClick={() => analytics.viewDemo('hero_mockup_button')} />
                </PhoneMockup>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Antes que você pergunte — 4 cards que matam as objeções principais
          coletadas dos atendimentos via WhatsApp (jun/2026):
          1. "Abre só 1 vez?" (efêmero) → magia abre 1 vez, lembrança fica
          2. "Consigo fazer sozinho?" (técnico) → 15min, celular
          3. "Vem tudo automático?" (vou pagar e esperar) → entrega na hora
          4. "Vocês que escrevem?" (vou pagar e vocês fazem) → você cria, IA sugere
          Posicionado logo após o hero pra interceptar a dúvida ANTES dela travar. */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container px-4 md:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-script text-2xl text-primary mb-2 block"
            >
              Antes que você pergunte
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-4xl font-serif font-bold text-text-main"
            >
              As dúvidas mais comuns, já respondidas
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {/* Card 1: Abertura única (efemeridade) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-primary/5 to-white border-2 border-primary/10 rounded-2xl p-5 md:p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-text-main mb-2 leading-snug">
                Cada carta abre só uma vez?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A <strong>magia da primeira abertura</strong> acontece uma vez só — é o ritual. Mas depois, a carta fica disponível pra ela <strong>revisitar quantas vezes quiser</strong> 💛
              </p>
            </motion.div>

            {/* Card 2: Eu consigo fazer sozinha */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-primary/5 to-white border-2 border-primary/10 rounded-2xl p-5 md:p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-text-main mb-2 leading-snug">
                Consigo fazer sozinha(o)?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sim! É <strong>tudo no celular</strong>, em 5 passos. Demora <strong>15 min</strong> e você pode salvar e voltar depois. Nada técnico — se você usa Instagram, dá conta 🌸
              </p>
            </motion.div>

            {/* Card 3: Vem tudo automático? */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-primary/5 to-white border-2 border-primary/10 rounded-2xl p-5 md:p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-text-main mb-2 leading-snug">
                Vem tudo automático depois?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sim! Após o pagamento, <strong>cai na hora</strong> no seu email: link das cartas + QR Code + painel pra acompanhar. <strong>Sem espera, sem frete</strong> ✨
              </p>
            </motion.div>

            {/* Card 4: Vocês que fazem a carta? */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-primary/5 to-white border-2 border-primary/10 rounded-2xl p-5 md:p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Pen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-text-main mb-2 leading-snug">
                Vocês que escrevem as cartas?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Você escreve</strong> — afinal, é seu sentimento. Mas nossa <strong>IA já sugere</strong> uma mensagem pra cada uma, baseada no nome dela. Você ajusta o que quiser 💌
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section — carrossel gameficado de 3 passos.
          Movida pra logo após o hero (2ª section) pra entregar o "como funciona"
          o quanto antes pra tráfego frio — antes de decorar com temas/features.
          Componente HowItWorksCarousel gerencia: vídeo player, auto-advance,
          indicador de progresso clicável, transição entre passos.
          id="how-it-works" usado pelo Header pra rolar até esta seção. */}
      <section id="how-it-works" className="scroll-mt-24 py-24 bg-gradient-to-br from-primary/5 via-[#FFFAFA] to-primary/10">
        <div className="container px-4 md:px-8 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-script text-2xl text-primary mb-2 block"
            >
              Simples e Rápido
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4"
            >
              Como Criar
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg font-light max-w-2xl mx-auto"
            >
              3 passos. Em menos de 3 minutos seu presente está pronto.
            </motion.p>
          </div>

          <HowItWorksCarousel
            steps={HOW_IT_WORKS_STEPS}
            ctaHref="/editor/12-cartas?source=how_it_works_last_step"
            ctaLabel="Criar minhas 12 cartas agora"
            trackingSource="how_it_works"
          />

          {/* RECONVITE À DEMO — fica abaixo do carrossel como segundo caminho.
              Quem completou os 3 passos já tem o CTA principal pro editor dentro do
              próprio carrossel; este é o caminho alternativo "sentir antes de criar". */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground mb-3 italic">
              Ou se prefere sentir a emoção antes de criar:
            </p>
            <Link
              href="/demo/card-collection?source=after_how_it_works"
              onClick={() => analytics.viewDemo('after_how_it_works')}
            >
              <Button
                variant="outline"
                size="lg"
                className="px-8 h-12 text-base rounded-full border-2"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Abrir demo (30s)
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Card Themes Section */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-script text-2xl text-primary mb-2 block"
            >
              12 Temas Especiais
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4"
            >
              Uma carta para cada momento
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg font-light max-w-2xl mx-auto"
            >
              Cartas com temas pré-definidos que você personaliza com suas palavras, fotos e músicas
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CARD_THEMES.map((theme, index) => (
              <motion.div
                key={theme.group}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full border-2 border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                  <div className={`bg-gradient-to-br ${theme.color} p-6 text-center`}>
                    <span className="text-5xl">{theme.emoji}</span>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl text-center">{theme.group}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {theme.cards.map((card, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {index * 4 + i + 1}
                          </div>
                          <span>Abra quando... {card.toLowerCase()}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link href="/editor/12-cartas?source=after_themes">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Escolher os meus 12 temas →
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-script text-2xl text-primary mb-2 block"
            >
              Tudo Incluso
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4"
            >
              O que torna especial
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Abertura Única",
                description: "Cada carta só pode ser aberta uma vez, tornando o momento ainda mais especial e emocionante",
              },
              {
                icon: Calendar,
                title: "12 Temas Pré-definidos",
                description: "Cartas para diferentes momentos: dias difíceis, celebrações, saudade, e muito mais",
              },
              {
                icon: Music,
                title: "Música em Cada Carta",
                description: "Adicione uma música do YouTube para tocar quando a carta for aberta",
              },
              {
                icon: Image,
                title: "Foto Personalizada",
                description: "Inclua uma foto especial em cada carta para tornar a mensagem ainda mais pessoal",
              },
              {
                icon: MessageSquare,
                title: "Mensagens Pré-escritas",
                description: "Templates prontos que você pode personalizar ou escrever do zero",
              },
              {
                icon: Gift,
                title: "Painel do Comprador",
                description: "Acompanhe em tempo real quais cartas foram abertas, edite conteúdo, resete cartas e receba sugestões emocionais",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-2 border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link href="/editor/12-cartas?source=after_features">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Quero criar pro meu amor →
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Buyer Panel Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-[#FFFAFA] to-primary/10">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-script text-2xl text-primary mb-2 block"
            >
              Exclusivo
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4"
            >
              Seu Painel do Comprador
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg font-light max-w-2xl mx-auto"
            >
              Após a compra, você recebe acesso a um painel exclusivo para gerenciar e acompanhar o presente
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                emoji: "📊",
                title: "Acompanhamento em tempo real",
                description: "Veja quais cartas foram abertas, com data e hora exata. Saiba quando a pessoa amada leu sua mensagem.",
              },
              {
                emoji: "💡",
                title: "Sugestões emocionais",
                description: "Receba recomendações baseadas na última carta aberta. Ex: se abriu 'dia difícil', sugerimos conversar e fazer algo divertido juntos.",
              },
              {
                emoji: "✏️",
                title: "Edição a qualquer momento",
                description: "Enquanto nenhuma carta foi aberta, você pode editar títulos e mensagens diretamente pelo painel, sem complicação.",
              },
              {
                emoji: "🔄",
                title: "Reset de cartas",
                description: "Quer que a pessoa viva o momento de novo? Resete cartas já abertas para que possam ser abertas novamente.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-primary/10 p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <span className="text-3xl mb-3 block">{item.emoji}</span>
                <h3 className="text-lg font-bold text-text-main mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground mb-6">
              Tudo isso incluso no preço — sem assinatura, sem custo extra.
            </p>
            <Link href="/editor/12-cartas?source=after_buyer_panel">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Criar e gerenciar pelo painel →
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-[#FFFAFA] to-primary/10">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-script text-2xl text-primary mb-2 block"
            >
              Histórias Reais
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4"
            >
              O que dizem sobre nós
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Fernanda Lima",
                text: "Dei de presente pro meu namorado e ele chorou em cada carta que abriu. A ideia de só poder abrir uma vez deixou tudo mais especial!",
                bgColor: "#E8B4B8",
              },
              {
                name: "Ricardo Santos",
                text: "Minha esposa amou! Ela guarda as cartas para abrir nos momentos certos. Já faz 6 meses e ela ainda tem cartas para abrir.",
                bgColor: "#B4D4E8",
              },
              {
                name: "Amanda Costa",
                text: "Presente perfeito para quem está em relacionamento à distância. As cartas ajudam nos momentos difíceis de saudade.",
                bgColor: "#D4B4E8",
              },
            ].map((testimonial, index) => {
              // Inicial do nome — substitui avatar fake do pravatar.cc.
              // Mais honesto e mantém visual limpo.
              const initial = testimonial.name.trim().charAt(0).toUpperCase();
              return (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-primary/10 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg font-bold text-white"
                          style={{ backgroundColor: testimonial.bgColor }}
                          aria-hidden="true"
                        >
                          {initial}
                        </div>
                        <div>
                          <CardTitle className="text-base">{testimonial.name}</CardTitle>
                          <div className="flex gap-0.5 mt-1" aria-label="5 estrelas">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Trust indicators verificáveis — substituíram stats inflados
              ("800+ / 4.9 / 9.600+") que não tinham fonte. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-primary/10">
              <div className="h-12 flex items-center justify-center mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_MERCADO_PAGO}
                  alt="Mercado Pago"
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-sm font-bold text-text-main">Pagamento seguro</p>
              <p className="text-xs text-muted-foreground mt-1">via Mercado Pago</p>
            </div>
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-primary/10">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-blue-600" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-text-main">Entrega imediata</p>
              <p className="text-xs text-muted-foreground mt-1">Link no seu email</p>
            </div>
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-primary/10">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-amber-700" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-text-main">Sem assinatura</p>
              <p className="text-xs text-muted-foreground mt-1">Pagamento único</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link href="/editor/12-cartas?source=after_testimonials">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Quero emocionar quem amo →
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* RECONVITE À DEMO — segundo ponto, antes do pricing.
          Pega quem ainda está em dúvida e quer testar antes de ver o preço. */}
      <section className="py-12 bg-gradient-to-r from-primary/10 via-[#FFFAFA] to-primary/10 border-y border-primary/10">
        <div className="container px-4 md:px-8 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-lg md:text-xl font-serif text-text-main">
              Ainda em dúvida? Sente como vai ser primeiro.
            </p>
            <Link
              href="/demo/card-collection?source=before_pricing"
              onClick={() => analytics.viewDemo('before_pricing')}
            >
              <Button
                size="lg"
                variant="outline"
                className="px-8 h-12 text-base rounded-full border-2"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Abrir uma carta agora — demo grátis
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Sem cadastro, sem compromisso. Volta pra cá depois 😊
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-script text-2xl text-primary mb-2 block"
            >
              Investimento
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4"
            >
              12 momentos por um preço especial
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
              <div className="bg-primary p-1">
                <div className="bg-white p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <div className="inline-flex flex-col items-start gap-2 mb-4">
                        <Badge className="bg-primary text-white">
                          <Sparkles className="w-3 h-3 mr-1" />
                          40% OFF — Dia dos Namorados
                        </Badge>
                        <p className="text-xs font-medium text-red-600 inline-flex items-center gap-1">
                          ⏳ Promoção válida até 12/06
                        </p>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-2">
                        12 Cartas Completas
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Uma jornada emocional inesquecível
                      </p>

                      <ul className="space-y-3 text-left">
                        {[
                          "12 cartas personalizáveis",
                          "Foto e música em cada carta",
                          "Abertura única por carta",
                          "Templates pré-escritos",
                          "QR Code exclusivo",
                          "Acesso ilimitado e permanente",
                        ].map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-text-main">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-center">
                      <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
                        {cardCollectionPrice?.priceFromFormatted && (
                          <p className="text-sm text-muted-foreground line-through mb-1">De {cardCollectionPrice.priceFromFormatted}</p>
                        )}
                        <p className="text-5xl font-bold text-primary mb-1">{cardCollectionPrice?.priceFormatted || 'R$ 29,90'}</p>
                        <p className="text-sm text-muted-foreground mb-6">Pagamento único</p>
                        <Link href="/editor/12-cartas?source=pricing">
                          <Button
                            size="lg"
                            className="w-full px-8 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
                          >
                            💌 Criar minhas 12 cartas agora
                          </Button>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-400" />
                          Teste grátis antes de pagar
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* SUPORTE WHATSAPP — após pricing, pega quem tem dúvida sobre preço/produto */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 text-center space-y-3"
          >
            <p className="text-sm text-muted-foreground">
              Alguma dúvida antes de comprar?
            </p>
            <div className="flex justify-center">
              <WhatsAppSupportButton source="after_pricing" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-[#FFFAFA] to-primary/10">
        <div className="container px-4 md:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-script text-2xl text-primary mb-2 block"
            >
              Dúvidas?
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4"
            >
              Perguntas Frequentes
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {/* Objeções de tráfego frio (Meta Ads) — perguntas que aparecem
                ANTES das técnicas pra capturar quem ainda está decidindo se compra. */}
            <FAQItem
              question="É confiável? Como sei que vou receber?"
              answer="O pagamento é processado pelo Mercado Pago (mesma plataforma do iFood, Mercado Livre, OLX). Assim que a confirmação chega, o link das suas 12 cartas + acesso ao painel cai automaticamente no email que você cadastrou — costuma demorar menos de 1 minuto. Se algo der errado, você fala com a equipe direto pelo WhatsApp e a gente resolve."
            />
            <FAQItem
              question="E se eu não souber escrever uma mensagem bonita?"
              answer="A gente cuidou disso. Quando você cria as 12 cartas, uma IA já escreve cada mensagem com base no nome da pessoa e no tipo de momento (carta pra dia difícil, pra conquista, pra saudade, etc). Você só ajusta o que quiser — pode trocar uma palavra, uma frase inteira, ou deixar como tá. A maioria dos clientes muda só uma ou duas cartas."
            />
            <FAQItem
              question="Quanto tempo leva pra criar?"
              answer="3 a 5 minutos. O editor tem 5 passos rápidos: nomes, cartas (IA já gera), capa+música+mensagem de abertura, prévia, pagamento. Você pode fazer tudo no celular. Se quiser personalizar mais as 12 cartas, leva uns 15 minutos."
            />
            <FAQItem
              question="Tem que pagar todo mês? Pode cancelar?"
              answer="Não tem mensalidade — você paga uma única vez R$ 29,90 e as cartas ficam ativas pra sempre. Sem cobrança recorrente, sem fidelidade, sem letra miúda. Se quiser editar ou resetar cartas no futuro, dá pra fazer direto pelo seu painel, sem custo."
            />
            <FAQItem
              question="O que significa 'abertura única'? Ela só vê uma vez?"
              answer="Não! A 'abertura única' é só o momento mágico da primeira vez — quando ela clica e a carta abre com animação, foto, música e mensagem. Depois disso, a carta fica disponível pra ela revisitar quantas vezes quiser, sempre que sentir saudade, precisar de força, ou só quiser reler. A magia abre 1 vez, a lembrança fica pra sempre 💛"
            />
            <FAQItem
              question="Vocês que escrevem as cartas ou eu?"
              answer="Você que escreve — afinal, é o seu sentimento que torna o presente especial. Mas a gente facilita demais: nossa IA já sugere uma mensagem pra cada uma das 12 cartas, baseada no nome dela/dele e no tema da carta (carta pra dia difícil, pra comemorar, pra saudade...). Você lê, ajusta o que quiser (uma palavra, uma frase, ou reescreve do zero), ou deixa como tá. A maioria dos clientes muda só 2 ou 3 cartas."
            />
            <FAQItem
              question="Vem tudo automático depois do pagamento?"
              answer="Sim, 100% automático! Assim que o pagamento é confirmado (PIX cai em segundos), você recebe no email cadastrado: link das suas 12 cartas + QR Code pra imprimir + acesso ao seu painel pra acompanhar quando cada carta é aberta. Você pode enviar pra pessoa na mesma hora — sem espera, sem frete, sem cobrança recorrente."
            />
            <FAQItem
              question="Posso personalizar os temas das cartas?"
              answer="Sim! Cada carta vem com um tema sugerido (como 'Abra quando estiver tendo um dia difícil'), mas você pode editar o título e escrever sua própria mensagem. Os templates são apenas sugestões para te ajudar."
            />
            <FAQItem
              question="Como funciona a música em cada carta?"
              answer="Você pode adicionar um link do YouTube para cada carta. Quando a pessoa abrir a carta, a música começa a tocar automaticamente, criando uma experiência ainda mais emocionante."
            />
            <FAQItem
              question="Preciso criar todas as 12 cartas de uma vez?"
              answer="Não! Você pode salvar seu progresso e continuar depois. Suas cartas ficam salvas automaticamente enquanto você edita. Só finalize quando todas estiverem prontas."
            />
            <FAQItem
              question="Como a pessoa recebe as cartas?"
              answer="Após o pagamento, você acessa seu painel exclusivo com link, QR Code e sugestões de entrega. Pode enviar por WhatsApp com uma mensagem pronta, imprimir o QR Code para dar junto com um presente físico, ou simplesmente copiar o link. Pelo painel você também acompanha em tempo real quais cartas foram abertas."
            />
            <FAQItem
              question="O link expira? Ela pode reler as cartas depois?"
              answer="O link nunca expira — fica ativo pra sempre. E sim, ela pode reler todas as cartas já abertas quantas vezes quiser: é só entrar no link/QR e clicar nas cartas. Você também pode acessar seu painel a qualquer momento pra acompanhar quando ela abre cada uma, editar (cartas que ainda não foram abertas) ou resetar pra ela poder viver a magia da primeira abertura de novo."
            />
          </motion.div>

          {/* SUPORTE WHATSAPP — após FAQ. Pega usuário cuja dúvida não foi resolvida
              pelo conteúdo. Discreto (text-link), não compete com o CTA final. */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">
              Não achou sua resposta?
            </p>
            <WhatsAppSupportButton source="after_faq" variant="text-link" />
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl opacity-10">💌</div>
          <div className="absolute bottom-10 right-10 text-6xl opacity-10">💕</div>
          <div className="absolute top-1/2 left-1/4 text-4xl opacity-5">✨</div>
          <div className="absolute top-1/3 right-1/4 text-4xl opacity-5">🎁</div>
        </div>

        <div className="container px-4 md:px-8 text-center max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-script text-6xl text-primary mb-6 block">12</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-main mb-6">
              Pronto para emocionar?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 font-light max-w-xl mx-auto">
              Crie agora suas 12 cartas e transforme momentos comuns em memórias inesquecíveis.
            </p>
            <Link href="/editor/12-cartas?source=final_cta">
              <Button
                size="lg"
                className="px-14 h-16 text-xl rounded-full shadow-2xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300"
              >
                💌 Vamos emocionar agora
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Teste gratuitamente • Pague só quando estiver satisfeito
            </p>
          </motion.div>
        </div>
      </section>

      <MobileStickyCTA priceFormatted={cardCollectionPrice?.priceFormatted} />
      <FloatingWhatsAppButton />
    </div>
  );
}
