"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PhoneMockup } from "@/components/ui/PhoneMockup";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Baby,
  Users,
  QrCode,
  Share2,
  ChevronDown,
  Sparkles,
  Heart,
  Check,
  Play,
  MessageCircle,
  BarChart3,
  Camera,
} from "lucide-react";
import { usePrices } from "@/hooks/usePrices";

// Demo stages for the phone mockup
type DemoStage = "intro" | "vote" | "countdown" | "reveal";

function DemoPreview() {
  const [stage, setStage] = useState<DemoStage>("intro");
  const [vote, setVote] = useState<"menino" | "menina" | null>(null);
  const [countdown, setCountdown] = useState(3);

  const handleVote = (v: "menino" | "menina") => {
    setVote(v);
    setStage("countdown");
    let c = 3;
    const interval = setInterval(() => {
      c--;
      setCountdown(c);
      if (c === 0) {
        clearInterval(interval);
        setStage("reveal");
      }
    }, 1000);
  };

  const reset = () => {
    setStage("intro");
    setVote(null);
    setCountdown(3);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-pink-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full px-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="text-5xl mb-4"
            >
              🧸
            </motion.div>
            <h2 className="font-serif text-xl text-gray-800 mb-2">
              Oii, eu sou... ops!
            </h2>
            <p className="text-xs text-gray-600 mb-4 px-2">
              Ainda é segredo! Mas daqui a pouco você descobre 🤫
            </p>
            <Button
              size="sm"
              onClick={() => setStage("vote")}
              className="bg-gradient-to-r from-blue-500 to-pink-500 text-white text-xs px-6"
            >
              Continuar →
            </Button>
          </motion.div>
        )}

        {stage === "vote" && (
          <motion.div
            key="vote"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full px-4 text-center"
          >
            <h2 className="font-serif text-lg text-gray-800 mb-4">
              Menino ou menina?
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => handleVote("menino")}
                className="flex flex-col items-center p-3 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                  <span className="text-2xl">💙</span>
                </div>
                <span className="text-xs font-medium text-gray-700">Menino</span>
              </button>
              <button
                onClick={() => handleVote("menina")}
                className="flex flex-col items-center p-3 rounded-xl border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-1">
                  <span className="text-2xl">💖</span>
                </div>
                <span className="text-xs font-medium text-gray-700">Menina</span>
              </button>
            </div>
          </motion.div>
        )}

        {stage === "countdown" && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full"
          >
            <p className="text-sm text-gray-600 mb-4">Estou chegando...</p>
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center"
            >
              <span className="text-4xl font-bold text-white">{countdown}</span>
            </motion.div>
          </motion.div>
        )}

        {stage === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full px-4 text-center relative overflow-hidden"
            style={{ backgroundColor: "#FDE8F0" }}
          >
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-sm"
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: i % 2 === 0 ? "#E6A0B8" : "#F5C4D8",
                  }}
                  animate={{
                    y: ["-10%", "110%"],
                    rotate: [0, 360],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 8 }}
              className="text-6xl mb-3 relative z-10"
            >
              💖
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-serif text-xl text-[#8B4563] mb-1 relative z-10"
            >
              É uma menina!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-serif text-3xl text-[#E6A0B8] italic relative z-10"
            >
              Helena
            </motion.p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={reset}
              className="mt-4 text-xs text-[#8B4563] underline relative z-10"
            >
              Ver novamente
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
        <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function RevelacaoVirtualLP() {
  const { prices } = usePrices();
  const genderRevealPrice = prices['gender-reveal'];
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-blue-50 via-[#FFFAFA] to-pink-50 flex flex-col items-center justify-center min-h-[90vh]">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/20 to-pink-100/20 rounded-full blur-[100px]" />
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
                <Baby className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-gray-700">Revelação de Sexo Digital</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-text-main mb-6 leading-tight"
              >
                Transforme a revelação do seu bebê em um{" "}
                <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent italic">
                  momento mágico
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
              >
                Crie uma experiência interativa e emocionante para revelar o sexo do bebê.
                Seus convidados votam, acompanham a contagem e descobrem juntos!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/editor/revelacao-virtual">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-lg px-10 h-14 rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white"
                  >
                    Criar Minha Revelação
                  </Button>
                </Link>
                <Link href="/demo/revelacao-virtual">
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
                <span className="font-script text-lg">Veja a demonstração antes de criar a sua</span>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex items-center justify-center lg:justify-start gap-3"
              >
                <div className="flex -space-x-2">
                  {["💙", "💖", "💙", "💖"].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-sm"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-primary font-semibold">+500 revelações criadas</p>
                  <p className="text-xs text-muted-foreground">Famílias já celebraram conosco</p>
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
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/40 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-200/40 rounded-full blur-3xl -z-10" />

                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-text-main/60 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
                    <Play className="w-4 h-4 text-pink-500" />
                    Interaja com a demo
                  </div>
                </div>

                <PhoneMockup className="shadow-2xl">
                  <DemoPreview />
                </PhoneMockup>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white">
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
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg font-light max-w-2xl mx-auto"
            >
              Em poucos minutos você cria uma experiência única para compartilhar com família e amigos
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-200 via-pink-200 to-blue-200 -z-10" />

            {[
              {
                step: "1",
                icon: Baby,
                title: "Dados do Bebê",
                description: "Informe os nomes escolhidos e o sexo real (só você sabe!)",
                color: "blue",
              },
              {
                step: "2",
                icon: Users,
                title: "Papai e Mamãe",
                description: "Adicione os nomes dos pais e uma mensagem especial",
                color: "pink",
              },
              {
                step: "3",
                icon: Camera,
                title: "Fotos",
                description: "Envie fotos da gestação para deixar ainda mais especial",
                color: "blue",
              },
              {
                step: "4",
                icon: Share2,
                title: "Compartilhe",
                description: "Receba o link e QR Code para enviar aos convidados",
                color: "pink",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div
                  className={`w-20 h-20 rounded-full bg-white border-2 ${
                    item.color === "blue" ? "border-blue-200" : "border-pink-200"
                  } flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}
                >
                  <item.icon
                    className={`w-8 h-8 ${
                      item.color === "blue" ? "text-blue-500" : "text-pink-500"
                    }`}
                  />
                </div>
                <div
                  className={`w-8 h-8 rounded-full ${
                    item.color === "blue" ? "bg-blue-500" : "bg-pink-500"
                  } text-white font-bold text-sm flex items-center justify-center -mt-6 mb-4 relative z-10`}
                >
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
            <Link href="/editor/revelacao-virtual">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white"
              >
                Começar Agora
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50/50 via-[#FFFAFA] to-pink-50/50">
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
              O que você recebe
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "Votação Interativa",
                description:
                  "Seus convidados podem votar se acham que é menino ou menina antes da revelação",
                color: "blue",
              },
              {
                icon: BarChart3,
                title: "Dashboard de Votos",
                description:
                  "Acompanhe em tempo real quantas pessoas votaram e qual o palpite mais popular",
                color: "pink",
              },
              {
                icon: QrCode,
                title: "QR Code Exclusivo",
                description:
                  "Receba um QR Code para imprimir e usar na decoração do chá revelação",
                color: "blue",
              },
              {
                icon: Camera,
                title: "Galeria de Fotos",
                description:
                  "Adicione até 5 fotos da gestação para criar uma experiência ainda mais especial",
                color: "pink",
              },
              {
                icon: Heart,
                title: "Mensagens dos Convidados",
                description:
                  "Receba mensagens carinhosas dos convidados após a revelação",
                color: "blue",
              },
              {
                icon: Share2,
                title: "Compartilhamento Fácil",
                description:
                  "Compartilhe via WhatsApp, Instagram ou qualquer rede social com um clique",
                color: "pink",
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
                    <div
                      className={`w-14 h-14 rounded-2xl ${
                        feature.color === "blue" ? "bg-blue-100" : "bg-pink-100"
                      } flex items-center justify-center mb-4`}
                    >
                      <feature.icon
                        className={`w-7 h-7 ${
                          feature.color === "blue" ? "text-blue-500" : "text-pink-500"
                        }`}
                      />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
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
            <Link href="/editor/revelacao-virtual">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white"
              >
                Criar Minha Revelação
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Authority / Testimonials Section */}
      <section className="py-24 bg-white">
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
              Famílias que já celebraram
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Mariana & Pedro",
                baby: "Miguel 💙",
                text: "Foi incrível! Nossos convidados adoraram votar e a contagem regressiva deixou todo mundo ansioso. A revelação foi emocionante!",
                avatar: "https://i.pravatar.cc/150?img=32",
              },
              {
                name: "Juliana & Rafael",
                baby: "Helena 💖",
                text: "Usamos no nosso chá revelação e foi um sucesso! O QR Code na decoração ficou lindo e todos conseguiram participar facilmente.",
                avatar: "https://i.pravatar.cc/150?img=25",
              },
              {
                name: "Camila & Lucas",
                baby: "Arthur 💙",
                text: "Mesmo com a família longe, todos puderam participar da revelação pelo celular. As mensagens que recebemos foram muito especiais!",
                avatar: "https://i.pravatar.cc/150?img=44",
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
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">{testimonial.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{testimonial.baby}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">
                          ★
                        </span>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{testimonial.text}"
                    </p>
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
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                500+
              </p>
              <p className="text-sm text-muted-foreground mt-1">Revelações Criadas</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                4.9/5
              </p>
              <p className="text-sm text-muted-foreground mt-1">Avaliação Média</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                10k+
              </p>
              <p className="text-sm text-muted-foreground mt-1">Votos Registrados</p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link href="/editor/revelacao-virtual">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white"
              >
                Criar Minha Revelação
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50/50 via-[#FFFAFA] to-pink-50/50">
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
              Um momento único merece ser especial
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-pink-500 p-1">
                <div className="bg-white p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-pink-500 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Oferta Especial
                      </Badge>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-2">
                        Revelação Virtual Completa
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Tudo que você precisa para uma revelação inesquecível
                      </p>

                      <ul className="space-y-3 text-left">
                        {[
                          "Página personalizada exclusiva",
                          "Sistema de votação interativo",
                          "Dashboard com estatísticas",
                          "Galeria com até 5 fotos",
                          "QR Code para impressão",
                          "Mensagens dos convidados",
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
                      <div className="bg-gradient-to-br from-blue-50 to-pink-50 rounded-2xl p-8 border border-primary/10">
                        {genderRevealPrice?.priceFromFormatted && (
                          <p className="text-sm text-muted-foreground line-through mb-1">
                            De {genderRevealPrice.priceFromFormatted}
                          </p>
                        )}
                        <p className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent mb-1">
                          {genderRevealPrice?.priceFormatted || 'R$ 19,90'}
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                          Pagamento único
                        </p>
                        <Link href="/editor/revelacao-virtual">
                          <Button
                            size="lg"
                            className="w-full px-8 h-14 text-lg rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white"
                          >
                            Criar Agora
                          </Button>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-400" />
                          Veja a demonstração antes de criar
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
      <section className="py-24 bg-white">
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
              question="Como funciona a revelação virtual?"
              answer="Você cria uma página personalizada com os nomes escolhidos para o bebê (menino e menina), adiciona fotos da gestação e uma mensagem especial. Seus convidados recebem um link ou QR Code, votam no palpite deles, e depois descobrem juntos o sexo do bebê em uma experiência interativa com contagem regressiva e animações."
            />
            <FAQItem
              question="Preciso pagar antes de criar?"
              answer="Você pode ver a demonstração completa para entender como funciona antes de criar a sua. Ao criar sua revelação, você preenche os dados e só paga ao finalizar para receber o link e QR Code exclusivos para compartilhar com seus convidados."
            />
            <FAQItem
              question="Posso usar no chá revelação presencial?"
              answer="Sim! Você pode imprimir o QR Code e usar na decoração do seu chá revelação. Quando os convidados escanearem, eles participam da votação e da revelação pelo celular, criando um momento interativo e emocionante para todos."
            />
            <FAQItem
              question="E se meus convidados estiverem longe?"
              answer="A revelação virtual é perfeita para isso! Você pode compartilhar o link por WhatsApp, Instagram ou qualquer rede social. Seus convidados podem participar de qualquer lugar do mundo, votando e acompanhando a revelação em tempo real."
            />
            <FAQItem
              question="O link expira?"
              answer="Não! Seu link e página ficam disponíveis para sempre. Você e seus convidados podem acessar quantas vezes quiserem para reviver esse momento especial."
            />
            <FAQItem
              question="Posso editar depois de criar?"
              answer="Sim! Antes de finalizar o pagamento, você pode editar todas as informações quantas vezes quiser. Após o pagamento, a página fica fixa para garantir a integridade da experiência."
            />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link href="/editor/revelacao-virtual">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white"
              >
                Criar Minha Revelação
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-blue-100/50 via-[#FFFAFA] to-pink-100/50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl opacity-20">💙</div>
          <div className="absolute bottom-10 right-10 text-6xl opacity-20">💖</div>
          <div className="absolute top-1/2 left-1/4 text-4xl opacity-10">🧸</div>
          <div className="absolute top-1/3 right-1/4 text-4xl opacity-10">🍼</div>
        </div>

        <div className="container px-4 md:px-8 text-center max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-6xl mb-6 block">🧸</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-main mb-6">
              Pronto para revelar?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 font-light max-w-xl mx-auto">
              Crie agora sua revelação virtual e transforme esse momento em uma experiência
              inesquecível para toda a família.
            </p>
            <Link href="/editor/revelacao-virtual">
              <Button
                size="lg"
                className="px-14 h-16 text-xl rounded-full shadow-2xl bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white hover:-translate-y-1 transition-all duration-300"
              >
                Começar Agora
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Veja a demonstração • Crie em minutos
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
