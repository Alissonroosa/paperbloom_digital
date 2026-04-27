'use client';

import { useState } from 'react';
import { buildShareMessage, buildWhatsAppUrl } from '@/lib/share-message';
import { analytics } from '@/lib/analytics';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  senderName: string;
  collectionUrl: string;
  collectionId: string;
}

export function SendModal({
  isOpen,
  onClose,
  recipientName,
  senderName,
  collectionUrl,
  collectionId,
}: SendModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const message = buildShareMessage({
    recipientName,
    senderName,
    url: collectionUrl,
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(collectionUrl);
      analytics.copyShareLink(collectionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback para navegadores sem suporte a clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = collectionUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      analytics.copyShareLink(collectionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    analytics.openWhatsAppShare(collectionId);
    window.open(buildWhatsAppUrl(message), '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-modal-title"
    >
      <div
        className="relative w-full max-w-sm bg-[#FFFAFA] rounded-2xl shadow-xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#4A4A4A] hover:text-[#8B5F5F] transition-colors text-xl leading-none"
          aria-label="Fechar modal"
        >
          ✕
        </button>

        {/* Header */}
        <div className="pr-6">
          <h2
            id="send-modal-title"
            className="text-lg font-serif font-bold text-[#4A4A4A]"
          >
            Enviar presente para {recipientName}
          </h2>
          <p className="mt-1 text-sm text-[#8B5F5F]">
            Compartilhe o link abaixo com {recipientName} para que ela/ele possa abrir as cartas.
          </p>
        </div>

        {/* Mensagem padrão */}
        <div className="bg-[#F5F0F0] rounded-xl p-4">
          <p className="text-xs text-[#4A4A4A]/60 font-medium mb-2 uppercase tracking-wide">
            Mensagem sugerida
          </p>
          <pre className="text-sm text-[#4A4A4A] font-mono whitespace-pre-wrap break-words leading-relaxed">
            {message}
          </pre>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-[#E6C2C2] text-[#4A4A4A] rounded-xl font-semibold text-sm hover:bg-[#D4A5A5] transition-colors"
          >
            <span>{copied ? '✅' : '📋'}</span>
            <span>{copied ? 'Copiado!' : 'Copiar link'}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-[#8B5F5F] text-white rounded-xl font-semibold text-sm hover:bg-[#4A4A4A] transition-colors"
          >
            <span>💬</span>
            <span>Abrir WhatsApp</span>
          </button>
        </div>

        {/* Nota sutil */}
        <p className="text-xs text-center text-[#4A4A4A]/50">
          O WhatsApp abrirá em uma nova aba
        </p>
      </div>
    </div>
  );
}
