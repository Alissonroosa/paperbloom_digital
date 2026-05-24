"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Sparkles, Heart, Calendar, Baby, ChevronDown, Gift, Palette, QrCode, ArrowRight, ShoppingBag, Download } from "lucide-react"
import { motion } from "framer-motion"
import { GiftCardPreview } from "@/components/ui/GiftCardPreview"
import { RosePetals } from "@/components/effects/RosePetals"
import { useState } from "react"
import { catalogService } from "@/services/CatalogService"

export default function Home() {
  const activeCollection = catalogService.getActiveCollection();
  const lojaProducts = catalogService.getAllProducts().slice(0, 4);

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
            Presentes que <br />
            <span className="text-primary/90 italic">Emocionam de Verdade</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-light"
          >
            Experiências digitais interativas ou presentes personalizados artesanais.
            Escolha o caminho perfeito para emocionar quem você ama.
          </motion.p>

          {/* Chips dos dois universos */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            <Link href="#universos" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/15 rounded-full px-5 py-2.5 text-sm font-medium text-text-main/80 hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <Sparkles className="w-4 h-4 text-primary" />
              Experiências Digitais
            </Link>
            <Link href="#universos" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/15 rounded-full px-5 py-2.5 text-sm font-medium text-text-main/80 hover:border-primary/40 hover:shadow-md transition-all duration-300">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Loja Paper Bloom
            </Link>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="#universos">
              <Button size="lg" className="w-full sm:w-auto text-lg px-10 h-14 rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1">
                Explorar Presentes
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

      {/* Dois Universos — RIGHT AFTER HERO */}
      <section id="universos" className="py-24 bg-white relative">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-script text-3xl md:text-4xl text-primary mb-3 block">
              Dois caminhos
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">
              O presente perfeito, do seu jeito
            </h2>
            <p className="text-muted-foreground text-lg font-light max-w-2xl mx-auto">
              Crie uma experiência online interativa ou encomende um presente personalizado na nossa loja.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            {/* CARD ESQUERDA — Experiências Digitais */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-br from-primary/5 to-transparent rounded-3xl p-6 md:p-8 border-2 border-primary/15 hover:border-primary/30 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/15 rounded-full p-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Experiências Digitais
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-2">
                Crie online, entregue por QR Code ou link
              </h3>
              <p className="text-sm text-muted-foreground mb-6 font-light">
                Experiências interativas com fotos, música e mensagens. Teste antes de pagar e entregue na hora.
              </p>

              {/* 3 cards expandidos das experiências */}
              <div className="flex flex-col gap-3 mb-6 flex-1">
                <Link
                  href="/mensagem-digital"
                  className="flex items-start gap-4 bg-white rounded-xl p-4 border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="bg-primary/10 rounded-xl p-3 group-hover:bg-primary/20 transition-colors shrink-0">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-text-main">Mensagem Digital</p>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                      Uma página inesquecível com foto, mensagem e música que toca quando ela abre.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">7 fotos</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Música YouTube</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">QR Code</span>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/12-cartas"
                  className="flex items-start gap-4 bg-white rounded-xl p-4 border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="bg-primary/10 rounded-xl p-3 group-hover:bg-primary/20 transition-colors shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-text-main">12 Cartas</p>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                      12 mensagens lacradas — uma por mês, com foto e música em cada uma. O presente que dura o ano inteiro.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">12 momentos</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Abertura mensal</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Templates</span>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/revelacao-virtual"
                  className="flex items-start gap-4 bg-white rounded-xl p-4 border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="bg-primary/10 rounded-xl p-3 group-hover:bg-primary/20 transition-colors shrink-0">
                    <Baby className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-text-main">Revelação Virtual</p>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                      Convidados votam menino ou menina pelo celular. Dashboard ao vivo e revelação animada no grande momento.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Votação ao vivo</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">5 fotos</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Mensagens</span>
                    </div>
                  </div>
                </Link>
              </div>

              <Link href="/experiencias">
                <Button variant="primary" size="lg" className="w-full">
                  Ver todas as experiências
                </Button>
              </Link>
            </motion.div>

            {/* CARD DIREITA — Loja Paper Bloom */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-br from-primary/5 to-transparent rounded-3xl p-6 md:p-8 border-2 border-primary/15 hover:border-primary/30 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/15 rounded-full p-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Loja Paper Bloom
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-2">
                Presentes físicos + artes digitais
              </h3>
              <p className="text-sm text-muted-foreground mb-6 font-light">
                Produtos artesanais personalizados pelo WhatsApp ou artes digitais para imprimir em casa.
              </p>

              {/* Preview de produtos da loja */}
              {lojaProducts.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-6 flex-1">
                  {lojaProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/loja/${product.slug}`}
                      className="group block bg-white rounded-xl overflow-hidden border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="relative aspect-[4/3] bg-[#FFFAFA]">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 1024px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-script text-3xl text-primary/40">🌸</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-text-main truncate">{product.title}</p>
                        {product.physical?.priceFormatted && (
                          <p className="text-xs text-muted-foreground">{product.physical.priceFormatted}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Banner coleção ativa */}
              {activeCollection && (
                <Link
                  href={`/loja/colecao/${activeCollection.slug}`}
                  className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-3 py-2 mb-3 hover:bg-primary/15 transition-colors"
                >
                  <span>🌸</span>
                  <span className="text-xs text-text-main flex-1">
                    Coleção <strong>{activeCollection.title.replace(/^Coleção /i, '')}</strong> está no ar
                  </span>
                  <ArrowRight size={14} className="text-primary" />
                </Link>
              )}

              <Link href="/loja">
                <Button variant="primary" size="lg" className="w-full">
                  Ver loja completa
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works - Dois fluxos lado a lado */}
      <section id="how-it-works" className="py-24 bg-[#FFFAFA]">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              Cada universo tem seu jeito. Os dois são simples.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Fluxo 1 — Experiências Digitais */}
            <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-primary/15 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary/15 rounded-full p-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Experiências Digitais
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main mb-1">1. Personalize online</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Use o editor para adicionar fotos, mensagem e música. Sem precisar criar conta.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main mb-1">2. Visualize antes de pagar</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Veja exatamente como vai ficar. Só paga quando estiver 100% satisfeito.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main mb-1">3. Receba QR Code e link</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Por email, na hora. Compartilhe digitalmente ou imprima em um cartão.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fluxo 2 — Loja Paper Bloom */}
            <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-primary/15 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary/15 rounded-full p-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Loja Paper Bloom
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main mb-1">1. Escolha o produto</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Físico personalizado pelo WhatsApp ou arte digital editável no Canva.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main mb-1">2. Combine a personalização</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      No WhatsApp combinamos nomes, fotos e mensagens. Você aprova a prévia antes de imprimir.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main mb-1">3. Receba em casa ou por email</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Pagamento Mercado Pago, envio rastreado pelo Mercado Envios. Arte digital chega no email na hora.
                    </p>
                  </div>
                </div>
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna 1 — Experiências Digitais */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
                  Experiências Digitais
                </h3>
              </div>
              <div className="space-y-3">
                <FAQItem
                  question="O que são as experiências digitais?"
                  answer="São presentes online que a pessoa acessa pelo celular via QR Code ou link. Temos três opções: Mensagem Digital (uma página com foto, mensagem e música), 12 Cartas (12 mensagens lacradas, uma por mês) e Revelação Virtual (votação interativa do sexo do bebê)."
                />
                <FAQItem
                  question="Qual a diferença entre Mensagem Digital e 12 Cartas?"
                  answer="A Mensagem Digital é uma página única — ideal para momentos especiais. As 12 Cartas são uma coleção de 12 mensagens lacradas que podem ser abertas ao longo do ano, cada uma com sua foto e música. É como um calendário de emoções."
                />
                <FAQItem
                  question="Preciso pagar antes de criar?"
                  answer="Não! Você cria e visualiza seu presente completamente grátis. Só paga quando estiver 100% satisfeito e quiser gerar o QR Code final."
                />
                <FAQItem
                  question="Posso usar qualquer música?"
                  answer="Sim. Qualquer música do YouTube. Basta colar o link no editor — toca automaticamente quando a pessoa abrir o presente."
                />
                <FAQItem
                  question="O QR Code expira?"
                  answer="Não. Seu QR Code e o presente ficam disponíveis para sempre. A pessoa pode acessar quantas vezes quiser."
                />
              </div>
            </div>

            {/* Coluna 2 — Loja Paper Bloom */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
                  Loja Paper Bloom
                </h3>
              </div>
              <div className="space-y-3">
                <FAQItem
                  question="O que é a Loja Paper Bloom?"
                  answer="Nossa loja de presentes personalizados — produtos físicos artesanais (jogos, quadros, canecas, livros) e artes digitais editáveis no Canva. Alguns produtos têm as duas versões: você escolhe se quer receber em casa ou baixar para imprimir."
                />
                <FAQItem
                  question="Como funciona a compra pelo WhatsApp?"
                  answer="Você clica em 'Encomendar no WhatsApp' no produto e cai numa conversa com nossa equipe com a mensagem já pronta. Combinamos a personalização (nomes, fotos, mensagens), enviamos uma prévia para aprovação e um link de pagamento seguro pelo Mercado Pago."
                />
                <FAQItem
                  question="Como é o pagamento e a entrega física?"
                  answer="Pagamento Mercado Pago — PIX, boleto ou cartão em até 12× sem juros. Envio pelo Mercado Envios com código de rastreio. Produção em 5-10 dias úteis + frete (3 a 10 dias dependendo do CEP)."
                />
                <FAQItem
                  question="O que é a 'Arte Digital' que aparece em alguns produtos?"
                  answer="É uma versão digital editável no Canva por um preço menor. Você compra direto no site, recebe o link por email em até 5 minutos, abre no Canva como modelo editável e imprime onde quiser."
                />
                <FAQItem
                  question="Vocês fazem troca?"
                  answer="Como tudo é personalizado, não fazemos trocas. Mas se houver erro nosso (impressão, qualidade), refazemos sem custo. Por isso enviamos sempre a prévia da arte para aprovação antes de imprimir."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Dois caminhos */}
      <section className="py-32 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="container px-4 md:px-8 text-center max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-main mb-6">
                Pronto para emocionar?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 font-light max-w-xl mx-auto md:mx-0">
                Escolha o caminho perfeito para presentear quem você ama —
                online em minutos ou um produto artesanal entregue em casa.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link href="/experiencias">
                  <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 gap-2">
                    <Sparkles className="w-5 h-5" />
                    Criar Experiência Digital
                  </Button>
                </Link>
                <Link href={activeCollection ? `/loja/colecao/${activeCollection.slug}` : '/loja'}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-14 text-base rounded-full hover:-translate-y-1 transition-all duration-300 gap-2 bg-white border-2 border-primary/20 hover:border-primary/40">
                    <ShoppingBag className="w-5 h-5" />
                    Visitar a Loja
                  </Button>
                </Link>
              </div>
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
