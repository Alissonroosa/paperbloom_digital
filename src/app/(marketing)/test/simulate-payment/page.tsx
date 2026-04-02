'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface RecentItem {
  id: string;
  recipientName: string;
  senderName: string;
  status: string;
  slug: string | null;
  createdAt: string;
  pageTitle?: string;
}

/**
 * Test page to simulate payment processing manually
 * This bypasses Mercado Pago and directly processes the payment
 */
export default function SimulatePaymentPage() {
  const [collectionId, setCollectionId] = useState('');
  const [messageId, setMessageId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentCollections, setRecentCollections] = useState<RecentItem[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentItem[]>([]);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  // Fetch recent items on mount
  useEffect(() => {
    fetchRecentItems();
  }, []);

  const fetchRecentItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test/recent-items');
      const data = await response.json();
      console.log('[SimulatePayment] API response:', data);
      
      if (response.ok) {
        setRecentCollections(data.collections || []);
        setRecentMessages(data.messages || []);
      } else {
        console.error('[SimulatePayment] API error:', data.error);
        setResult({
          success: false,
          message: `Erro ao carregar itens: ${data.error}`,
        });
      }
    } catch (error) {
      console.error('[SimulatePayment] Failed to fetch recent items:', error);
      setResult({
        success: false,
        message: `Erro de conexão: ${error instanceof Error ? error.message : 'Unknown'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateCardCollectionPayment = async (id?: string) => {
    const targetId = id || collectionId.trim();
    if (!targetId) {
      setResult({ success: false, message: 'Digite o ID da coleção' });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'card-collection',
          collectionId: targetId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Pagamento simulado com sucesso!',
          data,
        });
        // Refresh the list
        fetchRecentItems();
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao simular pagamento',
          data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateMessagePayment = async (id?: string) => {
    const targetId = id || messageId.trim();
    if (!targetId) {
      setResult({ success: false, message: 'Digite o ID da mensagem' });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          messageId: targetId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Pagamento simulado com sucesso!',
          data,
        });
        // Refresh the list
        fetchRecentItems();
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao simular pagamento',
          data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const createTestRecord = async (type: 'card-collection' | 'message') => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/test/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          action: 'create-test',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Registro de teste criado com sucesso! ID: ${data.collection?.id || data.messageData?.id}`,
          data,
        });
        // Refresh the list
        fetchRecentItems();
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao criar registro de teste',
          data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-pink-600 hover:text-pink-700 mb-8 inline-block">
          ← Voltar ao início
        </Link>

        <h1 className="text-3xl font-serif font-bold mb-2">🧪 Simular Pagamento</h1>
        <p className="text-gray-600 mb-8">
          Use esta página para testar o processamento de pagamento sem passar pelo Mercado Pago.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Collection */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">💌 12 Cartas</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection ID
                </label>
                <input
                  type="text"
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  placeholder="Cole o ID aqui..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => simulateCardCollectionPayment()}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processando...' : 'Simular Pagamento'}
                </Button>
                <Button
                  onClick={() => createTestRecord('card-collection')}
                  disabled={isProcessing}
                  variant="outline"
                  className="text-sm"
                >
                  + Criar Teste
                </Button>
              </div>

              {/* Recent Collections */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Últimas coleções:</h3>
                  <button
                    onClick={fetchRecentItems}
                    className="text-xs text-pink-600 hover:text-pink-700"
                  >
                    🔄 Atualizar
                  </button>
                </div>
                
                {isLoading ? (
                  <p className="text-sm text-gray-500">Carregando...</p>
                ) : recentCollections.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma coleção encontrada</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentCollections.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border text-sm ${
                          item.status === 'paid'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium truncate flex-1">
                            {item.recipientName} ← {item.senderName}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              item.status === 'paid'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-yellow-200 text-yellow-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {formatDate(item.createdAt)} • ID: {item.id.slice(0, 8)}...
                        </div>
                        <div className="flex gap-2">
                          {item.status !== 'paid' ? (
                            <button
                              onClick={() => simulateCardCollectionPayment(item.id)}
                              disabled={isProcessing}
                              className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded hover:bg-pink-200"
                            >
                              💳 Simular
                            </button>
                          ) : item.slug ? (
                            <a
                              href={item.slug}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                            >
                              🔗 Ver
                            </a>
                          ) : null}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.id);
                              alert('ID copiado!');
                            }}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                          >
                            📋 Copiar ID
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Digital Message */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">💬 Mensagem Digital</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message ID
                </label>
                <input
                  type="text"
                  value={messageId}
                  onChange={(e) => setMessageId(e.target.value)}
                  placeholder="Cole o ID aqui..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-pink-500 focus:border-pink-500 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => simulateMessagePayment()}
                  disabled={isProcessing}
                  variant="outline"
                  className="flex-1"
                >
                  {isProcessing ? 'Processando...' : 'Simular Pagamento'}
                </Button>
                <Button
                  onClick={() => createTestRecord('message')}
                  disabled={isProcessing}
                  variant="outline"
                  className="text-sm"
                >
                  + Criar Teste
                </Button>
              </div>

              {/* Recent Messages */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Últimas mensagens:</h3>
                
                {isLoading ? (
                  <p className="text-sm text-gray-500">Carregando...</p>
                ) : recentMessages.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma mensagem encontrada</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentMessages.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border text-sm ${
                          item.status === 'paid'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium truncate flex-1">
                            {item.pageTitle || item.recipientName}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              item.status === 'paid'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-yellow-200 text-yellow-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {formatDate(item.createdAt)} • ID: {item.id.slice(0, 8)}...
                        </div>
                        <div className="flex gap-2">
                          {item.status !== 'paid' ? (
                            <button
                              onClick={() => simulateMessagePayment(item.id)}
                              disabled={isProcessing}
                              className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded hover:bg-pink-200"
                            >
                              💳 Simular
                            </button>
                          ) : item.slug ? (
                            <a
                              href={item.slug}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                            >
                              🔗 Ver
                            </a>
                          ) : null}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.id);
                              alert('ID copiado!');
                            }}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                          >
                            📋 Copiar ID
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`mt-6 rounded-xl p-6 ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <h3
              className={`font-semibold mb-2 ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {result.success ? '✅ Sucesso!' : '❌ Erro'}
            </h3>
            <p className={result.success ? 'text-green-700' : 'text-red-700'}>
              {result.message}
            </p>

            {result.data && result.success && (
              <div className="mt-4">
                {result.data.fullUrl && (
                  <a
                    href={result.data.fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mr-2"
                  >
                    🔗 Ver Produto
                  </a>
                )}
                {result.data.qrCodeUrl && (
                  <a
                    href={result.data.qrCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    📱 Ver QR Code
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
