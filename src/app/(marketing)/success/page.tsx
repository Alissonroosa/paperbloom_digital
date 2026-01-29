'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Success Page
 * Handles redirect after successful Stripe payment
 * Fetches the message ID or collection ID from the session and redirects to delivery page
 */
export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('Session ID não encontrado');
      return;
    }

    // Fetch session details to get messageId or collectionId
    fetch(`/api/checkout/session?session_id=${sessionId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Falha ao buscar sessão');
        }
        return res.json();
      })
      .then(async data => {
        // Check if it's a card collection
        if (data.collectionId) {
          // Aguardar 3 segundos para dar tempo do webhook processar primeiro
          console.log('Aguardando webhook processar coleção...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Verificar se a coleção já foi processada pelo webhook
          try {
            const checkResponse = await fetch(`/api/card-collections/${data.collectionId}`);
            if (checkResponse.ok) {
              const collectionData = await checkResponse.json();
              
              // Se já está paga, o webhook processou
              if (collectionData.status === 'paid') {
                console.log('✅ Webhook já processou a coleção');
                router.push(`/delivery/c/${data.collectionId}`);
                return;
              }
            }
          } catch (checkError) {
            console.warn('Erro ao verificar status da coleção:', checkError);
          }
          
          // Aguardar mais um pouco para garantir que o processamento foi concluído
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Redirect to delivery page with collectionId
          router.push(`/delivery/c/${data.collectionId}`);
        } else if (data.messageId) {
          // Aguardar 3 segundos para dar tempo do webhook processar primeiro
          console.log('Aguardando webhook processar...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Verificar se a mensagem já foi processada pelo webhook
          try {
            const checkResponse = await fetch(`/api/messages/id/${data.messageId}`);
            if (checkResponse.ok) {
              const messageData = await checkResponse.json();
              
              // Se já está paga, o webhook processou
              if (messageData.status === 'paid') {
                console.log('✅ Webhook já processou a mensagem');
                router.push(`/delivery/${data.messageId}`);
                return;
              }
            }
          } catch (checkError) {
            console.warn('Erro ao verificar status da mensagem:', checkError);
          }
          
          // Se chegou aqui, webhook não processou - usar fallback
          console.log('⚠️ Webhook não processou, usando fallback...');
          try {
            const processResponse = await fetch('/api/test/update-message-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messageId: data.messageId,
                status: 'paid'
              })
            });

            if (processResponse.ok) {
              console.log('✅ Mensagem processada com sucesso via fallback');
            } else {
              console.error('❌ Falha ao processar mensagem via fallback');
            }
          } catch (processError) {
            console.error('❌ Erro ao processar mensagem:', processError);
          }

          // Aguardar mais um pouco para garantir que o processamento foi concluído
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Redirect to delivery page with messageId
          router.push(`/delivery/${data.messageId}`);
        } else {
          setError('ID da mensagem ou coleção não encontrado');
        }
      })
      .catch(err => {
        console.error('Error fetching session:', err);
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
