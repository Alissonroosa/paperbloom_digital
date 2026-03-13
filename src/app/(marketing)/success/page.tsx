'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Success Page Content Component
 * Handles redirect after successful Mercado Pago payment
 */
function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mercado Pago sends payment_id, status, preference_id as query params
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const preferenceId = searchParams.get('preference_id');

    // Also support legacy session_id for backwards compatibility during transition
    const sessionId = searchParams.get('session_id');

    if (!paymentId && !sessionId) {
      setError('ID do pagamento não encontrado');
      return;
    }

    const queryParam = paymentId
      ? `payment_id=${paymentId}`
      : `session_id=${sessionId}`;

    // Fetch payment details to get messageId or collectionId
    fetch(`/api/checkout/session?${queryParam}`)
      .then(res => {
        if (!res.ok) throw new Error('Falha ao buscar dados do pagamento');
        return res.json();
      })
      .then(async data => {
        // Wait for webhook to process
        console.log('Aguardando webhook processar...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        if (data.revealId) {
          // Gender Reveal product
          try {
            const checkResponse = await fetch(`/api/gender-reveal/${data.revealId}`);
            if (checkResponse.ok) {
              const revealData = await checkResponse.json();
              if (revealData.reveal?.status === 'paid') {
                console.log('✅ Webhook já processou a revelação');
                router.push(`/delivery/revelacao-virtual/${data.revealId}`);
                return;
              }
            }
          } catch (checkError) {
            console.warn('Erro ao verificar status da revelação:', checkError);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
          router.push(`/delivery/revelacao-virtual/${data.revealId}`);
        } else if (data.collectionId) {
          try {
            const checkResponse = await fetch(`/api/card-collections/${data.collectionId}`);
            if (checkResponse.ok) {
              const collectionData = await checkResponse.json();
              if (collectionData.status === 'paid') {
                console.log('✅ Webhook já processou a coleção');
                router.push(`/delivery/c/${data.collectionId}`);
                return;
              }
            }
          } catch (checkError) {
            console.warn('Erro ao verificar status da coleção:', checkError);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
          router.push(`/delivery/c/${data.collectionId}`);
        } else if (data.messageId) {
          try {
            const checkResponse = await fetch(`/api/messages/id/${data.messageId}`);
            if (checkResponse.ok) {
              const messageData = await checkResponse.json();
              if (messageData.status === 'paid') {
                console.log('✅ Webhook já processou a mensagem');
                router.push(`/delivery/${data.messageId}`);
                return;
              }
            }
          } catch (checkError) {
            console.warn('Erro ao verificar status da mensagem:', checkError);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
          router.push(`/delivery/${data.messageId}`);
        } else {
          setError('ID da mensagem ou coleção não encontrado');
        }
      })
      .catch(err => {
        console.error('Error fetching payment:', err);
        setError('Erro ao processar pagamento');
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <a href="/editor/mensagem" className="text-primary hover:underline">
            Voltar para o editor
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Processando seu pagamento...</p>
        <p className="text-sm text-muted-foreground">
          Você será redirecionado em instantes
        </p>
      </div>
    </div>
  );
}

/**
 * Success Page
 * Handles redirect after successful Mercado Pago payment
 */
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
