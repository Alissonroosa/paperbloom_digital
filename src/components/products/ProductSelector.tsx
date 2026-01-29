"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Heart, Calendar, Sparkles, Star, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary";
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  href: string;
  buttonText: string;
  demoHref?: string;
  comingSoon?: boolean;
  preview: {
    number: string;
    subtitle: string;
    bgClass: string;
  };
}

const products: Product[] = [
  {
    id: "digital-message",
    title: "Mensagem Digital",
    description: "Uma experiência única e emocionante. Crie uma página personalizada com foto, música e uma mensagem que toca o coração.",
    price: "R$ 19,90",
    badge: "Mais Popular",
    badgeVariant: "secondary",
    icon: Heart,
    features: [
      "1 mensagem personalizada",
      "Foto e música incluídas",
      "QR Code exclusivo",
      "Acesso ilimitado",
      "Entrega imediata"
    ],
    href: "/editor/mensagem",
    buttonText: "Criar Minha Mensagem",
    demoHref: "/demo/message",
    preview: {
      number: "1",
      subtitle: "Momento Único",
      bgClass: "bg-gradient-to-br from-pink-50 to-rose-50"
    }
  },
  {
    id: "12-cartas",
    title: "12 Cartas",
    description: "Uma jornada emocional única. 12 mensagens exclusivas que só podem ser abertas uma única vez cada, criando um calendário de mistério ao longo do ano.",
    price: "R$ 29,90",
    originalPrice: "R$ 49,90",
    badge: "Produto Premium",
    badgeVariant: "default",
    icon: Calendar,
    features: [
      "12 mensagens personalizadas",
      "Foto e música em cada carta",
      "Abertura única por carta",
      "QR Code exclusivo",
      "Experiência inesquecível"
    ],
    href: "/editor/12-cartas",
    buttonText: "Criar Minhas 12 Cartas",
    demoHref: "/demo/card-collection",
    preview: {
      number: "12",
      subtitle: "Momentos Únicos",
      bgClass: "bg-gradient-to-br from-primary/20 to-primary/10"
    }
  }
];

export function ProductSelector() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-text-main mb-4">
          Escolha sua Experiência
        </h2>
        <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
          Opções pensadas para cada momento especial. Do simples gesto à jornada emocional completa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {products.map((product, index) => {
          const Icon = product.icon;
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <Card className="relative overflow-hidden border-2 border-primary/10 hover:border-primary/30 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                {/* Coming Soon Badge */}
                {product.comingSoon && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Em Breve
                    </Badge>
                  </div>
                )}

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge
                      variant={product.badgeVariant}
                      className="px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1"
                    >
                      {product.badge === "Produto Premium" && <Sparkles className="w-3 h-3" />}
                      {product.badge === "Mais Popular" && <Star className="w-3 h-3" />}
                      {product.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-16 pb-6">
                  {/* Preview Section */}
                  <div className={`${product.preview.bgClass} rounded-2xl p-8 mb-6 text-center relative overflow-hidden`}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                    <div className="relative z-10">
                      <span className="font-script text-7xl text-primary block leading-none mb-2">
                        {product.preview.number}
                      </span>
                      <p className="text-sm font-medium text-text-main/80">
                        {product.preview.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{product.title}</CardTitle>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="space-y-3 mb-6">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <div className="flex items-baseline justify-center gap-2">
                      {product.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">{product.originalPrice}</span>
                      )}
                      <span className="text-3xl font-bold text-primary">{product.price}</span>
                      <span className="text-sm text-muted-foreground">pagamento único</span>
                    </div>
                    {product.originalPrice && (
                      <div className="mt-2 text-center">
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                          40% OFF
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-6 flex flex-col gap-3">
                  {product.comingSoon ? (
                    <Button
                      size="lg"
                      className="w-full cursor-not-allowed opacity-60"
                      disabled
                    >
                      Em Breve
                      <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <>
                      <Link href={product.href} className="w-full">
                        <Button
                          size="lg"
                          className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all"
                        >
                          {product.buttonText}
                        </Button>
                      </Link>
                      {product.demoHref && (
                        <Link href={product.demoHref} className="w-full">
                          <Button
                            size="lg"
                            variant="outline"
                            className="w-full border-primary/20 hover:bg-primary/5"
                          >
                            Ver Exemplo
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          Teste gratuitamente antes de pagar
        </p>
      </div>
    </div>
  );
}
