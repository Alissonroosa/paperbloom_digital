'use client';

import { useState } from 'react';
import { CardCollection } from '@/types/card';
import { Copy, Check, Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SharePanelProps {
  collection: CardCollection;
}

/**
 * Share panel: shows QR code, download button, and copy-link button.
 */
export function SharePanel({ collection }: SharePanelProps) {
  const [copied, setCopied] = useState(false);

  const collectionUrl =
    typeof window !== 'undefined' && collection.slug
      ? `${window.location.origin}${collection.slug}`
      : collection.slug ?? '';

  const handleCopy = async () => {
    if (!collectionUrl) return;
    try {
      await navigator.clipboard.writeText(collectionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select input
    }
  };

  const handleDownloadQR = () => {
    if (!collection.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = collection.qrCodeUrl;
    link.download = `qrcode-12cartas-${collection.recipientName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="bg-white rounded-2xl border border-[#E6C2C2] p-6 space-y-5">
      <h2 className="text-lg font-serif font-semibold text-[#4A4A4A]">
        Compartilhar
      </h2>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-4">
        {collection.qrCodeUrl ? (
          <div className="w-48 h-48 bg-white border-4 border-[#E6C2C2] rounded-xl p-3 shadow-inner">
            <img
              src={collection.qrCodeUrl}
              alt="QR Code das 12 cartas"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-48 h-48 bg-[#FFFAFA] border-4 border-[#E6C2C2] rounded-xl flex flex-col items-center justify-center gap-2">
            <QrCode className="w-16 h-16 text-[#D4A5A5]" />
            <p className="text-xs text-[#8B5F5F]">QR Code em processamento…</p>
          </div>
        )}

        <Button
          variant="outline"
          className="gap-2 border-[#D4A5A5] text-[#8B5F5F] hover:bg-[#FFFAFA]"
          onClick={handleDownloadQR}
          disabled={!collection.qrCodeUrl}
        >
          <Download className="w-4 h-4" />
          Baixar QR Code
        </Button>
      </div>

      {/* Shareable link */}
      {collectionUrl && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#4A4A4A]">
            Link público das cartas:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={collectionUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-[#E6C2C2] rounded-lg bg-[#FFFAFA] text-sm text-[#4A4A4A] focus:outline-none"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="px-3 border-[#D4A5A5] text-[#8B5F5F] hover:bg-[#FFFAFA]"
              aria-label="Copiar link"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 font-medium">Copiado!</p>
          )}
        </div>
      )}
    </section>
  );
}
