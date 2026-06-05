import type { Metadata } from "next";

// Metadata + Open Graph específicos da LP /12-cartas.
// O page.tsx é "use client" e não pode exportar metadata diretamente; por isso
// usamos um layout próprio. Cobre:
// - Title e description otimizados pra SEO + CTR em buscas
// - OG/Twitter cards pra compartilhamento no WhatsApp/Insta/Facebook
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://paperbloom.com.br";

export const metadata: Metadata = {
  title: "12 Cartas para o seu amor — Presente digital com música, foto e mensagem",
  description:
    "Crie um presente digital único: 12 cartas personalizadas com música, foto e mensagem sua. Cada carta só pode ser aberta uma vez. Perfeito pro Dia dos Namorados, aniversário ou só pra emocionar quem você ama. A partir de R$ 29,90.",
  keywords: [
    "presente dia dos namorados",
    "12 cartas",
    "presente para namorado",
    "presente para namorada",
    "carta de amor digital",
    "presente personalizado",
    "presente romântico",
    "paper bloom",
  ],
  openGraph: {
    title: "12 Cartas para o seu amor 💌",
    description:
      "Um presente que dura o ano todo: 12 cartas com foto, música e mensagem sua. Cada uma só abre uma vez. Sinta a demo grátis em 30s.",
    url: `${SITE_URL}/12-cartas`,
    siteName: "Paper Bloom",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og/12-cartas.jpeg`,
        width: 1200,
        height: 896,
        alt: "12 Cartas para o seu amor — Paper Bloom",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "12 Cartas para o seu amor 💌",
    description: "Presente digital com música, foto e mensagem em cada carta. R$ 29,90.",
    images: [`${SITE_URL}/og/12-cartas.jpeg`],
  },
  alternates: {
    canonical: `${SITE_URL}/12-cartas`,
  },
};

export default function CartasLPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
