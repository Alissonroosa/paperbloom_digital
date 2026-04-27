'use client';

import { CardCollection, Card } from '@/types/card';
import { Lock, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface EditPanelProps {
  collection: CardCollection;
  cards: Card[];
}

/**
 * Edit panel: shows edit button if no cards opened, or locked message otherwise.
 */
export function EditPanel({ collection, cards }: EditPanelProps) {
  const hasOpenedCard = cards.some(c => c.openedAt !== null);
  const editUrl = `/painel/${collection.dashboardToken}/editar`;

  if (hasOpenedCard) {
    return (
      <section className="bg-gray-100 rounded-2xl border border-gray-200 p-6 flex items-center gap-4">
        <Lock className="w-6 h-6 text-gray-400 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold text-gray-500">Conteúdo trancado</p>
          <p className="text-sm text-gray-400">
            Primeira carta já foi aberta — o conteúdo não pode mais ser editado.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-[#E6C2C2] p-6 flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-[#4A4A4A]">Editar conteúdo</p>
        <p className="text-sm text-[#8B5F5F]">
          Nenhuma carta foi aberta ainda — você ainda pode editar.
        </p>
      </div>
      <Link href={editUrl}>
        <Button
          variant="outline"
          className="gap-2 border-[#D4A5A5] text-[#8B5F5F] hover:bg-[#FFFAFA] shrink-0"
        >
          <Pencil className="w-4 h-4" />
          Editar
        </Button>
      </Link>
    </section>
  );
}
