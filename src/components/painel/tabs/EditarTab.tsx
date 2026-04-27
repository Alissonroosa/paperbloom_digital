'use client';

import { useState } from 'react';
import { CardCollection, Card } from '@/types/card';
import { Lock, Pencil, Check, ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EditarTabProps {
  collection: CardCollection;
  cards: Card[];
  collectionId: string;
  onCardUpdate?: (updatedCard: Card) => void;
}

/**
 * Editar tab — inline card editing only. Reset moved to Acompanhamento.
 */
export function EditarTab({ collection, cards, collectionId, onCardUpdate }: EditarTabProps) {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasOpenedCard = cards.some(c => c.openedAt !== null);
  const sorted = [...cards].sort((a, b) => a.order - b.order);

  const startEditing = (card: Card) => {
    setEditingCardId(card.id);
    setEditTitle(card.title);
    setEditMessage(card.messageText);
    setSaveSuccess(null);
    setSaveError(null);
  };

  const cancelEditing = () => {
    setEditingCardId(null);
    setEditTitle('');
    setEditMessage('');
    setSaveError(null);
  };

  const handleSave = async (card: Card) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          message: editMessage,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Falha ao salvar');
      }

      const data = await res.json();
      onCardUpdate?.(data.card);
      setSaveSuccess(card.id);
      setEditingCardId(null);
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl border border-[#E6C2C2] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#4A4A4A] flex items-center gap-2">
          <Pencil className="w-4 h-4 text-[#D4A5A5]" />
          Editar cartas
        </h3>

        {hasOpenedCard ? (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500">Conteúdo trancado</p>
              <p className="text-xs text-gray-400">
                Pelo menos uma carta já foi aberta — o conteúdo não pode mais ser editado.
                Resete as cartas na aba &ldquo;Acompanhamento&rdquo; para desbloquear a edição.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#8B5F5F]">
              Toque em uma carta para editar o título e a mensagem.
            </p>

            <ul className="space-y-2">
              {sorted.map(card => {
                const isEditing = editingCardId === card.id;
                const justSaved = saveSuccess === card.id;

                return (
                  <li key={card.id}>
                    <button
                      onClick={() => isEditing ? cancelEditing() : startEditing(card)}
                      className={`
                        w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all text-left
                        ${isEditing
                          ? 'border-[#8B5F5F] bg-[#FFFAFA]'
                          : justSaved
                            ? 'border-green-300 bg-green-50'
                            : 'border-[#E6C2C2] bg-white hover:bg-[#FFFAFA]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs font-bold text-[#D4A5A5] w-5 text-center shrink-0">
                          {card.order}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#4A4A4A] truncate">
                            {card.title}
                          </p>
                          <p className="text-xs text-[#8B5F5F] truncate">
                            {card.messageText}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {justSaved ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : isEditing ? (
                          <ChevronUp className="w-4 h-4 text-[#8B5F5F]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#D4A5A5]" />
                        )}
                      </div>
                    </button>

                    {isEditing && (
                      <div className="mt-2 p-4 bg-[#FFFAFA] border border-[#E6C2C2] rounded-xl space-y-3">
                        <div>
                          <label className="text-xs font-medium text-[#8B5F5F] block mb-1">
                            Título
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-[#E6C2C2] rounded-lg bg-white text-sm text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                            placeholder="Abra quando..."
                            maxLength={200}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-[#8B5F5F] block mb-1">
                            Mensagem
                          </label>
                          <textarea
                            value={editMessage}
                            onChange={e => setEditMessage(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-[#E6C2C2] rounded-lg bg-white text-sm text-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent resize-none"
                            placeholder="Escreva sua mensagem..."
                            maxLength={500}
                          />
                          <p className="text-xs text-[#D4A5A5] text-right mt-0.5">
                            {editMessage.length}/500
                          </p>
                        </div>

                        {saveError && (
                          <p className="text-xs text-red-500">{saveError}</p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelEditing}
                            className="flex-1 border-[#E6C2C2] text-[#4A4A4A]"
                            disabled={isSaving}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSave(card)}
                            className="flex-1 gap-1.5"
                            disabled={isSaving || (!editTitle.trim() && !editMessage.trim())}
                          >
                            {isSaving ? (
                              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando…</>
                            ) : (
                              <><Save className="w-3.5 h-3.5" /> Salvar</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
