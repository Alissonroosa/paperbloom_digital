import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lato, Great_Vibes } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";

// Otimização de fontes (LCP fix):
// - display: 'swap' evita FOIT (texto invisível enquanto fonte carrega)
// - preload: true só na Lato (body) — Playfair e Great Vibes são pra heading/decorativo
// - adjustFontFallback: true reduz CLS quando fonte real carrega
// - Lato reduzida de 5 pesos pra 2 (400 e 700) — única usada em texto corrido
// - Playfair reduzida pra 600 e 700 (single bold pra títulos)
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-playfair",
});

const lato = Lato({
  // Usa só 300/400/700 (light/normal/bold) — pesos efetivamente usados na UI.
  // Removido 100 (nunca usado) e 900 (substituível por 700).
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-lato",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: "Paper Bloom Digital",
  description: "Mensagens personalizadas com emoção.",
  verification: {
    // Verificação de domínio do Meta Business — necessária pra:
    // - Otimização de campanhas em iOS 14.5+ (Aggregated Event Measurement)
    // - Configuração de eventos priorizados do Pixel
    // - Atribuição correta de conversões cross-device
    other: {
      "facebook-domain-verification": "lb41bnb1odq4clcfhm0md1rtyqsbom",
    },
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <GoogleAnalytics />
        <MetaPixel />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          playfair.variable,
          lato.variable,
          greatVibes.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
