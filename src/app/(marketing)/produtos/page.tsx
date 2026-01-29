"use client"

import { motion } from "framer-motion"
import { ProductSelector } from "@/components/products/ProductSelector"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function ProdutosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFAFA] to-white">
      {/* Header with back button */}
      <div className="container px-4 md:px-8 max-w-screen-xl mx-auto pt-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar para Home
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="font-script text-3xl md:text-4xl text-primary mb-4 block">
              Escolha sua experiência
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-text-main mb-6">
              Qual presente você quer criar?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Escolha entre uma mensagem única e especial ou uma jornada emocional de 12 cartas.
              Ambas as opções combinam fotos, músicas e mensagens personalizadas.
            </p>
          </motion.div>

          {/* Product Selection */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <ProductSelector />
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-12 text-center"
          >
            <div className="flex flex-col items-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">10.000+</p>
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

          {/* Features Comparison */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-24"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-main text-center mb-12">
              Compare as opções
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Mensagem Digital */}
              <div className="bg-white rounded-2xl p-8 border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
                <h3 className="text-2xl font-bold text-text-main mb-4">Mensagem Digital</h3>
                <p className="text-muted-foreground mb-6">
                  Perfeita para momentos especiais únicos
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-text-main">Uma mensagem personalizada</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-text-main">Galeria com até 7 fotos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-text-main">Música do YouTube</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-text-main">QR Code exclusivo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-text-main">Acesso ilimitado</span>
                  </li>
                </ul>
                <div className="mt-8 pt-6 border-t border-primary/10">
                  <p className="text-3xl font-bold text-primary">R$ 29,90</p>
                  <p className="text-sm text-muted-foreground mt-1">Pagamento único</p>
                </div>
              </div>

              {/* 12 Cartas */}
              <div className="bg-white rounded-2xl p-8 border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                  MAIS COMPLETO
                </div>
                <h3 className="text-2xl font-bold text-text-main mb-4">12 Cartas</h3>
                <p className="text-muted-foreground mb-6">
                  Uma jornada emocional ao longo do ano
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-text-main">12 mensagens únicas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-text-main">Foto e música em cada carta</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-text-main">Abertura única por carta</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-text-main">Templates pré-preenchidos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-xl">✓</span>
                    <span className="text-text-main">Experiência interativa</span>
                  </li>
                </ul>
                <div className="mt-8 pt-6 border-t border-primary/10">
                  <p className="text-3xl font-bold text-primary">R$ 49,90</p>
                  <p className="text-sm text-muted-foreground mt-1">Pagamento único</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Guarantee Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-20 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full border-2 border-primary/20 shadow-lg">
              <span className="text-4xl">🎁</span>
              <div className="text-left">
                <p className="font-semibold text-text-main">Teste gratuitamente</p>
                <p className="text-sm text-muted-foreground">Só pague quando estiver satisfeito</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
