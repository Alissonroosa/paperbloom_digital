"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Sparkles, Eye, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { ProductPreviewSection } from "@/components/ui/ProductPreviewSection"
import { PhoneMockup } from "@/components/ui/PhoneMockup"
import { HeroPreviewContent } from "@/components/ui/HeroPreviewContent"
import { GiftCardPreview } from "@/components/ui/GiftCardPreview"
import { ProductSelector } from "@/components/products/ProductSelector"
import { useState } from "react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-[#FFFAFA] flex flex-col items-center justify-center min-h-[90vh] group">

        {/* Abstract Flower Background (CSS) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 transition-all duration-1000 ease-in-out group-hover:opacity-60">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full blur-[100px] animate-pulse transition-all duration-1000 group-hover:blur-[130px] group-hover:scale-110"
          />
        </div>

        <div className="container px-4 md:px-8 relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left Column: Text Content */}
            <div className="flex-1 text-center lg:text-left">
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
                Transforme Sentimentos <br />
                em <span className="text-primary/90 italic">Mensagens Inesquecíveis</span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
              >
                Crie experiências emocionantes que misturam o físico e o digital.
                Suas fotos e músicas favoritas em mensagens que tocam o coração.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start"
              >
                <Link href="/produtos">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-10 h-14 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1">
                    Criar Minha Mensagem
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="mt-12 flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground/80 font-script text-lg"
              >
                Teste gratuitamente antes de pagar <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>

              {/* Social Proof - Messages Delivered Counter */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="mt-8 flex items-center justify-center lg:justify-start gap-3"
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
                  <p className="text-primary font-semibold text-lg">+1.600 Sentimentos eternizados</p>
                  <p className="text-xs text-muted-foreground">Pessoas já emocionaram quem amam</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Interactive Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="flex-1 relative w-full max-w-[350px] lg:max-w-none flex justify-center"
            >
              <div className="relative">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -z-10" />

                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-text-main/60 bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
                    <Eye className="w-4 h-4 text-primary" />
                    Preview: É assim que eles vão ver no celular
                  </div>
                </div>

                <PhoneMockup className="shadow-2xl shadow-primary/20 border-gray-900">
                  <HeroPreviewContent />
                </PhoneMockup>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <ProductPreviewSection />

      {/* Product Selection Section */}
      <section id="products" className="py-24 bg-white relative">
        <ProductSelector />
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-[#FFFAFA]">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-6">
              Como Funciona
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              Simples, rápido e emocionante.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-primary/20 -z-10" />

            <div className="flex flex-col items-center space-y-6 group">
              <div className="w-24 h-24 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-3xl font-serif shadow-lg group-hover:scale-110 transition-transform duration-300">1</div>
              <h3 className="text-2xl font-bold text-text-main">Personalize</h3>
              <p className="text-muted-foreground leading-relaxed">Escolha sua foto favorita e escreva uma mensagem do coração.</p>
            </div>
            <div className="flex flex-col items-center space-y-6 group">
              <div className="w-24 h-24 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-3xl font-serif shadow-lg group-hover:scale-110 transition-transform duration-300">2</div>
              <h3 className="text-2xl font-bold text-text-main">Adicione Música</h3>
              <p className="text-muted-foreground leading-relaxed">Cole o link daquela música especial do YouTube para tocar junto.</p>
            </div>
            <div className="flex flex-col items-center space-y-6 group">
              <div className="w-24 h-24 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-3xl font-serif shadow-lg group-hover:scale-110 transition-transform duration-300">3</div>
              <h3 className="text-2xl font-bold text-text-main">Presenteie</h3>
              <p className="text-muted-foreground leading-relaxed">Receba um QR Code exclusivo para enviar ou imprimir.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Social Proof */}
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
            {/* Testimonial 1 */}
            <Card className="border-primary/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?img=10" alt="Ana Silva" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Ana Silva</CardTitle>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  "Meu namorado chorou quando abriu! A combinação da foto com a música que tocou no nosso primeiro encontro foi perfeita. Nunca vi algo tão especial."
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-primary/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?img=12" alt="Carlos Mendes" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Carlos Mendes</CardTitle>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  "Usei no aniversário da minha mãe. Ela não para de mostrar para todo mundo! O QR Code impresso ficou lindo no cartão. Vale cada centavo."
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-primary/10 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?img=20" alt="Juliana Costa" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Juliana Costa</CardTitle>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  "Criei uma mensagem para cada amiga no casamento. Todas ficaram emocionadas! Super fácil de usar e o resultado é incrível. Recomendo demais!"
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12 text-center">
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
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
                question="Como funciona o Paper Bloom?"
                answer="É simples! Você cria sua mensagem personalizada com fotos, texto e música. Depois, recebe um QR Code único que pode ser impresso ou enviado digitalmente. Quando a pessoa escaneia o QR Code, ela vê sua mensagem especial no celular dela."
              />
              <FAQItem
                question="Preciso pagar antes de criar?"
                answer="Não! Você pode criar e visualizar sua mensagem completamente grátis. Só pagamos quando você estiver 100% satisfeito e quiser gerar o QR Code final para enviar."
              />
              <FAQItem
                question="Posso usar qualquer música?"
                answer="Sim! Você pode usar qualquer música do YouTube. Basta copiar o link da música e colar no editor. A música vai tocar automaticamente quando a pessoa abrir sua mensagem."
              />
              <FAQItem
                question="O QR Code expira?"
                answer="Não! Seu QR Code e mensagem ficam disponíveis para sempre. A pessoa pode acessar quantas vezes quiser, quando quiser."
              />
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <FAQItem
                question="Como recebo minha página após o pagamento?"
                answer="Após a confirmação do pagamento, você receberá um link e um QR Code por e-mail para acessar sua página personalizada."
              />
              <FAQItem
                question="Como faço para imprimir o QR Code?"
                answer="Depois de criar sua mensagem, você recebe o QR Code em alta qualidade. Pode imprimir em casa, em uma gráfica, ou até mesmo em um cartão especial. Também enviamos por email para facilitar."
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

      {/* CTA */}
      <section className="py-32 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="container px-4 md:px-8 text-center max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-main mb-6">
                Pronto para emocionar?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 font-light max-w-xl mx-auto md:mx-0">
                Crie agora sua mensagem personalizada e surpreenda quem você ama.
                Teste gratuitamente antes de pagar.
              </p>
              <Link href="/produtos">
                <Button size="lg" className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                  Começar Agora
                </Button>
              </Link>
            </div>

            <div className="flex-1 w-full max-w-md">
              <GiftCardPreview />
            </div>
          </div>
        </div>
      </section>
    </div >
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
          className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"
          }`}
      >
        <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  )
}
