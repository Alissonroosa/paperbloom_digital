'use client';

import { useState } from 'react';
import { Card } from '@/types/card';
import { Lock, Check, Clock, RotateCcw, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AcompanhamentoTabProps {
  cards: Card[];
  collectionId: string;
  recipientName: string;
  onCardClick: (card: Card) => void;
  onReset: (updatedCards: Card[]) => void;
}

type ResetTarget = { type: 'single'; card: Card } | { type: 'all' };

/**
 * Generate an emotional recommendation based on the last opened card title.
 */
function getRecommendation(recipientName: string, lastCard: Card | null): string {
  if (!lastCard) return '';

  const title = lastCard.title.toLowerCase();

  if (title.includes('dia difícil') || title.includes('dia dificil')) {
    return `${recipientName} abriu a carta de "dia difícil". Converse com ela/ele e leve para fazer algo divertido 💛`;
  }
  if (title.includes('insegur')) {
    return `${recipientName} abriu a carta sobre insegurança. Que tal mandar uma mensagem reforçando o quanto ela/ele é especial? 💪`;
  }
  if (title.includes('longe') || title.includes('saudade')) {
    return `${recipientName} abriu a carta da saudade. Talvez seja hora de planejar um encontro ou uma ligação especial 🌍`;
  }
  if (title.includes('estressad') || title.includes('trabalho')) {
    return `${recipientName} abriu a carta sobre estresse. Que tal sugerir um momento de descanso juntos? 🧘`;
  }
  if (title.includes('amo') || title.includes('te amo')) {
    return `${recipientName} quis saber o quanto é amada/amado. Aproveite para demonstrar isso hoje 💕`;
  }
  if (title.includes('ano juntos') || title.includes('aniversário') || title.includes('celebr') || title.includes('conquista')) {
    return `${recipientName} abriu uma carta de celebração. Parabéns pelo momento especial de vocês! 🎉`;
  }
  if (title.includes('chuva') || title.includes('tédio')) {
    return `${recipientName} abriu a carta de noite de chuva. Que tal preparar algo gostoso juntos? ☕`;
  }
  if (title.includes('briga') || title.includes('irritou')) {
    return `${recipientName} abriu a carta sobre brigas. Talvez seja um bom momento para conversar com carinho 🤝`;
  }
  if (title.includes('risada') || title.includes('rir')) {
    return `${recipientName} quis dar uma risada. Mande aquele meme ou lembre de um momento engraçado de vocês 😂`;
  }
  if (title.includes('dormir') || title.includes('sono')) {
    return `${recipientName} abriu a carta de boa noite. Mande uma mensagem carinhosa antes de dormir 🌙`;
  }

  return `${recipientName} abriu mais uma carta. Cada abertura é um momento especial entre vocês 💌`;
}

export function AcompanhamentoTab({ cards, collectionId, recipientName, onCardClick, onReset }: AcompanhamentoTabProps) {
  const [resetTarget, setResetTarget] = useState<ResetTarget | null>(null);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const sorted = [...cards].sort((a, b) => a.order - b.order);
  const openedCards = sorted.filter(c => c.status === 'opened');
  const closedCards = sorted.filter(c => c.status === 'unopened');

  const totalOpened = openedCards.length;
  const total = cards.length;

  // Find the most recently opened card
  const lastOpenedCard = openedCards.length > 0
    ? [...openedCards].sort((a, b) => {
        const dateA = a.openedAt ? new Date(a.openedAt).getTime() : 0;
        const dateB = b.openedAt ? new Date(b.openedAt).getTime() : 0;
        return dateB - dateA;
      })[0]
    : null;

  function formatDate(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' às ' + d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const handleResetConfirm = async () => {
    if (!resetTarget) return;
    setIsResetLoading(true);

    try {
      if (resetTarget.type === 'single') {
        const res = await fetch(`/api/cards/${resetTarget.card.id}/reset`, { method: 'POST' });
        if (!res.ok) throw new Error('Falha ao resetar carta');
        const data = await res.json();
        onReset([data.card]);
      } else {
        const res = await fetch(`/api/card-collections/${collectionId}/reset-all`, { method: 'POST' });
        if (!res.ok) throw new Error('Falha ao resetar cartas');
        const data = await res.json();
        onReset(data.cards);
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetLoading(false);
      setResetTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Emotional summary box */}
      <div className="bg-white rounded-2xl border border-[#E6C2C2] p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A5A5] to-[#8B5F5F] flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-serif font-bold text-[#4A4A4A]">
              {totalOpened === 0
                ? 'Aguardando…'
                : totalOpened === total
                  ? 'Todas abertas! 🎉'
                  : `${totalOpened} carta${totalOpened > 1 ? 's' : ''} aberta${totalOpened > 1 ? 's' : ''}`}
            </p>
            <p className="text-xs text-[#8B5F5F]">
              {totalOpened === 0
                ? `${recipientName} ainda não abriu nenhuma carta`
                : `de ${total} cartas`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[#FFFAFA] border border-[#E6C2C2] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#D4A5A5] to-[#8B5F5F] rounded-full transition-all duration-500"
            style={{ width: `${(totalOpened / total) * 100}%` }}
          />
        </div>

        {/* Emotional recommendation */}
        {lastOpenedCard && (
          <div className="bg-[#FFFAFA] rounded-xl border border-[#E6C2C2] p-3 mt-2">
            <p className="text-xs text-[#4A4A4A] leading-relaxed">
              💡 {getRecommendation(recipientName, lastOpenedCard)}
            </p>
          </div>
        )}
      </div>

      {/* Opened cards */}
      {openedCards.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#4A4A4A] flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Cartas abertas ({openedCards.length})
            </h3>
            {openedCards.length >= 2 && (
              <button
                onClick={() => setResetTarget({ type: 'all' })}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#8B5F5F] hover:text-[#4A4A4A] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Resetar todas
              </button>
            )}
          </div>
          <ul className="space-y-2">
            {openedCards.map(card => (
              <li key={card.id} className="bg-white rounded-xl border border-[#E6C2C2] p-4 space-y-2">
                <button
                  onClick={() => onCardClick(card)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#E6C2C2] flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-[#8B5F5F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#4A4A4A]">
                      Carta {card.order}
                    </p>
                    <p className="text-xs text-[#8B5F5F] truncate">{card.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs text-[#8B5F5F]">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(card.openedAt)}</span>
                    </div>
                  </div>
                </button>
                {/* Individual reset button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setResetTarget({ type: 'single', card })}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#8B5F5F] hover:text-[#4A4A4A] transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Resetar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Closed cards */}
      {closedCards.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[#4A4A4A] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D4A5A5]" />
            Cartas fechadas ({closedCards.length})
          </h3>
          <ul className="space-y-2">
            {closedCards.map(card => (
              <li key={card.id}>
                <button
                  onClick={() => onCardClick(card)}
                  className="w-full bg-white rounded-xl border border-[#E6C2C2] p-4 flex items-center gap-3 hover:shadow-sm transition-shadow text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FFFAFA] border border-[#E6C2C2] flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-[#D4A5A5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#4A4A4A]">
                      Carta {card.order}
                    </p>
                    <p className="text-xs text-[#8B5F5F] truncate">{card.title}</p>
                  </div>
                  <span className="text-xs text-[#D4A5A5] shrink-0">
                    Aguardando
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reset confirmation modal */}
      {resetTarget && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !isResetLoading && setResetTarget(null)}
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
                onClick={() => !isResetLoading && setResetTarget(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cancelar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {resetTarget.type === 'all'
                ? `Todas as cartas abertas voltarão a ser surpresas. ${recipientName} poderá abri-las de novo.`
                : `Esta carta voltará a ser uma surpresa. ${recipientName} poderá abri-la de novo.`}
            </p>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => !isResetLoading && setResetTarget(null)}
                className="w-full"
                disabled={isResetLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleResetConfirm}
                className="w-full gap-2"
                disabled={isResetLoading}
              >
                {isResetLoading ? (
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
    </div>
  );
}
