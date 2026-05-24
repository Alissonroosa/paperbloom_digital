/**
 * /loja/colecao/[slug] — Página de coleção sazonal
 * Server Component: lê a coleção via catalogService e renderiza o ClientPage
 * com hero temático e produtos filtrados.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { catalogService } from '@/services/CatalogService';
import CollectionClientPage from './CollectionClientPage';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://paperbloom.com.br';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = catalogService.getCollection(slug);

  if (!collection) {
    return { title: 'Coleção não encontrada | Paper Bloom' };
  }

  return {
    title: `${collection.title} | Paper Bloom`,
    description: collection.description,
    openGraph: {
      title: collection.title,
      description: collection.description,
      url: `${BASE_URL}/loja/colecao/${slug}`,
      siteName: 'Paper Bloom',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.title,
      description: collection.description,
    },
    alternates: {
      canonical: `${BASE_URL}/loja/colecao/${slug}`,
    },
  };
}

export default async function ColecaoPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = catalogService.getCollection(slug);

  if (!collection) {
    notFound();
  }

  const products = collection.products.filter((p) => p.active);

  return <CollectionClientPage collection={collection} products={products} />;
}
