'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CardCollection, Card } from '@/types/card';
import { Send, Eye, Pencil, Sparkles, MessageCircle, Copy, Check } from 'lucide-react';
import { EntregaTab } from './tabs/EntregaTab';
import { AcompanhamentoTab } from './tabs/AcompanhamentoTab';
import { EditarTab } from './tabs/EditarTab';
import { CardPreviewModal } from './CardPreviewModal';
import { CardCinematicPreviewModal } from '@/components/card-editor/CardCinematicPreviewModal';
import { SendModal } from './SendModal';
import { analytics } from '@/lib/analytics';
import { buildShareMessage, buildWhatsAppUrl } from '@/lib/share-message';

type TabId = 'entrega' | 'acompanhamento' | 'editar';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'entrega', label: 'Entrega', icon: <Send className="w-4 h-4" /> },
  { id: 'acompanhamento', label: 'Acompanhamento', icon: <Eye className="w-4 h-4" /> },
  { id: 'editar', label: 'Editar', icon: <Pencil className="w-4 h-4" /> },
];

interface PainelClientProps {
  collection: CardCollection;
  cards: Card[];
  /** Valor da compra (em reais) — usado para o evento Purchase do GA4/Meta. */
  purchaseValue: number;
}

/**
 * Client wrapper for the buyer dashboard.
 * Tab-based navigation: Entrega, Acompanhamento, Editar.
 */
export function PainelClient({ collection, cards: initialCards, purchaseValue }: PainelClientProps) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [linkJustCopied, setLinkJustCopied] = useState(false);

  // Dispara Purchase do GA4/Meta na primeira visita ao painel após o pagamento.
  // O ID do MP serve como transactionId. analytics.purchase já é idempotente
  // por sessionStorage (chave `tracked_purchase_<id>`), então recarregar a página
  // não duplica o evento.
  useEffect(() => {
    if (collection.status !== 'paid') return;
    const transactionId = collection.paymentId || collection.id;
    analytics.purchase('card-collection', transactionId, purchaseValue);
  }, [collection.status, collection.paymentId, collection.id, purchaseValue]);
  const [activeTab, setActiveTab] = useState<TabId>('entrega');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isCinematicPreviewOpen, setIsCinematicPreviewOpen] = useState(false);

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

  // Envio rápido via WhatsApp com mensagem pré-formatada.
  // Abre o WhatsApp do próprio comprador (web ou app, conforme device).
  const handleQuickWhatsAppSend = () => {
    if (!collectionUrl) return;
    const message = buildShareMessage({
      recipientName: collection.recipientName,
      senderName: collection.senderName,
      url: collectionUrl,
    });
    analytics.openWhatsAppShare(collection.id);
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  // Copia link bruto pra colar onde quiser.
  const handleQuickCopyLink = async () => {
    if (!collectionUrl) return;
    try {
      await navigator.clipboard.writeText(collectionUrl);
      analytics.copyShareLink(collection.id);
      setLinkJustCopied(true);
      setTimeout(() => setLinkJustCopied(false), 2000);
    } catch { /* clipboard indisponível em http: */ }
  };

  return (
    <div className="min-h-screen bg-[#FFFAFA]">
      {/* Compact header */}
      <div className="bg-white border-b border-[#E6C2C2] px-4 py-4">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div>
            <h1 className="text-xl font-serif font-bold text-[#4A4A4A]">
              12 Cartas para {collection.recipientName}
            </h1>
            <p className="text-xs text-[#8B5F5F] mt-0.5">
              De {collection.senderName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCinematicPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ backgroundColor: '#D4A5A5' }}
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            Ver prévia como {collection.recipientName} vai ver
          </button>
        </div>
      </div>

      {/* Hero CTA — primeira ação que o comprador deve fazer no painel */}
      <section className="bg-gradient-to-br from-[#FFFAFA] via-white to-[#FFE4E4] px-4 py-6 border-b border-[#E6C2C2]">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md border-2 border-[#D4A5A5]/30 p-5 space-y-4">
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-[#4A4A4A]">
                📨 Pronto para enviar para {collection.recipientName}?
              </p>
              <p className="text-xs text-[#8B5F5F]">
                Quanto antes mandar, mais cedo a emoção começa 💕
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickWhatsAppSend}
                disabled={!collectionUrl}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full font-semibold text-white bg-[#25D366] hover:bg-[#1FB855] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Enviar pelo WhatsApp
              </button>
              <button
                type="button"
                onClick={handleQuickCopyLink}
                disabled={!collectionUrl}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full font-semibold text-[#4A4A4A] bg-white border-2 border-[#D4A5A5] hover:bg-[#FFFAFA] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {linkJustCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
                    Link copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    Copiar link
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-[11px] text-[#8B5F5F]/80">
              {collection.recipientName} vai ver as 12 cartas exatamente como na prévia.
            </p>
          </div>
        </div>
      </section>

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

      <AnimatePresence>
        {isCinematicPreviewOpen && (
          <CardCinematicPreviewModal
            collection={{
              recipientName: collection.recipientName,
              senderName: collection.senderName,
              introMessage: collection.introMessage,
              coverImageUrl: collection.coverImageUrl,
              youtubeVideoId: collection.youtubeVideoId,
            }}
            cards={cards}
            onClose={() => setIsCinematicPreviewOpen(false)}
            mode="dashboard"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
