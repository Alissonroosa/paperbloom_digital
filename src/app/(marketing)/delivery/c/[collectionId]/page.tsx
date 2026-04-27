import { redirect } from 'next/navigation';
import { cardCollectionService } from '@/services/CardCollectionService';

/**
 * Legacy delivery page — redirects to the buyer dashboard.
 * Converts old /delivery/c/[collectionId] URLs to /painel/[token].
 */
export default async function Page({ params }: { params: { collectionId: string } }) {
  const collection = await cardCollectionService.findById(params.collectionId);

  if (!collection?.dashboardToken) {
    redirect('/');
  }

  redirect('/painel/' + collection.dashboardToken);
}
