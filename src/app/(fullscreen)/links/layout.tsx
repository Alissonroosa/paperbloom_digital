import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links | Paper Bloom",
  description:
    "Coleção Dia dos Namorados, experiências digitais, encomendas e mais — escolha por onde quer começar.",
  openGraph: {
    title: "Paper Bloom — Links",
    description:
      "Coleção Dia dos Namorados, experiências digitais, encomendas e mais.",
    images: ["/logo-full.png"],
  },
};

export default function LinksLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
