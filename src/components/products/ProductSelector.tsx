"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Heart, Calendar, Sparkles, Star, Check, Baby } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePrices } from "@/hooks/usePrices";

interface Product {
  id: string;
  priceKey: string; // Chave para buscar preço do banco
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: "default" | "secondary";
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  href: string;
  buttonText: string;
  demoHref?: string;
  lpHref?: string; // Link para a Landing Page do produto
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
    priceKey: "message",
    title: "Mensagem Digital",
    description: "Uma experiência única e emocionante. Crie uma página personalizada com foto, música e uma mensagem que toca o coração.",
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
    lpHref: "/mensagem-digital",
    preview: {
      number: "1",
      subtitle: "Momento Único",
      bgClass: "bg-gradient-to-br from-pink-50 to-rose-50"
    }
  },
  {
    id: "12-cartas",
    priceKey: "card-collection",
    title: "12 Cartas",
    description: "Uma jornada emocional única. 12 mensagens exclusivas que só podem ser abertas uma única vez cada, criando um calendário de mistério ao longo do ano.",
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
    lpHref: "/12-cartas",
    preview: {
      number: "12",
      subtitle: "Momentos Únicos",
      bgClass: "bg-gradient-to-br from-primary/20 to-primary/10"
    }
  },
  {
    id: "revelacao-virtual",
    priceKey: "gender-reveal",
    title: "Revelação Virtual",
    description: "Transforme a revelação do sexo do bebê em uma experiência interativa. Seus convidados votam, acompanham a contagem e descobrem juntos!",
    badge: "Novo",
    badgeVariant: "secondary",
    icon: Baby,
    features: [
      "Votação interativa",
      "Dashboard de votos em tempo real",
      "Galeria com até 5 fotos",
      "QR Code exclusivo",
      "Mensagens dos convidados"
    ],
    href: "/editor/revelacao-virtual",
    buttonText: "Criar Minha Revelação",
    demoHref: "/demo/revelacao-virtual",
    lpHref: "/revelacao-virtual",
    preview: {
      number: "🧸",
      subtitle: "Menino ou Menina?",
      bgClass: "bg-gradient-to-br from-blue-100 to-pink-100"
    }
  }
];

export function ProductSelector() {
  const { prices, loading } = usePrices();

  // Função para calcular desconto
  const getDiscount = (priceKey: string) => {
    const price = prices[priceKey];
    if (!price?.priceFromCents || !price?.priceCents) return null;
    const discount = Math.round((1 - price.priceCents / price.priceFromCents) * 100);
    return discount > 0 ? discount : null;
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => {
          const Icon = product.icon;
          const productPrice = prices[product.priceKey];
          const discount = getDiscount(product.priceKey);
          
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
                      {product.badge === "Novo" && <Sparkles className="w-3 h-3" />}
                      {product.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-16 pb-6">
                  {/* Preview Section */}
                  <div className={`${product.preview.bgClass} rounded-2xl p-8 mb-6 text-center relative overflow-hidden`}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                    <div className="relative z-10">
                      <span className={`block leading-none mb-2 ${product.preview.number.length > 2 ? 'text-6xl' : 'font-script text-7xl text-primary'}`}>
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
                      {productPrice?.priceFromFormatted && (
                        <span className="text-lg text-muted-foreground line-through">
                          {productPrice.priceFromFormatted}
                        </span>
                      )}
                      <span className="text-3xl font-bold text-primary">
                        {loading ? "..." : productPrice?.priceFormatted || "R$ --,--"}
                      </span>
                      <span className="text-sm text-muted-foreground">pagamento único</span>
                    </div>
                    {discount && (
                      <div className="mt-2 text-center">
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                          {discount}% OFF
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
                      <div className="flex gap-2 w-full">
                        {product.demoHref && (
                          <Link href={product.demoHref} className="flex-1">
                            <Button
                              size="lg"
                              variant="outline"
                              className="w-full border-primary/20 hover:bg-primary/5"
                            >
                              Ver Demo
                            </Button>
                          </Link>
                        )}
                        {product.lpHref && (
                          <Link href={product.lpHref} className="flex-1">
                            <Button
                              size="lg"
                              variant="ghost"
                              className="w-full text-primary hover:bg-primary/5"
                            >
                              Saiba mais
                            </Button>
                          </Link>
                        )}
                      </div>
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
