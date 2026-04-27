'use client';

import { useState } from 'react';
import { Card } from '@/types/card';
import { RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ResetPanelProps {
  cards: Card[];
  collectionId: string;
  onReset: (updatedCards: Card[]) => void;
}

type ResetTarget = { type: 'single'; card: Card } | { type: 'all' };

/**
 * Reset panel: allows resetting individual or all opened cards.
 */
export function ResetPanel({ cards, collectionId, onReset }: ResetPanelProps) {
  const [resetTarget, setResetTarget] = useState<ResetTarget | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openedCards = cards.filter(c => c.status === 'opened');

  if (openedCards.length === 0) return null;

  const handleConfirm = async () => {
    if (!resetTarget) return;
    setIsLoading(true);

    try {
      if (resetTarget.type === 'single') {
        const res = await fetch(`/api/cards/${resetTarget.card.id}/reset`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('Falha ao resetar carta');
        const data = await res.json();
        onReset([data.card]);
      } else {
        const res = await fetch(`/api/card-collections/${collectionId}/reset-all`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('Falha ao resetar cartas');
        const data = await res.json();
        onReset(data.cards);
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsLoading(false);
      setResetTarget(null);
    }
  };

  const recipientName =
    resetTarget?.type === 'single'
      ? cards[0]?.collectionId // placeholder — we use a generic message
      : null;

  return (
    <>
      <section className="bg-white rounded-2xl border border-[#E6C2C2] p-6 space-y-4">
        <h2 className="text-lg font-serif font-semibold text-[#4A4A4A]">
          Cartas abertas
        </h2>

        <ul className="space-y-2">
          {openedCards.map(card => (
            <li
              key={card.id}
              className="flex items-center justify-between gap-3 py-2 border-b border-[#E6C2C2] last:border-0"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-[#4A4A4A]">
                  Carta {card.order}
                </span>
                <p className="text-xs text-[#8B5F5F] truncate">{card.title}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 border-[#D4A5A5] text-[#8B5F5F] hover:bg-[#FFFAFA] shrink-0"
                onClick={() => setResetTarget({ type: 'single', card })}
              >
                <RotateCcw className="w-3 h-3" />
                Resetar
              </Button>
            </li>
          ))}
        </ul>

        {openedCards.length >= 2 && (
          <Button
            variant="outline"
            className="w-full gap-2 border-[#D4A5A5] text-[#8B5F5F] hover:bg-[#FFFAFA]"
            onClick={() => setResetTarget({ type: 'all' })}
          >
            <RotateCcw className="w-4 h-4" />
            Resetar todas as cartas abertas
          </Button>
        )}
      </section>

      {/* Confirmation modal */}
      {resetTarget && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !isLoading && setResetTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-[#4A4A4A]">
                {resetTarget.type === 'all'
                  ? 'Resetar todas as cartas?'
                  : `Resetar carta ${resetTarget.card.order}?`}
              </h3>
              <button
                onClick={() => !isLoading && setResetTarget(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cancelar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {resetTarget.type === 'all'
                ? 'Todas as cartas abertas voltarão a ser surpresas. O destinatário poderá abri-las de novo.'
                : `Esta carta voltará a ser uma surpresa. O destinatário poderá abri-la de novo.`}
            </p>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => !isLoading && setResetTarget(null)}
                className="w-full"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Resetando…
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Confirmar reset
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
