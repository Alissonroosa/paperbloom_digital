import { notFound } from 'next/navigation';
import { cardCollectionService } from '@/services/CardCollectionService';
import { cardService } from '@/services/CardService';
import CardCollectionViewer from './CardCollectionViewer';

/**
 * Página Pública de Visualização de Coleção de Cartas
 * Acessível via /c/[slug] após o pagamento
 */
export default async function PublicCardCollectionPage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    // Buscar coleção por slug
    const collection = await cardCollectionService.findBySlug(params.slug);
    
    if (!collection) {
      notFound();
    }

    // Verificar se a coleção foi paga
    if (collection.status !== 'paid') {
      notFound();
    }

    // Buscar cartas da coleção
    const cards = await cardService.findByCollectionId(collection.id);

    // Ordenar cartas por ordem
    const sortedCards = cards.sort((a, b) => a.order - b.order);

    return (
      <CardCollectionViewer
        collection={collection}
        cards={sortedCards}
      />
    );
  } catch (error) {
    console.error('Error loading card collection:', error);
    notFound();
  }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const collection = await cardCollectionService.findBySlug(params.slug);
    
    if (!collection) {
      return {
        title: 'Coleção não encontrada',
      };
    }

    return {
      title: `${collection.senderName} preparou 12 cartas para ${collection.recipientName}`,
      description: 'Uma experiência especial de 12 cartas para momentos únicos',
    };
  } catch (error) {
    return {
      title: 'Paper Bloom - 12 Cartas',
    };
  }
}
