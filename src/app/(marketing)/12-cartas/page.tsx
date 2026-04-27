"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { usePrices } from "@/hooks/usePrices";

// Demo card data
const DEMO_CARDS = [
  { order: 1, title: "Abra quando... estiver tendo um dia difícil", emoji: "💪", color: "#E8B4B8" },
  { order: 2, title: "Abra quando... estiver se sentindo inseguro(a)", emoji: "🌟", color: "#B4D4E8" },
  { order: 3, title: "Abra quando... estivermos longe um do outro", emoji: "🌍", color: "#E8D4B4" },
  { order: 4, title: "Abra quando... estiver estressado(a)", emoji: "🧘", color: "#D4E8B4" },
];

function DemoPreview() {
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

  return (
    <div className="border border-primary/10 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
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
          isOpen ? "max-h-96" : "max-h-0"
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
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-primary/5 via-[#FFFAFA] to-primary/10 flex flex-col items-center justify-center min-h-[90vh]">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-[100px]" />
        </div>

        <div className="container px-4 md:px-8 relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Column: Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20 shadow-sm mb-6"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">12 Momentos Únicos</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-text-main mb-6 leading-tight"
              >
                12 cartas para{" "}
                <span className="text-primary italic">12 momentos especiais</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
              >
                Uma jornada emocional única. Cada carta só pode ser aberta uma vez, criando momentos
                inesquecíveis ao longo do ano. Foto, música e mensagem em cada uma.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/editor/12-cartas">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-lg px-10 h-14 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
                  >
                    Criar Minhas 12 Cartas
                  </Button>
                </Link>
                <Link href="/demo/card-collection">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-lg px-8 h-14 rounded-full border-2"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Ver Demo
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground/80"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="font-script text-lg">Teste gratuitamente antes de pagar</span>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex items-center justify-center lg:justify-start gap-3"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-primary/10 border-2 border-white shadow-md overflow-hidden"
                    >
                      <img
                        src={`https://i.pravatar.cc/150?img=${i + 10}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-primary font-semibold">+800 coleções criadas</p>
                  <p className="text-xs text-muted-foreground">Pessoas já emocionaram quem amam</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Phone Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex-1 relative w-full max-w-[350px] lg:max-w-none flex justify-center"
            >
              <div className="relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -z-10" />

                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-text-main/60 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
                    <Play className="w-4 h-4 text-primary" />
                    Interaja com a demo
                  </div>
                </div>

                <PhoneMockup className="shadow-2xl shadow-primary/20">
                  <DemoPreview />
                </PhoneMockup>
              </div>
            </motion.div>
          </div>
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
            <Link href="/editor/12-cartas">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Começar Agora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-[#FFFAFA] to-primary/10">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
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
              Como Funciona
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-primary/20 -z-10" />

            {[
              { step: "1", icon: Heart, title: "Personalize", description: "Adicione os nomes de quem envia e recebe" },
              { step: "2", icon: MessageSquare, title: "Escreva", description: "Personalize cada uma das 12 cartas com suas palavras" },
              { step: "3", icon: Image, title: "Adicione Mídia", description: "Inclua fotos e músicas do YouTube em cada carta" },
              { step: "4", icon: Gift, title: "Presenteie", description: "Acesse seu painel com link, QR Code e opções de envio por WhatsApp" },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center -mt-6 mb-4 relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-text-main mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
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
            <Link href="/editor/12-cartas">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Criar Minhas 12 Cartas
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
            <Link href="/editor/12-cartas">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Criar Minhas 12 Cartas
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
            <Link href="/editor/12-cartas">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Criar Minhas 12 Cartas
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
                avatar: "https://i.pravatar.cc/150?img=5",
              },
              {
                name: "Ricardo Santos",
                text: "Minha esposa amou! Ela guarda as cartas para abrir nos momentos certos. Já faz 6 meses e ela ainda tem cartas para abrir.",
                avatar: "https://i.pravatar.cc/150?img=8",
              },
              {
                name: "Amanda Costa",
                text: "Presente perfeito para quem está em relacionamento à distância. As cartas ajudam nos momentos difíceis de saudade.",
                avatar: "https://i.pravatar.cc/150?img=9",
              },
            ].map((testimonial, index) => (
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
                      <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden">
                        <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{testimonial.name}</CardTitle>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed italic">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center"
          >
            <div className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">800+</p>
              <p className="text-sm text-muted-foreground mt-1">Coleções Criadas</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">4.9/5</p>
              <p className="text-sm text-muted-foreground mt-1">Avaliação Média</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">9.600+</p>
              <p className="text-sm text-muted-foreground mt-1">Cartas Abertas</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link href="/editor/12-cartas">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Criar Minhas 12 Cartas
              </Button>
            </Link>
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
                      <Badge className="mb-4 bg-primary text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        40% OFF
                      </Badge>
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
                        <Link href="/editor/12-cartas">
                          <Button
                            size="lg"
                            className="w-full px-8 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
                          >
                            Criar Agora
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
            <FAQItem
              question="O que significa 'abertura única'?"
              answer="Cada uma das 12 cartas só pode ser aberta uma única vez. Quando a pessoa clica para abrir, aparece uma confirmação perguntando se ela tem certeza. Depois de aberta, a carta fica marcada como 'aberta' e o conteúdo fica disponível para sempre, mas o momento mágico da primeira abertura é único."
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
              question="O link expira?"
              answer="Não! O link e as cartas ficam disponíveis para sempre. A pessoa pode acessar quantas vezes quiser para reler as cartas já abertas. Você também pode acessar seu painel a qualquer momento para acompanhar, editar e resetar cartas."
            />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link href="/editor/12-cartas">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Criar Minhas 12 Cartas
              </Button>
            </Link>
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
            <Link href="/editor/12-cartas">
              <Button
                size="lg"
                className="px-14 h-16 text-xl rounded-full shadow-2xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300"
              >
                Começar Agora
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Teste gratuitamente • Pague só quando estiver satisfeito
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
