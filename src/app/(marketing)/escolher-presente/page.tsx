'use client'

/**
 * /escolher-presente — Página intermediária do CTA do Header
 * Apresenta os dois universos (Experiências Digitais + Loja) de forma
 * destacada, sem distrações, para o cliente escolher o caminho.
 */

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Heart,
  Calendar,
  Baby,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Zap,
  Home,
  Smartphone,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { catalogService } from '@/services/CatalogService'
import { analytics } from '@/lib/analytics'

export default function EscolherPresentePage() {
  const activeCollection = catalogService.getActiveCollection()
  const lojaProducts = catalogService.getAllProducts().slice(0, 4)
  const lojaHref = activeCollection ? `/loja/colecao/${activeCollection.slug}` : '/loja'

  useEffect(() => {
    analytics.viewEscolherPresente()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFAFA] to-white">
      <section className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">

          {/* ── Hero ── */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12 md:mb-16"
          >
            <span className="font-script text-3xl md:text-4xl text-primary mb-3 block">
              Vamos lá!
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-text-main mb-5 leading-tight">
              Que tipo de presente <br className="hidden md:block" />
              você quer dar?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Temos dois caminhos para você emocionar quem ama.
              Escolha o que combina com a ocasião — ou explore os dois.
            </p>
          </motion.div>

          {/* ── Dois universos em destaque ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-16">

            {/* CARD EXPERIÊNCIAS DIGITAIS */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-white rounded-3xl p-6 md:p-8 border-2 border-primary/15 hover:border-primary/30 transition-all duration-300 flex flex-col shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary/15 rounded-full p-2.5">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Experiências Digitais
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-3">
                Crie online, entregue na hora
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6 font-light leading-relaxed">
                Páginas interativas com foto, música e mensagem. A pessoa recebe um QR Code
                ou link e abre direto no celular.
              </p>

              {/* 3 experiências */}
              <div className="flex flex-col gap-3 mb-6 flex-1">
                <Link
                  href="/mensagem-digital"
                  className="flex items-start gap-4 bg-primary/5 rounded-xl p-4 hover:bg-primary/10 transition-colors group"
                >
                  <div className="bg-white rounded-xl p-3 shrink-0 shadow-sm">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-text-main">Mensagem Digital</p>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Uma página com foto, mensagem e música. Perfeito para momentos únicos.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/12-cartas"
                  className="flex items-start gap-4 bg-primary/5 rounded-xl p-4 hover:bg-primary/10 transition-colors group"
                >
                  <div className="bg-white rounded-xl p-3 shrink-0 shadow-sm">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-text-main">12 Cartas</p>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      12 mensagens lacradas, uma por mês. O presente que dura o ano inteiro.
                    </p>
                  </div>
                </Link>

                <Link
                  href="/revelacao-virtual"
                  className="flex items-start gap-4 bg-primary/5 rounded-xl p-4 hover:bg-primary/10 transition-colors group"
                >
                  <div className="bg-white rounded-xl p-3 shrink-0 shadow-sm">
                    <Baby className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-text-main">Revelação Virtual</p>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Convidados votam menino ou menina ao vivo pelo celular. Revelação animada.
                    </p>
                  </div>
                </Link>
              </div>

              <Link href="/experiencias">
                <Button variant="primary" size="lg" className="w-full gap-2">
                  Ver todas as experiências
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            {/* CARD LOJA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-white rounded-3xl p-6 md:p-8 border-2 border-primary/15 hover:border-primary/30 transition-all duration-300 flex flex-col shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary/15 rounded-full p-2.5">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Loja Paper Bloom
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-3">
                Presentes físicos + artes digitais
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6 font-light leading-relaxed">
                Produtos artesanais personalizados pelo WhatsApp ou artes digitais editáveis
                para você mesmo imprimir.
              </p>

              {/* Preview de produtos */}
              {lojaProducts.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
                  {lojaProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/loja/${product.slug}`}
                      className="group block bg-primary/5 rounded-xl overflow-hidden hover:bg-primary/10 transition-colors"
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
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-text-main truncate">
                          {product.title}
                        </p>
                        {product.physical?.priceFormatted && (
                          <p className="text-[11px] text-muted-foreground">
                            {product.physical.priceFormatted}
                          </p>
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
                  className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-3 py-2.5 mb-3 hover:bg-primary/15 transition-colors"
                >
                  <span>🌸</span>
                  <span className="text-xs text-text-main flex-1">
                    Coleção{' '}
                    <strong>{activeCollection.title.replace(/^Coleção /i, '')}</strong> está no ar
                  </span>
                  <ArrowRight size={14} className="text-primary" />
                </Link>
              )}

              <Link href={lojaHref}>
                <Button variant="primary" size="lg" className="w-full gap-2">
                  Visitar a loja
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* ── Quando usar cada um? ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="bg-gradient-to-br from-primary/5 to-transparent rounded-3xl p-6 md:p-10 border border-primary/10"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-2">
                Ainda em dúvida?
              </h2>
              <p className="text-muted-foreground font-light">
                Veja qual caminho combina mais com o que você quer fazer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Quando escolher Experiências */}
              <div className="bg-white rounded-2xl p-6 border border-primary/10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    Experiências Digitais
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 font-light">
                  Escolha esse caminho se você quer:
                </p>
                <ul className="space-y-3 text-sm text-text-main">
                  <li className="flex items-start gap-3">
                    <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Entregar <strong>na hora</strong> — sem esperar produção ou correio</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Smartphone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Algo <strong>interativo</strong> no celular (QR Code, link, votação)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Combinar <strong>foto + música + mensagem</strong> em uma só página</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>Testar antes de pagar (você só paga se gostar do resultado)</span>
                  </li>
                </ul>
              </div>

              {/* Quando escolher Loja */}
              <div className="bg-white rounded-2xl p-6 border border-primary/10">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    Loja Paper Bloom
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 font-light">
                  Escolha esse caminho se você quer:
                </p>
                <ul className="space-y-3 text-sm text-text-main">
                  <li className="flex items-start gap-3">
                    <Home className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Um presente <strong>físico</strong> entregue em casa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Truck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Algo <strong>artesanal e personalizado</strong> (jogos, quadros, livros)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Uma <strong>arte digital</strong> para imprimir você mesmo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>Combinar a personalização direto pelo WhatsApp com nossa equipe</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  )
}
