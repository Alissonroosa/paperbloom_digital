import { notFound, redirect } from 'next/navigation';
import { cardCollectionService } from '@/services/CardCollectionService';
import { cardService } from '@/services/CardService';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: { token: string };
}

/**
 * Post-purchase edit page.
 * Redirects back to the dashboard if any card has been opened (content locked).
 * Otherwise, links to the editor with the collection pre-loaded.
 *
 * Note: The current editor (/editor/12-cartas) creates a new collection on mount
 * and does not accept an external collectionId. This page provides a direct link
 * to the editor and shows the collection ID for reference. A future iteration can
 * deep-link into the editor once it supports loading an existing collection.
 */
export default async function EditarPage({ params }: Props) {
  const collection = await cardCollectionService.findByDashboardToken(params.token);

  if (!collection) {
    notFound();
  }

  const cards = await cardService.findByCollectionId(collection.id);
  const hasOpenedCard = cards.some(c => c.openedAt !== null);

  if (hasOpenedCard) {
    redirect(`/painel/${params.token}`);
  }

  const backUrl = `/painel/${params.token}`;

  return (
    <div className="min-h-screen bg-[#FFFAFA] flex flex-col items-center justify-center p-6 gap-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E6C2C2] p-8 space-y-6 text-center">
        <h1 className="text-2xl font-serif font-bold text-[#4A4A4A]">
          Editar suas 12 Cartas
        </h1>

        <p className="text-sm text-[#8B5F5F]">
          Para editar o conteúdo das suas cartas, acesse o editor abaixo. Suas
          alterações serão salvas automaticamente.
        </p>

        <div className="bg-[#FFFAFA] border border-[#E6C2C2] rounded-xl p-4 text-left space-y-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            ID da coleção
          </p>
          <p className="text-xs font-mono text-[#4A4A4A] break-all">
            {collection.id}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={`/editor/12-cartas?collectionId=${collection.id}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#8B5F5F] text-white rounded-xl font-semibold hover:bg-[#4A4A4A] transition-colors"
          >
            Abrir Editor
          </a>

          <Link
            href={backUrl}
            className="text-sm text-[#8B5F5F] hover:text-[#4A4A4A] transition-colors"
          >
            ← Voltar ao painel
          </Link>
        </div>
      </div>
    </div>
  );
}
