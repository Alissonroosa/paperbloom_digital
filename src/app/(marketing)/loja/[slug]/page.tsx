/**
 * /loja/[slug] — Página de produto individual
 * Server Component: generateStaticParams pré-renderiza todos os produtos ativos.
 * generateMetadata gera SEO + OG dinâmico por produto.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { catalogService } from '@/services/CatalogService';
import ProductPageClient from './ProductPageClient';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://paperbloom.com.br';

interface ProductPageProps {
  params: { slug: string };
}

/**
 * Pré-renderiza em build time todos os produtos ativos do catálogo.
 */
export function generateStaticParams() {
  return catalogService.getAllSlugs();
}

/**
 * Metadata dinâmica por produto — SEO + Open Graph.
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = catalogService.getProductBySlug(params.slug);

  if (!product || !product.active) {
    return {
      title: 'Produto não encontrado | Paper Bloom',
    };
  }

  const ogImage = product.images[0] || `${BASE_URL}/og-loja.jpg`;
  const priceStr = product.art?.priceFormatted
    ? ` — ${product.art.priceFormatted}`
    : '';

  return {
    title: `${product.title}${priceStr} | Paper Bloom`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.title} | Paper Bloom`,
      description: product.shortDescription,
      url: `${BASE_URL}/loja/${product.slug}`,
      siteName: 'Paper Bloom',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Paper Bloom`,
      description: product.shortDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: `${BASE_URL}/loja/${product.slug}`,
    },
  };
}

/**
 * Server Component da página de produto.
 * Resolve o produto e a coleção pai, passa para o Client Component.
 */
export default function ProductPage({ params }: ProductPageProps) {
  const product = catalogService.getProductBySlug(params.slug);

  if (!product || !product.active) {
    notFound();
  }

  const collection = catalogService.getCollectionByProductSlug(params.slug);

  return <ProductPageClient product={product} collection={collection} />;
}
