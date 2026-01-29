import { notFound } from 'next/navigation';
import { cardCollectionService } from '@/services/CardCollectionService';
import { cardService } from '@/services/CardService';
import CardCollectionViewer from './CardCollectionViewer';

/**
 * Página Pública de Visualização de Coleção de Cartas
 * Acessível via /c/[name]/[id] após o pagamento
 */
export default async function PublicCardCollectionPage({
  params,
}: {
  params: { slug: string[] };
}) {
  try {
    // Reconstruir o slug completo: /c/name/id
    const fullSlug = `/c/${params.slug.join('/')}`;
    
    console.log('[CardCollectionPage] Buscando coleção com slug:', fullSlug);
    
    // Buscar coleção por slug
    const collection = await cardCollectionService.findBySlug(fullSlug);
    
    console.log('[CardCollectionPage] Collection found:', {
      id: collection?.id,
      recipientName: collection?.recipientName,
      youtubeVideoId: collection?.youtubeVideoId,
    });
    
    if (!collection) {
      console.log('[CardCollectionPage] Coleção não encontrada');
      notFound();
    }

    // Verificar se a coleção foi paga
    if (collection.status !== 'paid') {
      console.log('[CardCollectionPage] Coleção não foi paga');
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
  params: { slug: string[] };
}) {
  try {
    // Reconstruir o slug completo: /c/name/id
    const fullSlug = `/c/${params.slug.join('/')}`;
    
    const collection = await cardCollectionService.findBySlug(fullSlug);
    
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
