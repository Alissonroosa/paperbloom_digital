import { notFound } from 'next/navigation';
import { cardCollectionService } from '@/services/CardCollectionService';
import { cardService } from '@/services/CardService';
import { PainelClient } from '@/components/painel/PainelClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: { token: string };
}

/**
 * Buyer dashboard page — server component.
 * Fetches collection and cards directly from the database.
 */
export default async function PainelPage({ params }: Props) {
  const collection = await cardCollectionService.findByDashboardToken(params.token);

  if (!collection) {
    notFound();
  }

  const cards = await cardService.findByCollectionId(collection.id);

  return <PainelClient collection={collection} cards={cards} />;
}
