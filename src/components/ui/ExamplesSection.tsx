"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Users, Gift, ExternalLink, HeartHandshake } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

interface ExampleMessage {
  id: string
  category: string
  title: string
  message: string
  emoji: string
  theme: string
  demoUrl: string
}

const categories = [
  { id: "namoro", label: "Namoro", icon: Heart, color: "from-pink-500 to-rose-500" },
  { id: "casamento", label: "Casamento", icon: Gift, color: "from-purple-500 to-pink-500" },
  { id: "pais", label: "Pais", icon: HeartHandshake, color: "from-indigo-500 to-blue-500" },
  { id: "amizade", label: "Amizade", icon: Users, color: "from-blue-500 to-cyan-500" },
]

const exampleMessages: ExampleMessage[] = [
  // Namoro
  {
    id: "1",
    category: "namoro",
    title: "Mensagem Romântica",
    message: "Cada momento ao seu lado é especial. Você faz meus dias mais felizes e meu coração mais leve. Te amo! 💕",
    emoji: "💖",
    theme: "pink",
    demoUrl: "/demo/message"
  },
  {
    id: "2",
    category: "namoro",
    title: "Aniversário de Namoro",
    message: "Mais um ano ao seu lado e meu amor só cresce! Obrigado por cada sorriso, cada abraço e cada momento especial. Te amo! 🎉",
    emoji: "🎂",
    theme: "rose",
    demoUrl: "/demo/message"
  },
  {
    id: "3",
    category: "namoro",
    title: "Saudade",
    message: "A distância só faz aumentar minha certeza: você é a pessoa que eu quero ao meu lado para sempre. Saudades! 🌹",
    emoji: "🌹",
    theme: "pink",
    demoUrl: "/demo/message"
  },
  
  // Casamento
  {
    id: "4",
    category: "casamento",
    title: "Aniversário de Casamento",
    message: "Celebrando mais um ano da melhor decisão que já tomei: casar com você. Que venham muitos mais anos de amor e cumplicidade! 🥂",
    emoji: "🥂",
    theme: "purple",
    demoUrl: "/demo/message"
  },
  {
    id: "5",
    category: "casamento",
    title: "Bodas",
    message: "Mais um ano ao seu lado, construindo nossa história juntos. Obrigado por cada momento, cada sorriso, cada abraço. Te amo! 💍",
    emoji: "💑",
    theme: "pink",
    demoUrl: "/demo/message"
  },
  {
    id: "6",
    category: "casamento",
    title: "Mensagem Romântica",
    message: "O tempo passa, mas meu amor por você só cresce. Obrigado por ser meu companheiro de vida. Te amo infinitamente! 💝",
    emoji: "💝",
    theme: "purple",
    demoUrl: "/demo/message"
  },
  
  // Pais
  {
    id: "7",
    category: "pais",
    title: "Aniversário",
    message: "Feliz aniversário! Obrigado por todo amor, dedicação e por ser esse exemplo incrível. Que seu dia seja tão especial quanto você! 🎉",
    emoji: "🎂",
    theme: "indigo",
    demoUrl: "/demo/message"
  },
  {
    id: "8",
    category: "pais",
    title: "Dia dos Pais",
    message: "Pai, obrigado por ser meu exemplo, meu herói e meu melhor amigo. Feliz Dia dos Pais! 👨‍👦",
    emoji: "👔",
    theme: "blue",
    demoUrl: "/demo/message"
  },
  {
    id: "9",
    category: "pais",
    title: "Dia das Mães",
    message: "Mãe, seu amor incondicional me guia todos os dias. Obrigado por tudo que você faz. Te amo muito! 💐",
    emoji: "🌸",
    theme: "indigo",
    demoUrl: "/demo/message"
  },
  
  // Amizade
  {
    id: "10",
    category: "amizade",
    title: "Aniversário",
    message: "Feliz aniversário, meu amigo! Que este novo ano seja repleto de alegrias, conquistas e muitas risadas juntos! 🎉",
    emoji: "🎂",
    theme: "blue",
    demoUrl: "/demo/message"
  },
  {
    id: "11",
    category: "amizade",
    title: "Mensagem Especial",
    message: "Obrigado por estar sempre ao meu lado, nos momentos bons e ruins. Sua amizade é um dos meus maiores tesouros!",
    emoji: "🤝",
    theme: "cyan",
    demoUrl: "/demo/message"
  },
]

export function ExamplesSection() {
  const [selectedCategory, setSelectedCategory] = useState("namoro")

  const filteredMessages = exampleMessages.filter(
    (msg) => msg.category === selectedCategory
  )

  return (
    <section id="examples" className="py-24 bg-gradient-to-b from-white to-primary/5">
      <div className="container px-4 md:px-8 max-w-screen-xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-6"
          >
            Inspire-se com Exemplos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg font-light"
          >
            Veja mensagens criadas para diferentes ocasiões e encontre a inspiração perfeita para o seu momento especial.
          </motion.p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon
            const isActive = selectedCategory === category.id
            
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300
                  ${isActive 
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105` 
                    : 'bg-white text-text-main hover:bg-primary/5 border border-gray-200'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.label.split(' ')[0]}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Messages Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredMessages.map((example, index) => (
              <motion.div
                key={example.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/10 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl">{example.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-text-main mb-2">
                          {example.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4 flex-1">
                      {example.message}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {categories.find(c => c.id === example.category)?.label}
                      </span>
                      <Link href={example.demoUrl} target="_blank">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="gap-2 hover:bg-primary hover:text-white transition-colors"
                        >
                          Ver Exemplo
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/editor/mensagem">
            <Button size="lg" className="px-12 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
              Criar Minha Mensagem Personalizada
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
