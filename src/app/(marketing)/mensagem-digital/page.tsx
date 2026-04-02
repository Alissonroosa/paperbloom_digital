"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PhoneMockup } from "@/components/ui/PhoneMockup";
import { HeroPreviewContent } from "@/components/ui/HeroPreviewContent";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Heart,
  Music,
  Image,
  MessageSquare,
  QrCode,
  ChevronDown,
  Sparkles,
  Check,
  Play,
  Star,
  Gift,
  Smartphone,
} from "lucide-react";
import { usePrices } from "@/hooks/usePrices";

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

export default function MensagemDigitalLP() {
  const { prices } = usePrices();
  const messagePrice = prices['message'];

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
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">Mais Popular</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-text-main mb-6 leading-tight"
              >
                Uma mensagem que{" "}
                <span className="text-primary italic">toca o coração</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
              >
                Crie uma página exclusiva com foto, música e uma mensagem personalizada.
                A pessoa acessa pelo celular e vive uma experiência emocionante.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/editor/mensagem">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-lg px-10 h-14 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
                  >
                    Criar Minha Mensagem
                  </Button>
                </Link>
                <Link href="/demo/message">
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
                        src={`https://i.pravatar.cc/150?img=${i + 5}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-primary font-semibold">+1.600 mensagens criadas</p>
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
                    Preview: É assim que eles vão ver
                  </div>
                </div>

                <PhoneMockup className="shadow-2xl shadow-primary/20">
                  <HeroPreviewContent />
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
              Em poucos minutos você cria uma experiência única para quem você ama
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-primary/20 -z-10" />

            {[
              { step: "1", icon: MessageSquare, title: "Escreva", description: "Escreva uma mensagem do coração para quem você ama" },
              { step: "2", icon: Image, title: "Adicione Fotos", description: "Escolha até 7 fotos especiais para a galeria" },
              { step: "3", icon: Music, title: "Escolha a Música", description: "Cole o link de uma música do YouTube que é especial pra vocês" },
              { step: "4", icon: Gift, title: "Presenteie", description: "Receba o QR Code e surpreenda quem você ama" },
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
            <Link href="/editor/mensagem">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Criar Minha Mensagem
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-[#FFFAFA] to-primary/10">
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
                icon: Heart,
                title: "Mensagem Personalizada",
                description: "Escreva uma mensagem única e emocionante para quem você ama. Sem limites de caracteres.",
              },
              {
                icon: Image,
                title: "Galeria com até 7 Fotos",
                description: "Adicione suas fotos favoritas em uma galeria interativa com animações delicadas.",
              },
              {
                icon: Music,
                title: "Trilha Sonora",
                description: "Adicione qualquer música do YouTube para tocar automaticamente quando a pessoa abrir.",
              },
              {
                icon: Smartphone,
                title: "Design Responsivo",
                description: "Funciona em qualquer dispositivo — celular, tablet ou computador — com animações suaves.",
              },
              {
                icon: QrCode,
                title: "QR Code Exclusivo",
                description: "Receba um QR Code em alta qualidade para imprimir em cartões ou enviar digitalmente.",
              },
              {
                icon: Star,
                title: "Acesso Permanente",
                description: "Sua mensagem fica disponível para sempre. A pessoa pode acessar quantas vezes quiser.",
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
            <Link href="/editor/mensagem">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Criar Minha Mensagem
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
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
              O que dizem sobre nós
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Ana Silva",
                text: "Meu namorado chorou quando abriu! A combinação da foto com a música que tocou no nosso primeiro encontro foi perfeita. Nunca vi algo tão especial.",
                avatar: "https://i.pravatar.cc/150?img=10",
              },
              {
                name: "Carlos Mendes",
                text: "Usei no aniversário da minha mãe. Ela não para de mostrar para todo mundo! O QR Code impresso ficou lindo no cartão. Vale cada centavo.",
                avatar: "https://i.pravatar.cc/150?img=12",
              },
              {
                name: "Juliana Costa",
                text: "Criei uma mensagem para cada amiga no casamento. Todas ficaram emocionadas! Super fácil de usar e o resultado é incrível. Recomendo demais!",
                avatar: "https://i.pravatar.cc/150?img=20",
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
                    <p className="text-muted-foreground leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>
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
              <p className="text-3xl md:text-4xl font-bold text-primary">1.600+</p>
              <p className="text-sm text-muted-foreground mt-1">Mensagens Criadas</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">4.91/5</p>
              <p className="text-sm text-muted-foreground mt-1">Avaliação Média</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">98%</p>
              <p className="text-sm text-muted-foreground mt-1">Recomendam</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-[#FFFAFA] to-primary/10">
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
              Um gesto simples, uma emoção enorme
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
                        <Star className="w-3 h-3 mr-1" />
                        Mais Popular
                      </Badge>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-2">
                        Mensagem Digital Completa
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Tudo que você precisa para emocionar
                      </p>

                      <ul className="space-y-3 text-left">
                        {[
                          "Mensagem personalizada sem limites",
                          "Galeria com até 7 fotos",
                          "Música do YouTube sincronizada",
                          "Temas visuais exclusivos",
                          "QR Code em alta qualidade",
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
                        {messagePrice?.priceFromFormatted && (
                          <p className="text-sm text-muted-foreground line-through mb-1">De {messagePrice.priceFromFormatted}</p>
                        )}
                        <p className="text-5xl font-bold text-primary mb-1">{messagePrice?.priceFormatted || 'R$ 19,90'}</p>
                        <p className="text-sm text-muted-foreground mb-6">Pagamento único</p>
                        <Link href="/editor/mensagem">
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
              question="Como funciona a Mensagem Digital?"
              answer="Você cria uma página personalizada com sua mensagem, fotos e uma música do YouTube. Depois, recebe um QR Code único que pode ser impresso ou enviado digitalmente. Quando a pessoa escaneia o QR Code, ela vê sua mensagem especial no celular com animações e a música tocando."
            />
            <FAQItem
              question="Preciso pagar antes de criar?"
              answer="Não! Você pode criar e visualizar sua mensagem completamente grátis. Só paga quando estiver 100% satisfeito e quiser gerar o QR Code final para enviar."
            />
            <FAQItem
              question="Posso usar qualquer música?"
              answer="Sim! Você pode usar qualquer música do YouTube. Basta copiar o link da música e colar no editor. A música vai tocar automaticamente quando a pessoa abrir sua mensagem."
            />
            <FAQItem
              question="Quantas fotos posso adicionar?"
              answer="Você pode adicionar até 7 fotos na galeria da sua mensagem. As fotos aparecem em uma galeria interativa com animações suaves."
            />
            <FAQItem
              question="O QR Code expira?"
              answer="Não! Seu QR Code e mensagem ficam disponíveis para sempre. A pessoa pode acessar quantas vezes quiser, quando quiser."
            />
            <FAQItem
              question="Funciona em qualquer celular?"
              answer="Sim! Funciona em qualquer smartphone (iPhone, Android, etc). Não precisa baixar nenhum aplicativo, basta escanear o QR Code ou acessar o link."
            />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link href="/editor/mensagem">
              <Button
                size="lg"
                className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
              >
                Criar Minha Mensagem
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-primary/5 via-[#FFFAFA] to-primary/10 relative overflow-hidden">
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
            <span className="text-6xl mb-6 block">💌</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-main mb-6">
              Pronto para emocionar?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 font-light max-w-xl mx-auto">
              Crie agora sua mensagem personalizada e surpreenda quem você ama.
            </p>
            <Link href="/editor/mensagem">
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
