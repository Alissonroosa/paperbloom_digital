'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

interface PendingReveal {
  id: string;
  boyName: string;
  girlName: string;
  dadName: string;
  momName: string;
  contactEmail: string | null;
  status: string;
  createdAt: string;
}

/**
 * Test page to manually process a payment in development
 * Simulates what the webhook does after payment approval
 */
export default function ProcessPaymentPage() {
  const [revealId, setRevealId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [pendingReveals, setPendingReveals] = useState<PendingReveal[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Load pending reveals on mount
  useEffect(() => {
    fetch('/api/test/list-pending-reveals')
      .then(res => res.json())
      .then(data => {
        setPendingReveals(data.reveals || []);
      })
      .catch(console.error)
      .finally(() => setLoadingList(false));
  }, []);

  const processPayment = async () => {
    if (!revealId.trim()) {
      setResult({ success: false, message: 'Digite o ID da revelação' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Call the test endpoint to process the payment
      const response = await fetch('/api/test/process-gender-reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revealId: revealId.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Pagamento processado com sucesso!',
          data,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao processar pagamento',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-24">
      <div className="container max-w-xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Processar Pagamento (Teste)</CardTitle>
            <CardDescription>
              Use esta página para simular o processamento do webhook em desenvolvimento.
              O Mercado Pago não consegue enviar webhooks para localhost.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID da Revelação (UUID):
              </label>
              <input
                type="text"
                value={revealId}
                onChange={(e) => setRevealId(e.target.value)}
                placeholder="ex: 123e4567-e89b-12d3-a456-426614174000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Você pode encontrar o ID no sessionStorage do navegador (gender-reveal-editor-data)
              </p>
            </div>

            <Button
              onClick={processPayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processando...' : 'Processar Pagamento'}
            </Button>

            {result && (
              <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </p>
                {result.data && (
                  <div className="mt-4 space-y-2">
                    {result.data.publicUrl && (
                      <div>
                        <p className="text-sm text-gray-600">Link Público:</p>
                        <a href={result.data.publicUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                          {result.data.publicUrl}
                        </a>
                      </div>
                    )}
                    {result.data.dashboardUrl && (
                      <div>
                        <p className="text-sm text-gray-600">Link Dashboard:</p>
                        <a href={result.data.dashboardUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                          {result.data.dashboardUrl}
                        </a>
                      </div>
                    )}
                    {result.data.deliveryUrl && (
                      <div>
                        <p className="text-sm text-gray-600">Página de Entrega:</p>
                        <a href={result.data.deliveryUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                          {result.data.deliveryUrl}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* List of pending reveals */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-gray-800 mb-3">Revelações Recentes:</h3>
              {loadingList ? (
                <p className="text-gray-500 text-sm">Carregando...</p>
              ) : pendingReveals.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma revelação encontrada</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pendingReveals.map((reveal) => (
                    <div
                      key={reveal.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                        reveal.status === 'paid' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                      }`}
                      onClick={() => setRevealId(reveal.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {reveal.boyName} ou {reveal.girlName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {reveal.dadName} & {reveal.momName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {reveal.contactEmail || 'Sem email'}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          reveal.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {reveal.status === 'paid' ? '✓ Pago' : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        {reveal.id}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
