'use client';

import { useState } from 'react';
import { CardCollection } from '@/types/card';
import { Copy, Check, Download, QrCode, MessageCircle, Printer, Gift, Share2, Eye, Pencil, Layers, MousePointerClick, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { buildShareMessage, buildWhatsAppUrl } from '@/lib/share-message';
import { analytics } from '@/lib/analytics';

interface EntregaTabProps {
  collection: CardCollection;
  collectionUrl: string;
  onSendClick: () => void;
}

export function EntregaTab({ collection, collectionUrl, onSendClick }: EntregaTabProps) {
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const handleCopy = async () => {
    if (!collectionUrl) return;
    try {
      await navigator.clipboard.writeText(collectionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const handleCopyMessage = async () => {
    const message = buildShareMessage({
      recipientName: collection.recipientName,
      senderName: collection.senderName,
      url: collectionUrl,
    });
    try {
      await navigator.clipboard.writeText(message);
      analytics.copyShareLink(collection.id);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    } catch { /* fallback */ }
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

  const whatsappOrcamentoUrl = 'https://wa.me/5551992698003?text=' + encodeURIComponent(
    `Olá! Comprei as 12 Cartas na Paper Bloom e gostaria de saber sobre opções de impressão/quadro com QR Code para presentear.`
  );

  return (
    <div className="space-y-4">
      {/* Box 1 — Link + QR Code (mais importante) */}
      <section className="bg-white rounded-2xl border border-[#E6C2C2] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#4A4A4A] flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#D4A5A5]" />
          Link e QR Code
        </h3>

        {/* Link */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#8B5F5F]">Link público das cartas:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={collectionUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-[#E6C2C2] rounded-lg bg-[#FFFAFA] text-sm text-[#4A4A4A] focus:outline-none truncate"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="px-3 border-[#D4A5A5] text-[#8B5F5F] hover:bg-[#FFFAFA] shrink-0"
              aria-label="Copiar link"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3 pt-2">
          {collection.qrCodeUrl ? (
            <div className="w-40 h-40 bg-white border-4 border-[#E6C2C2] rounded-xl p-2 shadow-inner">
              <img
                src={collection.qrCodeUrl}
                alt="QR Code das 12 cartas"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-40 h-40 bg-[#FFFAFA] border-4 border-[#E6C2C2] rounded-xl flex flex-col items-center justify-center gap-2">
              <QrCode className="w-12 h-12 text-[#D4A5A5]" />
              <p className="text-xs text-[#8B5F5F]">Processando…</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-[#D4A5A5] text-[#8B5F5F] hover:bg-[#FFFAFA]"
            onClick={handleDownloadQR}
            disabled={!collection.qrCodeUrl}
          >
            <Download className="w-4 h-4" />
            Baixar QR Code
          </Button>
        </div>
      </section>

      {/* Box 2 — Como funciona (timeline visual) */}
      <section className="bg-white rounded-2xl border border-[#E6C2C2] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#4A4A4A]">
          ✨ Como funciona
        </h3>

        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-[13px] top-2 bottom-2 w-px bg-gradient-to-b from-[#D4A5A5] to-[#E6C2C2]" />

          {/* Step 1 */}
          <div className="relative pb-5">
            <div className="absolute -left-8 top-0.5 w-7 h-7 rounded-full bg-[#8B5F5F] flex items-center justify-center shadow-sm">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-sm font-medium text-[#4A4A4A]">
              {collection.recipientName} verá as 12 cartas
            </p>
            <p className="text-xs text-[#8B5F5F] mt-0.5">
              Todas as cartas ficam disponíveis em uma página especial.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative pb-5">
            <div className="absolute -left-8 top-0.5 w-7 h-7 rounded-full bg-[#D4A5A5] flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-sm font-medium text-[#4A4A4A]">
              Cada carta tem um título especial
            </p>
            <p className="text-xs text-[#8B5F5F] mt-0.5">
              &ldquo;Abra quando estiver triste&rdquo;, &ldquo;Abra quando sentir saudade&rdquo;…
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative pb-5">
            <div className="absolute -left-8 top-0.5 w-7 h-7 rounded-full bg-[#D4A5A5] flex items-center justify-center shadow-sm">
              <MousePointerClick className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-sm font-medium text-[#4A4A4A]">
              Ao clicar, a carta abre pela primeira e única vez
            </p>
            <p className="text-xs text-[#8B5F5F] mt-0.5">
              Cada carta só pode ser lida uma vez — tornando o momento ainda mais especial.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative">
            <div className="absolute -left-8 top-0.5 w-7 h-7 rounded-full bg-[#E6C2C2] flex items-center justify-center shadow-sm">
              <Clock className="w-3.5 h-3.5 text-[#8B5F5F]" />
            </div>
            <p className="text-sm font-medium text-[#4A4A4A]">
              As outras cartas continuam disponíveis
            </p>
            <p className="text-xs text-[#8B5F5F] mt-0.5">
              {collection.recipientName} escolhe quando abrir cada uma, no seu tempo.
            </p>
          </div>
        </div>
      </section>

      {/* Box 2 — Ideias de como entregar (with actions) */}
      <section className="bg-white rounded-2xl border border-[#E6C2C2] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#4A4A4A]">
          💡 Ideias de como entregar
        </h3>
        <ul className="space-y-4">
          {/* WhatsApp */}
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFFAFA] border border-[#E6C2C2] flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-[#8B5F5F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#4A4A4A]">Envie por WhatsApp</p>
              <p className="text-xs text-[#8B5F5F] mb-2">
                Envie o link com uma mensagem carinhosa direto no WhatsApp.
              </p>
              <button
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5F5F] hover:text-[#4A4A4A] transition-colors"
              >
                {copiedMsg ? (
                  <><Check className="w-3.5 h-3.5 text-green-600" /> Mensagem copiada!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copiar mensagem sugerida</>
                )}
              </button>
            </div>
          </li>

          {/* Imprimir QR */}
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFFAFA] border border-[#E6C2C2] flex items-center justify-center shrink-0">
              <Printer className="w-4 h-4 text-[#8B5F5F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#4A4A4A]">Imprima o QR Code</p>
              <p className="text-xs text-[#8B5F5F] mb-2">
                Baixe o QR Code, imprima e cole em um cartão físico para entregar junto com um presente.
              </p>
              <button
                onClick={handleDownloadQR}
                disabled={!collection.qrCodeUrl}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5F5F] hover:text-[#4A4A4A] transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" /> Baixar QR Code
              </button>
            </div>
          </li>

          {/* Surpreenda pessoalmente */}
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFFAFA] border border-[#E6C2C2] flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-[#8B5F5F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#4A4A4A]">Surpreenda pessoalmente</p>
              <p className="text-xs text-[#8B5F5F] mb-2">
                Quer um quadro ou presente personalizado com o QR Code? Fale com a gente!
              </p>
              <a
                href={whatsappOrcamentoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5F5F] hover:text-[#4A4A4A] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Pedir orçamento
              </a>
            </div>
          </li>

          {/* Copiar link */}
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFFAFA] border border-[#E6C2C2] flex items-center justify-center shrink-0">
              <Copy className="w-4 h-4 text-[#8B5F5F]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#4A4A4A]">Copie e cole o link</p>
              <p className="text-xs text-[#8B5F5F] mb-2">
                Envie o link por email, Instagram, Telegram ou qualquer outro canal.
              </p>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5F5F] hover:text-[#4A4A4A] transition-colors"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 text-green-600" /> Link copiado!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copiar link</>
                )}
              </button>
            </div>
          </li>
        </ul>
      </section>

      {/* Box 4 — Explicativo das outras abas */}
      <section className="bg-[#FFFAFA] rounded-2xl border border-[#E6C2C2] p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#4A4A4A]">
          📌 Sobre este painel
        </h3>
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2.5">
            <Eye className="w-4 h-4 text-[#D4A5A5] mt-0.5 shrink-0" />
            <p className="text-xs text-[#4A4A4A]">
              <strong>Acompanhamento</strong> — veja quais cartas já foram abertas, com data e hora, e quais ainda estão fechadas.
            </p>
          </li>
          <li className="flex items-start gap-2.5">
            <Pencil className="w-4 h-4 text-[#D4A5A5] mt-0.5 shrink-0" />
            <p className="text-xs text-[#4A4A4A]">
              <strong>Editar</strong> — edite o conteúdo das cartas (enquanto nenhuma foi aberta) ou resete cartas já abertas.
            </p>
          </li>
        </ul>
        <div className="bg-[#E6C2C2]/30 rounded-xl p-3 mt-2">
          <p className="text-xs text-[#8B5F5F] leading-relaxed">
            💡 <strong>Guarde este link!</strong> Ele é seu acesso ao painel para acompanhar, editar e resetar as cartas a qualquer momento.
          </p>
        </div>
      </section>
    </div>
  );
}
