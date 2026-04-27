'use client';

import { useState } from 'react';
import { CardCollection, Card } from '@/types/card';
import { Send, Eye, Pencil } from 'lucide-react';
import { EntregaTab } from './tabs/EntregaTab';
import { AcompanhamentoTab } from './tabs/AcompanhamentoTab';
import { EditarTab } from './tabs/EditarTab';
import { CardPreviewModal } from './CardPreviewModal';
import { SendModal } from './SendModal';

type TabId = 'entrega' | 'acompanhamento' | 'editar';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'entrega', label: 'Entrega', icon: <Send className="w-4 h-4" /> },
  { id: 'acompanhamento', label: 'Acompanhamento', icon: <Eye className="w-4 h-4" /> },
  { id: 'editar', label: 'Editar', icon: <Pencil className="w-4 h-4" /> },
];

interface PainelClientProps {
  collection: CardCollection;
  cards: Card[];
}

/**
 * Client wrapper for the buyer dashboard.
 * Tab-based navigation: Entrega, Acompanhamento, Editar.
 */
export function PainelClient({ collection, cards: initialCards }: PainelClientProps) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeTab, setActiveTab] = useState<TabId>('entrega');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);

  const collectionUrl =
    typeof window !== 'undefined' && collection.slug
      ? `${window.location.origin}${collection.slug}`
      : collection.slug ?? '';

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    setSelectedCard(null);
  };

  const handleReset = (updatedCards: Card[]) => {
    setCards(prev => {
      const updatedMap = new Map(updatedCards.map(c => [c.id, c]));
      return prev.map(c => updatedMap.get(c.id) ?? c);
    });
  };

  const handleCardUpdate = (updatedCard: Card) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  return (
    <div className="min-h-screen bg-[#FFFAFA]">
      {/* Compact header */}
      <div className="bg-white border-b border-[#E6C2C2] px-4 py-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-xl font-serif font-bold text-[#4A4A4A]">
            12 Cartas para {collection.recipientName}
          </h1>
          <p className="text-xs text-[#8B5F5F] mt-0.5">
            De {collection.senderName}
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <nav className="bg-white border-b border-[#E6C2C2] sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-[#8B5F5F] border-b-2 border-[#8B5F5F]'
                  : 'text-[#4A4A4A]/50 hover:text-[#4A4A4A]/80'
                }
              `}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Tab content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'entrega' && (
          <EntregaTab
            collection={collection}
            collectionUrl={collectionUrl}
            onSendClick={() => setIsSendOpen(true)}
          />
        )}

        {activeTab === 'acompanhamento' && (
          <AcompanhamentoTab
            cards={cards}
            collectionId={collection.id}
            recipientName={collection.recipientName}
            onCardClick={handleCardClick}
            onReset={handleReset}
          />
        )}

        {activeTab === 'editar' && (
          <EditarTab
            collection={collection}
            cards={cards}
            collectionId={collection.id}
            onCardUpdate={handleCardUpdate}
          />
        )}
      </div>

      {/* Modals */}
      <CardPreviewModal
        card={selectedCard}
        collection={collection}
        isOpen={isPreviewOpen}
        onClose={handlePreviewClose}
      />

      <SendModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        recipientName={collection.recipientName}
        senderName={collection.senderName}
        collectionUrl={collectionUrl}
        collectionId={collection.id}
      />
    </div>
  );
}
