/**
 * /loja — Vitrine da Coleção Dia dos Namorados 2026
 * Server Component: lê catálogo em build time via catalogService.
 * Padrão visual de (marketing)/experiencias/page.tsx.
 */

import type { Metadata } from 'next';
import { catalogService } from '@/services/CatalogService';
import LojaClientPage from './LojaClientPage';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://paperbloom.com.br';

export const metadata: Metadata = {
  title: 'Loja — Artes Digitais Dia dos Namorados 2026 | Paper Bloom',
  description:
    'Descubra artes digitais e presentes artesanais exclusivos para o Dia dos Namorados 2026. Download imediato após a compra. Presentes que emocionam.',
  openGraph: {
    title: 'Loja Paper Bloom — Coleção Dia dos Namorados 2026',
    description:
      'Artes digitais de alta resolução e presentes artesanais criados com amor para o Dia dos Namorados 2026.',
    url: `${BASE_URL}/loja`,
    siteName: 'Paper Bloom',
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/og-loja.jpg`,
        width: 1200,
        height: 630,
        alt: 'Paper Bloom — Coleção Dia dos Namorados 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loja Paper Bloom — Coleção Dia dos Namorados 2026',
    description: 'Artes digitais exclusivas para o Dia dos Namorados 2026.',
  },
  alternates: {
    canonical: `${BASE_URL}/loja`,
  },
};

export default function LojaPage() {
  const products = catalogService.getAllProducts();
  const collection = catalogService.getFirstCollection();

  // Se não houver coleção ativa, renderiza apenas com os produtos (sem banner de urgência)
  return <LojaClientPage products={products} collection={collection} />;
}
