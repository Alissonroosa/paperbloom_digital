"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Sparkles, Heart, Calendar, Baby, ChevronDown, Gift, Palette, QrCode, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { GiftCardPreview } from "@/components/ui/GiftCardPreview"
import { ProductSelector } from "@/components/products/ProductSelector"
import { RosePetals } from "@/components/effects/RosePetals"
import { useState } from "react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Generic, brand-focused */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#FFFAFA] flex flex-col items-center justify-center min-h-[85vh] group">
        {/* Rose Petals Effect */}
        <RosePetals />

        {/* Abstract Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 transition-all duration-1000 ease-in-out group-hover:opacity-60">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full blur-[100px] animate-pulse transition-all duration-1000 group-hover:blur-[130px] group-hover:scale-110"
          />
        </div>

        <div className="container px-4 md:px-8 relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="font-script text-4xl md:text-6xl text-primary mb-4 block">
              Paper Bloom
            </span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-text-main mb-6 leading-tight"
          >
            Presentes Digitais <br />
            que <span className="text-primary/90 italic">Emocionam de Verdade</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Crie experiências únicas com fotos, músicas e mensagens personalizadas.
            Mensagens digitais, coleções de cartas ou revelações interativas — escolha o presente perfeito.
          </motion.p>

          {/* Mini product highlights */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            <Link href="/mensagem-digital" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/15 rounded-full px-5 py-2.5 text-sm font-medium text-text-main/80 hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <Heart className="w-4 h-4 text-primary" />
              Mensagem Digital
            </Link>
            <Link href="/12-cartas" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/15 rounded-full px-5 py-2.5 text-sm font-medium text-text-main/80 hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <Calendar className="w-4 h-4 text-primary" />
              12 Cartas
            </Link>
            <Link href="/revelacao-virtual" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/15 rounded-full px-5 py-2.5 text-sm font-medium text-text-main/80 hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <Baby className="w-4 h-4 text-primary" />
              Revelação Virtual
            </Link>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="#products">
              <Button size="lg" className="w-full sm:w-auto text-lg px-10 h-14 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1">
                Escolher Meu Presente
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground/80 font-script text-lg"
          >
            Teste gratuitamente antes de pagar <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-3">
              {[
                "https://i.pravatar.cc/150?img=1",
                "https://i.pravatar.cc/150?img=2",
                "https://i.pravatar.cc/150?img=3",
                "https://i.pravatar.cc/150?img=4",
                "https://i.pravatar.cc/150?img=5"
              ].map((src, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-md">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-primary font-semibold text-lg">+1.600 presentes criados</p>
              <p className="text-xs text-muted-foreground">Pessoas já emocionaram quem amam</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Selection Section - RIGHT AFTER HERO */}
      <section id="products" className="py-24 bg-white relative">
        <ProductSelector />
      </section>

      {/* How it Works - Generic for all products */}
      <section id="how-it-works" className="py-24 bg-[#FFFAFA]">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-6">
              Como Funciona
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              Três passos simples para qualquer presente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-primary/20 -z-10" />

            <div className="flex flex-col items-center space-y-6 group">
              <div className="w-24 h-24 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Palette className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-text-main">Escolha e Personalize</h3>
              <p className="text-muted-foreground leading-relaxed">Selecione o tipo de presente e adicione suas fotos, mensagens e músicas favoritas.</p>
            </div>
            <div className="flex flex-col items-center space-y-6 group">
              <div className="w-24 h-24 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Gift className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-text-main">Visualize e Pague</h3>
              <p className="text-muted-foreground leading-relaxed">Veja o resultado antes de pagar. Só finalize quando estiver 100% satisfeito.</p>
            </div>
            <div className="flex flex-col items-center space-y-6 group">
              <div className="w-24 h-24 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <QrCode className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-text-main">Presenteie</h3>
              <p className="text-muted-foreground leading-relaxed">Receba um QR Code exclusivo para enviar digitalmente ou imprimir em um cartão.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Varied across products */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-6">
              O que dizem sobre nós
            </h2>
            <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto">
              Milhares de pessoas já emocionaram quem amam com Paper Bloom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 - Mensagem Digital */}
            <Card className="border-primary/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?img=10" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Ana Silva</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                      <span className="text-xs text-primary/70 font-medium">Mensagem Digital</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  &ldquo;Meu namorado chorou quando abriu! A combinação da foto com a música que tocou no nosso primeiro encontro foi perfeita. Nunca vi algo tão especial.&rdquo;
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 - 12 Cartas */}
            <Card className="border-primary/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?img=12" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Carlos Mendes</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                      <span className="text-xs text-primary/70 font-medium">12 Cartas</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  &ldquo;Dei as 12 Cartas pra minha esposa no nosso aniversário. Cada mês ela abre uma carta nova e é uma emoção diferente. O presente que dura o ano inteiro!&rdquo;
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 - Revelação Virtual */}
            <Card className="border-primary/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?img=20" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Juliana Costa</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                      <span className="text-xs text-primary/70 font-medium">Revelação Virtual</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  &ldquo;A revelação do sexo do bebê ficou incrível! Todos os convidados votaram pelo celular e a contagem regressiva foi emocionante. Muito melhor que estourar balão!&rdquo;
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12 text-center">
            <div className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">1.600+</p>
              <p className="text-sm text-muted-foreground mt-1">Presentes Criados</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">4.91/5</p>
              <p className="text-sm text-muted-foreground mt-1">Avaliação Média</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">98%</p>
              <p className="text-sm text-muted-foreground mt-1">Recomendam</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Expanded for all products */}
      <section className="py-24 bg-[#FFFAFA]">
        <div className="container px-4 md:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-6">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              Tudo o que você precisa saber sobre Paper Bloom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1 */}
            <div className="space-y-4">
              <FAQItem
                question="O que é o Paper Bloom?"
                answer="Paper Bloom é uma plataforma de presentes digitais personalizados. Você cria experiências únicas com fotos, músicas e mensagens que a pessoa acessa pelo celular através de um QR Code exclusivo. Temos diferentes tipos de presentes: Mensagem Digital, 12 Cartas e Revelação Virtual."
              />
              <FAQItem
                question="Qual a diferença entre Mensagem Digital e 12 Cartas?"
                answer="A Mensagem Digital é uma página única com foto, música e mensagem — perfeita para momentos especiais. Já as 12 Cartas são uma coleção de 12 mensagens que podem ser abertas ao longo do tempo, cada uma com sua própria foto e música. É como um calendário de emoções!"
              />
              <FAQItem
                question="Como funciona a Revelação Virtual?"
                answer="Você cria uma página interativa onde seus convidados podem votar se acham que é menino ou menina. Todos acompanham a votação em tempo real e, no momento certo, a revelação acontece de forma emocionante com animações e a resposta final."
              />
              <FAQItem
                question="Preciso pagar antes de criar?"
                answer="Não! Você pode criar e visualizar seu presente completamente grátis. Só paga quando estiver 100% satisfeito e quiser gerar o QR Code final para enviar."
              />
              <FAQItem
                question="Posso usar qualquer música?"
                answer="Sim! Você pode usar qualquer música do YouTube. Basta copiar o link da música e colar no editor. A música vai tocar automaticamente quando a pessoa abrir seu presente."
              />
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <FAQItem
                question="O QR Code expira?"
                answer="Não! Seu QR Code e presente ficam disponíveis para sempre. A pessoa pode acessar quantas vezes quiser, quando quiser."
              />
              <FAQItem
                question="Como recebo meu presente após o pagamento?"
                answer="Após a confirmação do pagamento, você receberá um link e um QR Code por e-mail para acessar e compartilhar seu presente personalizado."
              />
              <FAQItem
                question="Como faço para imprimir o QR Code?"
                answer="Depois de criar seu presente, você recebe o QR Code em alta qualidade. Pode imprimir em casa, em uma gráfica, ou até mesmo em um cartão especial. Também enviamos por email para facilitar."
              />
              <FAQItem
                question="É seguro? Meus dados estão protegidos?"
                answer="Sim! Usamos criptografia de ponta e servidores seguros. Suas fotos e mensagens são privadas e só podem ser acessadas por quem tem o link único."
              />
              <FAQItem
                question="Funciona em qualquer celular?"
                answer="Sim! Funciona em qualquer smartphone com câmera (iPhone, Android, etc). Não precisa baixar nenhum aplicativo, basta escanear o QR Code."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Generic */}
      <section className="py-32 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="container px-4 md:px-8 text-center max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-main mb-6">
                Pronto para emocionar?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 font-light max-w-xl mx-auto md:mx-0">
                Escolha o presente perfeito e surpreenda quem você ama.
                Teste gratuitamente antes de pagar.
              </p>
              <Link href="#products">
                <Button size="lg" className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                  Escolher Meu Presente
                </Button>
              </Link>
            </div>

            <div className="flex-1 w-full max-w-md">
              <GiftCardPreview />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-primary/10 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-primary/5 transition-colors duration-200"
      >
        <span className="font-semibold text-text-main text-lg pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}
      >
        <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  )
}
