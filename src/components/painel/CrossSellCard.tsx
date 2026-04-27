import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Subtle cross-sell card shown at the bottom of the buyer dashboard.
 */
export function CrossSellCard() {
  return (
    <div className="bg-[#FFFAFA] border border-[#E6C2C2] rounded-2xl p-5 flex items-center justify-between gap-4">
      <p className="text-sm text-[#4A4A4A]">
        Já tem 12 cartas. Que tal uma{' '}
        <strong className="text-[#8B5F5F]">Mensagem Digital</strong> pra outra
        ocasião?
      </p>
      <Link
        href="/mensagem-digital"
        className="shrink-0 flex items-center gap-1 text-sm font-semibold text-[#8B5F5F] hover:text-[#4A4A4A] transition-colors"
      >
        Ver
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
