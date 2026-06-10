"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PhoneMockup } from "@/components/ui/PhoneMockup";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Users,
  Gift,
  MessageCircle,
  QrCode,
  MapPin,
  CalendarDays,
  ChevronDown,
  Sparkles,
  Check,
  Baby,
  Heart,
  Star,
  ListChecks,
} from "lucide-react";
import { captureUtmsFromUrl } from "@/lib/utm";
import { analytics } from "@/lib/analytics";
import { BABY_SHOWER_THEMES } from "@/config/baby-shower-themes";

const LOGO_WHATSAPP = "https://imagem.paperbloom.com.br/loja/assets/whatsapp.svg";

const SUPPORT_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || "5551992698003";
const SUPPORT_MESSAGE_DEFAULT =
  "Olá! Tenho uma dúvida sobre o Chá de Fralda digital da Paper Bloom.";

function buildSupportWhatsAppUrl(message: string = SUPPORT_MESSAGE_DEFAULT): string {
  return `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`;
}

/** Botão "Falar com a equipe" reutilizável. */
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

/** Sticky CTA mobile — aparece após scroll >25% da página. */
function MobileStickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const ratio = window.scrollY / total;
      setVisible(ratio > 0.25 && ratio < 0.88);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-2 pointer-events-none">
      <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-[rgb(var(--brand)/0.2)] px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <p className="text-[10px] text-muted-foreground leading-tight">100% gratuito</p>
          <p className="text-lg font-bold text-[rgb(var(--brand))] leading-none">Grátis 🍼</p>
        </div>
        <Link href="/editor/cha-de-fralda?source=mobile_sticky_cta" className="flex-1">
          <Button size="sm" className="bg-[rgb(var(--brand))] hover:bg-[rgb(var(--brand)/0.9)] text-white w-full h-11 text-sm rounded-full">
            Criar meu convite
          </Button>
        </Link>
      </div>
    </div>
  );
}

/** Botão flutuante de WhatsApp — aparece após 20s. */
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
      className="fixed bottom-24 md:bottom-4 right-4 z-50 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] h-12 w-12 sm:w-auto sm:px-4 sm:py-3 text-sm font-medium text-white shadow-lg ring-1 ring-black/5 transition-all hover:scale-105 hover:bg-[#1FB855] hover:shadow-xl"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_WHATSAPP} alt="" aria-hidden="true" className="h-5 w-5" style={{ filter: "brightness(0) invert(1)" }} />
      <span className="hidden sm:inline">Tirar dúvida</span>
    </a>
  );
}

/**
 * Mockup do convite (tema Safari) dentro do PhoneMockup do hero.
 * Mostra como o convidado vê: cabeçalho do chá, data/local, e os botões de RSVP.
 * Visual estático com um CTA que leva ao editor.
 */
function InvitePreview() {
  const safari = BABY_SHOWER_THEMES.safari;
  return (
    <div
      className="relative w-full h-full overflow-hidden flex flex-col"
      style={{ background: `linear-gradient(to bottom right, ${safari.pageBgFrom}, ${safari.pageBgVia}, ${safari.pageBgTo})` }}
    >
      {/* Header */}
      <div className="text-center pt-9 pb-2 px-4 flex-shrink-0">
        <div className="flex justify-center gap-1.5 text-2xl mb-1">
          <span>🦁</span>
          <span>🐘</span>
          <span>🦒</span>
          <span>🌿</span>
        </div>
        <p className="font-script text-base leading-tight" style={{ color: safari.script }}>
          Você está convidado para o
        </p>
        <p className="font-serif text-[15px] leading-tight" style={{ color: safari.heading }}>
          Chá de Fralda do Theo
        </p>
      </div>

      {/* Card de evento */}
      <div className="px-3 flex-shrink-0">
        <div
          className="rounded-xl p-3 space-y-2 text-[10px]"
          style={{ backgroundColor: safari.cardBg, border: `1px solid ${safari.cardBorder}` }}
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" style={{ color: safari.accent }} />
            <span style={{ color: safari.body }}>Sábado, 12 de julho · 15h</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: safari.accent }} />
            <span style={{ color: safari.body }}>Salão Jardim — São Paulo</span>
          </div>
        </div>
      </div>

      {/* RSVP */}
      <div className="px-3 pt-3 flex-1 min-h-0">
        <div
          className="rounded-xl p-3"
          style={{ backgroundColor: safari.cardBg, border: `1px solid ${safari.cardBorder}` }}
        >
          <p className="font-serif text-[12px] mb-2" style={{ color: safari.heading }}>
            Confirme sua presença
          </p>
          <div
            className="rounded-lg px-2 py-1.5 text-[9px] mb-2"
            style={{ border: `1px solid ${safari.cardBorder}`, color: safari.body }}
          >
            Seu nome…
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { e: "🎉", l: "Vou" },
              { e: "🤔", l: "Talvez" },
              { e: "💌", l: "Não vou" },
            ].map((o) => (
              <div
                key={o.l}
                className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[8px]"
                style={{ border: `1.5px solid ${safari.accent}`, color: safari.body }}
              >
                <span className="text-sm">{o.e}</span>
                <span>{o.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA dentro do mockup */}
      <div className="px-3 pt-2 pb-3 flex-shrink-0">
        <Link href="/editor/cha-de-fralda?source=hero_mockup_button" onClick={() => analytics.startEditor("baby-shower")} className="block">
          <div
            className="w-full text-white text-center rounded-full py-2 px-3 shadow-md text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
            style={{ backgroundColor: safari.accent }}
          >
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            Criar o meu convite (grátis)
          </div>
        </Link>
        <p className="text-[9px] text-center mt-1" style={{ color: safari.body, opacity: 0.6 }}>
          Sem cartão · pronto em minutos
        </p>
      </div>
    </div>
  );
}

/** FAQ Item */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[rgb(var(--brand)/0.1)] rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[rgb(var(--brand)/0.05)] transition-colors duration-200"
      >
        <span className="font-semibold text-text-main text-lg pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-[rgb(var(--brand))] flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[600px]" : "max-h-0"}`}>
        <div className="px-6 pb-5 text-muted-foreground leading-relaxed">{answer}</div>
      </div>
    </div>
  );
}

// Temas de destaque (visual) — usam os tokens reais do config dos temas.
const THEME_SHOWCASE: { id: keyof typeof BABY_SHOWER_THEMES; tagline: string }[] = [
  { id: "safari", tagline: "Leões, girafas e muita aventura" },
  { id: "ursos", tagline: "Ursinhos fofos e aconchego" },
  { id: "princesa", tagline: "Coroas, castelos e encanto" },
];

export default function ChaDeFraldaLP() {
  useEffect(() => {
    captureUtmsFromUrl();
    analytics.viewProduct("baby-shower");
  }, []);

  return (
    // Paleta PRÓPRIA da LP (verde-água + bege) — neutra para chá de bebê.
    // Definida via CSS vars locais para NÃO alterar o token `primary` global
    // (que continua rosa para o restante da marca Paperbloom). As classes abaixo
    // usam rgb(var(--brand) / alpha) em vez de bg-[rgb(var(--brand))]/text-[rgb(var(--brand))].
    <div
      className="flex flex-col min-h-screen"
      style={
        {
          "--brand": "111 168 160", // #6FA8A0 verde-água
          "--brand-2": "217 160 107", // #D9A06B bege dourado (acento)
        } as React.CSSProperties
      }
    >
      {/* HERO */}
      <section className="relative pt-24 pb-16 md:py-28 overflow-hidden bg-gradient-to-br from-[rgb(var(--brand)/0.05)] via-[#FFFAFA] to-[rgb(var(--brand)/0.1)] flex flex-col items-center justify-center min-h-[90vh]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[rgb(var(--brand)/0.2)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-[rgb(var(--brand-2)/0.2)] rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[rgb(var(--brand)/0.1)] to-[rgb(var(--brand-2)/0.1)] rounded-full blur-[100px]" />
        </div>

        <div className="container px-4 md:px-8 relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Texto */}
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 bg-emerald-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Lançamento gratuito 🍼
              </Badge>

              <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-text-main mb-4 md:mb-5 leading-[1.05]">
                Organize seu chá de fralda{" "}
                <span className="text-[rgb(var(--brand))] italic">em um só link</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Confirmação de presença, lista de presentes com reserva automática e recados dos convidados.
                Sem planilhas, sem grupos confusos — e <strong>de graça</strong>.
              </p>

              <ul className="mb-7 space-y-2 max-w-md mx-auto lg:mx-0">
                <li className="flex items-center gap-2 text-sm md:text-base text-text-main justify-center lg:justify-start">
                  <Users className="w-4 h-4 text-[rgb(var(--brand))] flex-shrink-0" aria-hidden="true" />
                  <span>Os convidados <strong>confirmam presença</strong> com um toque</span>
                </li>
                <li className="flex items-center gap-2 text-sm md:text-base text-text-main justify-center lg:justify-start">
                  <Gift className="w-4 h-4 text-[rgb(var(--brand))] flex-shrink-0" aria-hidden="true" />
                  <span>Lista de fraldas e mimos com <strong>reserva automática</strong> — sem presentes repetidos</span>
                </li>
                <li className="flex items-center gap-2 text-sm md:text-base text-text-main justify-center lg:justify-start">
                  <MessageCircle className="w-4 h-4 text-[rgb(var(--brand))] flex-shrink-0" aria-hidden="true" />
                  <span>Recados carinhosos e um <strong>painel</strong> pra acompanhar tudo</span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
                <Link href="/editor/cha-de-fralda?source=hero_button" onClick={() => analytics.startEditor("baby-shower")} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-[rgb(var(--brand))] hover:bg-[rgb(var(--brand)/0.9)] text-white w-full sm:w-auto text-lg px-10 h-14 rounded-full shadow-xl shadow-[rgb(var(--brand)/0.3)] hover:shadow-[rgb(var(--brand)/0.4)] hover:-translate-y-1 transition-all"
                  >
                    🍼 Criar meu chá de fralda
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                  100% gratuito
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                  Sem cartão de crédito
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
                  Pronto em minutos
                </span>
              </div>
            </div>

            {/* Mockup */}
            <div className="flex-1 relative w-full max-w-[350px] lg:max-w-none flex justify-center">
              <div className="relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[rgb(var(--brand)/0.2)] rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[rgb(var(--brand-2)/0.2)] rounded-full blur-3xl -z-10" />

                <div className="text-center mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center gap-2 text-sm font-medium bg-white/80 backdrop-blur-sm text-[rgb(var(--brand))] px-4 py-2 rounded-full shadow-sm border border-[rgb(var(--brand)/0.1)]"
                  >
                    👀 É assim que seus convidados veem
                  </motion.div>
                </div>

                <PhoneMockup className="shadow-2xl shadow-[rgb(var(--brand)/0.2)]">
                  <InvitePreview />
                </PhoneMockup>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-24 bg-gradient-to-br from-[rgb(var(--brand)/0.05)] via-[#FFFAFA] to-[rgb(var(--brand)/0.1)]">
        <div className="container px-4 md:px-8 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-script text-2xl text-[rgb(var(--brand))] mb-2 block">Simples e Rápido</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">Como Funciona</h2>
            <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto">
              3 passos. Em poucos minutos seu convite está pronto pra compartilhar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "1", icon: Baby, title: "Preencha os dados", desc: "Nome do bebê, data, local e monte a lista de fraldas e mimos. Sugestões já vêm prontas." },
              { n: "2", icon: QrCode, title: "Compartilhe o link", desc: "Envie pelo WhatsApp ou imprima o QR Code. Um único link para todos os convidados." },
              { n: "3", icon: ListChecks, title: "Acompanhe tudo", desc: "Veja confirmações, presentes reservados e recados no seu painel, em tempo real." },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-2 border-[rgb(var(--brand)/0.1)] hover:border-[rgb(var(--brand)/0.3)] hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[rgb(var(--brand))] text-white font-bold flex items-center justify-center">{step.n}</div>
                      <div className="w-12 h-12 rounded-2xl bg-[rgb(var(--brand)/0.1)] flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-[rgb(var(--brand))]" aria-hidden="true" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/editor/cha-de-fralda?source=after_how_it_works" onClick={() => analytics.startEditor("baby-shower")}>
              <Button size="lg" className="bg-[rgb(var(--brand))] hover:bg-[rgb(var(--brand)/0.9)] text-white px-12 h-14 text-lg rounded-full shadow-xl shadow-[rgb(var(--brand)/0.2)] hover:shadow-[rgb(var(--brand)/0.3)] hover:-translate-y-1 transition-all">
                Começar agora — é grátis →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* TEMAS */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-script text-2xl text-[rgb(var(--brand))] mb-2 block">Combine com a festa</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">Temas para o seu chá</h2>
            <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto">
              Escolha um tema e o convite inteiro ganha a cara da sua festa — cores, ícones e clima combinando.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {THEME_SHOWCASE.map((t, index) => {
              const theme = BABY_SHOWER_THEMES[t.id];
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-2 border-[rgb(var(--brand)/0.1)] hover:border-[rgb(var(--brand)/0.3)] hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div
                      className="p-8 text-center"
                      style={{ background: `linear-gradient(to bottom right, ${theme.pageBgFrom}, ${theme.pageBgVia}, ${theme.pageBgTo})` }}
                    >
                      <div className="flex justify-center gap-2 text-4xl mb-2">
                        {theme.decorations.slice(0, 4).map((d, i) => (
                          <span key={i}>{d}</span>
                        ))}
                      </div>
                      <p className="font-serif text-xl" style={{ color: theme.heading }}>{theme.name}</p>
                    </div>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">{t.tagline}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            ✨ Mais temas a caminho. Por enquanto, todos os convites usam o lindo tema Safari.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-gradient-to-br from-[rgb(var(--brand)/0.05)] via-[#FFFAFA] to-[rgb(var(--brand)/0.1)]">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-script text-2xl text-[rgb(var(--brand))] mb-2 block">Tudo incluso</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">O que torna especial</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Confirmação de presença", description: "Cada convidado confirma se vai, talvez ou não vai. Você sabe exatamente quantas pessoas esperar." },
              { icon: Gift, title: "Lista de presentes inteligente", description: "Fraldas por tamanho (RN a XG) e mimos. Cada item reservado some da lista — nada de presentes repetidos." },
              { icon: MessageCircle, title: "Recados carinhosos", description: "Quem não puder ir deixa uma mensagem especial. Quem vai também pode mandar um recado pros pais." },
              { icon: QrCode, title: "QR Code + link", description: "Compartilhe pelo WhatsApp ou imprima o QR Code para deixar no convite físico ou na festa." },
              { icon: ListChecks, title: "Painel completo", description: "Acompanhe confirmações, presentes reservados (e por quem) e recados — tudo atualizado em tempo real." },
              { icon: Heart, title: "Feito com carinho", description: "Visual delicado, fácil de usar no celular, com a identidade da Paper Bloom em cada detalhe." },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-2 border-[rgb(var(--brand)/0.1)] hover:border-[rgb(var(--brand)/0.3)] hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--brand)/0.1)] flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-[rgb(var(--brand))]" />
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

          <div className="mt-16 text-center">
            <Link href="/editor/cha-de-fralda?source=after_features" onClick={() => analytics.startEditor("baby-shower")}>
              <Button size="lg" className="bg-[rgb(var(--brand))] hover:bg-[rgb(var(--brand)/0.9)] text-white px-12 h-14 text-lg rounded-full shadow-xl shadow-[rgb(var(--brand)/0.2)] hover:shadow-[rgb(var(--brand)/0.3)] hover:-translate-y-1 transition-all">
                Quero criar o meu →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* PAINEL DO ORGANIZADOR */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-script text-2xl text-[rgb(var(--brand))] mb-2 block">Exclusivo</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">Seu painel do organizador</h2>
            <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto">
              Depois de criar, você recebe um link privado para acompanhar tudo sobre o seu chá.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { emoji: "✅", title: "Lista de confirmações", description: "Veja em tempo real quem vai, quem talvez e quem não poderá comparecer." },
              { emoji: "🎁", title: "Presentes reservados", description: "Saiba qual presente cada convidado reservou e o que ainda falta na lista." },
              { emoji: "💌", title: "Mural de recados", description: "Todas as mensagens carinhosas dos convidados reunidas em um só lugar." },
              { emoji: "📲", title: "Compartilhamento fácil", description: "Link e QR Code sempre à mão para enviar a novos convidados quando quiser." },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-[rgb(var(--brand)/0.1)] p-6 hover:shadow-lg hover:border-[rgb(var(--brand)/0.3)] transition-all duration-300"
              >
                <span className="text-3xl mb-3 block">{item.emoji}</span>
                <h3 className="text-lg font-bold text-text-main mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-6">Tudo isso sem pagar nada — de graça mesmo.</p>
            <Link href="/editor/cha-de-fralda?source=after_panel" onClick={() => analytics.startEditor("baby-shower")}>
              <Button size="lg" className="bg-[rgb(var(--brand))] hover:bg-[rgb(var(--brand)/0.9)] text-white px-12 h-14 text-lg rounded-full shadow-xl shadow-[rgb(var(--brand)/0.2)] hover:shadow-[rgb(var(--brand)/0.3)] hover:-translate-y-1 transition-all">
                Criar e acompanhar pelo painel →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24 bg-gradient-to-br from-[rgb(var(--brand)/0.05)] via-[#FFFAFA] to-[rgb(var(--brand)/0.1)]">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-script text-2xl text-[rgb(var(--brand))] mb-2 block">Mamães amam</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">O que dizem sobre nós</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Juliana Martins", text: "Organizei o chá da minha filha em 10 minutos. Os convidados adoraram confirmar presença e escolher o presente pelo link!", bgColor: "#E8B4B8" },
              { name: "Patrícia Souza", text: "A lista de presentes foi o melhor — ninguém repetiu tamanho de fralda e eu acompanhei tudo pelo painel. Recomendo demais.", bgColor: "#B4D4E8" },
              { name: "Carla Nogueira", text: "Mandei o link no grupo da família e pronto. Ganhei os recados mais fofos dos parentes que moram longe. Amei!", bgColor: "#D4B4E8" },
            ].map((t, index) => {
              const initial = t.name.trim().charAt(0).toUpperCase();
              return (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-[rgb(var(--brand)/0.1)] hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg font-bold text-white"
                          style={{ backgroundColor: t.bgColor }}
                          aria-hidden="true"
                        >
                          {initial}
                        </div>
                        <div>
                          <CardTitle className="text-base">{t.name}</CardTitle>
                          <div className="flex gap-0.5 mt-1" aria-label="5 estrelas">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-[rgb(var(--brand)/0.1)]">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-emerald-600" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-text-main">100% gratuito</p>
              <p className="text-xs text-muted-foreground mt-1">Sem cartão de crédito</p>
            </div>
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-[rgb(var(--brand)/0.1)]">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-blue-600" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-text-main">Pronto na hora</p>
              <p className="text-xs text-muted-foreground mt-1">Link e QR no seu email</p>
            </div>
            <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-[rgb(var(--brand)/0.1)]">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-amber-700" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-text-main">Feito com carinho</p>
              <p className="text-xs text-muted-foreground mt-1">Pela Paper Bloom</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-script text-2xl text-[rgb(var(--brand))] mb-2 block">Dúvidas?</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="É grátis mesmo? Tem pegadinha?"
              answer="É grátis de verdade. Você cria o convite, monta a lista de presentes e compartilha com os convidados sem pagar nada e sem precisar de cartão de crédito. É o nosso lançamento — aproveite enquanto está gratuito."
            />
            <FAQItem
              question="Quanto tempo leva pra criar?"
              answer="Poucos minutos. O editor tem passos simples: dados do bebê, detalhes do evento, lista de presentes (já vem com sugestões) e seus dados de contato. Dá pra fazer tudo pelo celular."
            />
            <FAQItem
              question="Como os convidados confirmam presença?"
              answer="Você compartilha um único link (ou QR Code). Ao abrir, o convidado digita o nome, confirma se vai, talvez ou não vai, escolhe um presente da lista e pode deixar um recado. Tudo aparece no seu painel na hora."
            />
            <FAQItem
              question="Como funciona a lista de presentes?"
              answer="Você monta a lista com fraldas (por tamanho, de RN a XG) e mimos como cobertor, kit mamadeira e lenços. Quando um convidado reserva um item, ele some da lista para os outros — evitando presentes repetidos."
            />
            <FAQItem
              question="O convidado precisa pagar o presente?"
              answer="Não. No momento o convidado apenas reserva o presente que vai levar — a compra fica por conta dele. Em breve traremos a opção de presentear online, mas hoje é tudo sem pagamento."
            />
            <FAQItem
              question="Onde fica a lista de confirmações e recados?"
              answer="No seu painel privado, que você recebe por email assim que cria o convite. Lá você vê quem confirmou, quais presentes foram reservados e todos os recados — atualizado em tempo real."
            />
            <FAQItem
              question="Posso usar em qualquer chá de bebê?"
              answer="Sim! Serve para chá de fralda, chá de bebê e chá-revelação com lista de presentes. Você personaliza o nome do bebê, a data, o local e os itens da lista do jeito que quiser."
            />
            <FAQItem
              question="O link expira?"
              answer="Não. O convite e o painel ficam disponíveis para você e seus convidados acessarem quantas vezes quiserem."
            />
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-2">Não achou sua resposta?</p>
            <WhatsAppSupportButton source="after_faq" variant="text-link" />
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 bg-gradient-to-br from-[rgb(var(--brand)/0.05)] via-[#FFFAFA] to-[rgb(var(--brand)/0.1)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl opacity-10">🍼</div>
          <div className="absolute bottom-10 right-10 text-6xl opacity-10">🧸</div>
          <div className="absolute top-1/2 left-1/4 text-4xl opacity-5">🦁</div>
          <div className="absolute top-1/3 right-1/4 text-4xl opacity-5">🌿</div>
        </div>

        <div className="container px-4 md:px-8 text-center max-w-3xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="font-script text-5xl text-[rgb(var(--brand))] mb-6 block">🍼</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-main mb-6">Pronta para organizar?</h2>
            <p className="text-xl text-muted-foreground mb-10 font-light max-w-xl mx-auto">
              Crie agora o convite do seu chá de fralda e deixe tudo organizado em um só link — de graça.
            </p>
            <Link href="/editor/cha-de-fralda?source=final_cta" onClick={() => analytics.startEditor("baby-shower")}>
              <Button size="lg" className="bg-[rgb(var(--brand))] hover:bg-[rgb(var(--brand)/0.9)] text-white px-14 h-16 text-xl rounded-full shadow-2xl shadow-[rgb(var(--brand)/0.2)] hover:shadow-[rgb(var(--brand)/0.3)] hover:-translate-y-1 transition-all duration-300">
                🍼 Criar meu chá de fralda grátis
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              100% gratuito · sem cartão de crédito
            </p>
          </motion.div>
        </div>
      </section>

      <MobileStickyCTA />
      <FloatingWhatsAppButton />
    </div>
  );
}
