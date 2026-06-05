'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

interface Props {
  collectionId: string;
}

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 24; // ~60s de polling

export function DeliveryCardCollectionClient({ collectionId }: Props) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const stopped = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const poll = async (attempt: number) => {
      if (stopped.current) return;
      try {
        const res = await fetch(`/api/card-collections/${collectionId}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const c = data.collection;
          if (c?.status === 'paid' && c?.dashboardToken) {
            stopped.current = true;
            router.replace(`/painel/${c.dashboardToken}`);
            return;
          }
        }
      } catch {
        // ignora erro de rede pontual — tenta de novo
      }

      if (attempt + 1 >= MAX_ATTEMPTS) {
        setError('timeout');
        return;
      }
      setAttempts(attempt + 1);
      timer = setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS);
    };

    poll(0);

    return () => {
      stopped.current = true;
      clearTimeout(timer);
    };
  }, [collectionId, router]);

  if (error === 'timeout') {
    return (
      <div className="min-h-screen bg-[#FFFAFA] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center space-y-4 border border-[#E6C2C2]">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-serif font-bold text-[#4A4A4A]">
            Confirmação ainda em processamento
          </h2>
          <p className="text-sm text-[#8B5F5F]">
            Seu pagamento foi recebido, mas a confirmação está demorando mais que o normal.
            Você receberá o link do painel por email em instantes.
          </p>
          <p className="text-xs text-gray-500">
            Se preferir, atualize esta página em alguns segundos ou{' '}
            <a
              href="https://wa.me/5551992698003"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4A5A5] underline"
            >
              fale com a gente no WhatsApp
            </a>.
          </p>
          <button
            onClick={() => {
              setError(null);
              setAttempts(0);
              // força um novo ciclo de polling
              window.location.reload();
            }}
            className="w-full py-3 rounded-full font-medium text-white"
            style={{ backgroundColor: '#D4A5A5' }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const seconds = Math.round((attempts * POLL_INTERVAL_MS) / 1000);

  return (
    <div className="min-h-screen bg-[#FFFAFA] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <Loader2 className="w-12 h-12 animate-spin text-[#D4A5A5] mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-serif font-bold text-[#4A4A4A]">
            Confirmando seu pagamento…
          </h2>
          <p className="text-sm text-[#8B5F5F]">
            Isso costuma levar até 30 segundos. Não feche a página.
          </p>
        </div>
        {seconds >= 15 && (
          <p className="text-xs text-gray-500">
            {seconds < 45
              ? 'Quase lá — o Mercado Pago está confirmando…'
              : 'Tá demorando mais que o normal. Vamos esperar mais um pouquinho.'}
          </p>
        )}
      </div>
    </div>
  );
}
