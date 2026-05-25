'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import analytics from '@/lib/analytics';

interface SuccessClientProps {
  orderId: string;
  email: string;
  productTitle: string;
  canvaTemplateUrl: string;
  canvaTemplateLabel?: string;
  canvaTemplateUrlSecondary?: string;
  canvaTemplateLabelSecondary?: string;
  licenseText: string;
  amountCents: number;
}

export function SuccessClient({
  orderId,
  email,
  productTitle,
  canvaTemplateUrl,
  canvaTemplateLabel,
  canvaTemplateUrlSecondary,
  canvaTemplateLabelSecondary,
  licenseText,
  amountCents,
}: SuccessClientProps) {
  useEffect(() => {
    analytics.purchaseArt(orderId, amountCents);
  }, [orderId, amountCents]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFAFA] to-white flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full mx-auto text-center">
        {/* Ícone de sucesso */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl">✅</span>
        </div>

        {/* Título */}
        <h1
          style={{ fontFamily: 'Georgia, serif' }}
          className="text-3xl md:text-4xl font-bold text-[#8B5F5F] mb-4"
        >
          Pagamento confirmado!
        </h1>

        {/* Produto */}
        <p className="text-lg text-[#4A4A4A] mb-2">
          <strong>{productTitle}</strong>
        </p>

        {/* Email */}
        <p className="text-sm text-muted-foreground mb-10">
          📩 Enviamos o link para <strong>{email}</strong> — verifique a caixa de entrada e o spam.
        </p>

        {/* CTA principal */}
        <a
          href={canvaTemplateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full max-w-sm px-8 py-4 rounded-full text-white text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg mb-3"
          style={{ background: 'linear-gradient(135deg, #D4A5A5, #8B5F5F)' }}
        >
          🎨 {canvaTemplateLabel ?? 'Abrir no Canva agora'}
        </a>

        {/* CTA secundário (ex: Livro com capa + miolo) */}
        {canvaTemplateUrlSecondary && (
          <a
            href={canvaTemplateUrlSecondary}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full max-w-sm px-8 py-4 rounded-full text-white text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg mb-4"
            style={{ background: '#8B5F5F' }}
          >
            🎨 {canvaTemplateLabelSecondary ?? 'Abrir arquivo 2 no Canva'}
          </a>
        )}

        <p className="text-xs text-[#a09090] mb-10">
          Ao clicar, o Canva criará uma cópia editável exclusiva para você.
        </p>

        {/* Licença */}
        <div className="bg-[#fdf2f2] border border-[#f0d4d4] rounded-xl p-4 mb-8 text-left">
          <p className="text-xs text-[#8B5F5F] leading-relaxed">{licenseText}</p>
          <p className="text-xs text-[#a09090] mt-2 italic">
            Este link é pessoal — não compartilhe com outras pessoas.
          </p>
        </div>

        {/* Recovery link */}
        <Link
          href="/loja/recuperar-arte"
          className="text-sm text-[#D4A5A5] hover:text-[#8B5F5F] underline transition-colors"
        >
          Já recebeu antes? Recuperar minha arte
        </Link>

        <div className="mt-8">
          <Link
            href="/loja"
            className="text-sm text-muted-foreground hover:text-[#8B5F5F] transition-colors"
          >
            ← Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  );
}
