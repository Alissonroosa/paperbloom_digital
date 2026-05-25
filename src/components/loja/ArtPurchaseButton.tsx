'use client';

/**
 * ArtPurchaseButton — Botão de checkout de arte digital
 * Abre modal inline para captura de email, depois:
 * 1. Chama POST /api/checkout/digital-art/create-session
 * 2. Redireciona para init_point do Mercado Pago
 *
 * Dispara analytics.clickArtCheckout(slug) antes do redirect.
 * Reusa <Button>, <Input>, <Label> de @/components/ui/.
 */

import { useState } from 'react';
import { Download, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { analytics } from '@/lib/analytics';

interface ArtPurchaseButtonProps {
  productSlug: string;
  productTitle: string;
  priceFormatted: string;
  /** Preço em centavos — usado para analytics (value real do evento). */
  priceInCents?: number;
  /** Tamanho do botão de disparo. Default 'lg' para PDP. */
  size?: 'sm' | 'default' | 'lg';
  /** Texto customizado do botão (default: "Comprar arte digital — R$ X") */
  label?: string;
}

type ModalState = 'idle' | 'open' | 'loading' | 'error';

export default function ArtPurchaseButton({
  productSlug,
  productTitle,
  priceFormatted,
  priceInCents,
  size = 'lg',
  label,
}: ArtPurchaseButtonProps) {
  const [modalState, setModalState] = useState<ModalState>('idle');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const openModal = () => {
    setModalState('open');
    setErrorMessage('');
  };

  const closeModal = () => {
    if (modalState === 'loading') return; // evita fechar durante requisição
    setModalState('idle');
    setEmail('');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, insira um email válido.');
      return;
    }

    setModalState('loading');
    setErrorMessage('');

    // Tracking antes do redirect
    analytics.clickArtCheckout({
      slug: productSlug,
      title: productTitle,
      value: priceInCents ? priceInCents / 100 : 0,
    });

    try {
      const response = await fetch('/api/checkout/digital-art/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug, email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error?.message || 'Erro ao iniciar checkout. Tente novamente.');
      }

      // Redireciona para o Mercado Pago
      window.location.href = data.url;
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.'
      );
      setModalState('open');
    }
  };

  return (
    <>
      {/* Botão principal */}
      <Button
        id={`btn-comprar-arte-${productSlug}`}
        variant="primary"
        size={size}
        onClick={openModal}
        className="w-full gap-2"
        aria-label={`Comprar arte digital de ${productTitle} por ${priceFormatted}`}
      >
        <Download size={size === 'lg' ? 20 : size === 'sm' ? 16 : 18} />
        {label ?? `Comprar arte digital — ${priceFormatted}`}
      </Button>

      {/* Modal de captura de email */}
      {modalState !== 'idle' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-art-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-primary/20 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Fechar */}
            <button
              id="modal-close"
              onClick={closeModal}
              disabled={modalState === 'loading'}
              className="absolute top-4 right-4 text-muted-foreground hover:text-text-main transition-colors disabled:opacity-50"
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <p className="font-script text-2xl text-primary mb-1">Arte digital</p>
              <h2
                id="modal-art-title"
                className="text-xl font-serif font-bold text-text-main"
              >
                {productTitle}
              </h2>
              <p className="text-3xl font-bold text-primary mt-2">{priceFormatted}</p>
            </div>

            {/* 4 — Microcopy: Como você vai receber */}
            <div className="bg-primary/5 rounded-xl p-4 mb-4 text-sm text-text-main">
              <p className="font-medium mb-2 flex items-center gap-2">
                <span className="text-lg">📩</span>
                Como você vai receber
              </p>
              <ol className="space-y-1.5 text-muted-foreground text-xs ml-6 list-decimal">
                <li>Você é redirecionado pro Mercado Pago para pagar (PIX, cartão ou boleto)</li>
                <li>Após o pagamento, o link de download chega no seu email em até 5 minutos</li>
                <li>Você pode baixar até 5 vezes em até 30 dias</li>
              </ol>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email-checkout">
                  Seu email para receber a arte
                </Label>
                <Input
                  id="email-checkout"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={modalState === 'loading'}
                  required
                  autoFocus
                  autoComplete="email"
                />
                <p className="text-xs text-muted-foreground">
                  O link de download será enviado para este email após o pagamento.
                </p>
              </div>

              {/* Erro */}
              {errorMessage && (
                <p className="text-sm text-red-500 text-center" role="alert">
                  {errorMessage}
                </p>
              )}

              {/* Submit */}
              <Button
                id="btn-ir-pagamento"
                type="submit"
                variant="primary"
                size="lg"
                disabled={modalState === 'loading'}
                className="w-full gap-2"
              >
                {modalState === 'loading' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Preparando pagamento...
                  </>
                ) : (
                  'Ir para o pagamento'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Pagamento seguro via Mercado Pago 🔒
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
