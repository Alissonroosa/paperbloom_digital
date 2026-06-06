import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lato, Great_Vibes } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
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
