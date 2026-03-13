'use client';

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * Test page to manually update message status to 'paid'
 * Simulates what the webhook does after successful payment
 * 
 * ONLY FOR TESTING - Remove in production
 */
export default function TestUpdateMessageStatusPage() {
  const [messageId, setMessageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (!messageId.trim()) {
      setError('Por favor, insira um Message ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test/update-message-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId: messageId.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao atualizar mensagem');
      }

      setResult(data);
    } catch (err) {
      console.error('Error updating message:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container px-4 md:px-8 max-w-2xl mx-auto space-y-8">

        {/* Warning Banner */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  ⚠️ Página de Teste - Apenas para Desenvolvimento
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Esta página simula o que o webhook do Stripe faz após um pagamento bem-sucedido.
                  Use apenas para testar mensagens que ficaram com status "pending".
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>Atualizar Status da Mensagem</CardTitle>
            <CardDescription>
              Simula o processamento do webhook do Stripe para atualizar uma mensagem para "paid"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Instructions */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">O que esta ferramenta faz:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Atualiza o status da mensagem para "paid"</li>
                <li>Gera o slug da mensagem</li>
                <li>Gera o QR Code</li>
                <li>Salva tudo no banco de dados</li>
              </ul>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <label htmlFor="messageId" className="text-sm font-medium">
                Message ID (UUID)
              </label>
              <input
                id="messageId"
                type="text"
                value={messageId}
                onChange={(e) => setMessageId(e.target.value)}
                placeholder="ex: 123e4567-e89b-12d3-a456-426614174000"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Você pode encontrar o ID no banco de dados ou nos logs do servidor
              </p>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleUpdate}
              disabled={loading || !messageId.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Atualizar para "Paid" e Gerar QR Code'
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Erro</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Display */}
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      ✅ Mensagem atualizada com sucesso!
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">Message ID:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{result.messageId}</code>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <span className="text-green-600 font-medium">{result.status}</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">Slug:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{result.slug}</code>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">QR Code:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{result.qrCodeUrl}</code>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">URL Pública:</span>
                    <a 
                      href={result.fullUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline break-all"
                    >
                      {result.fullUrl}
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-green-200 space-y-2">
                  <a 
                    href={result.deliveryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      Ver Página de Entrega
                    </Button>
                  </a>
                  <a 
                    href={result.fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full">
                      Ver Mensagem Pública
                    </Button>
                  </a>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* SQL Query Helper */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comandos SQL Úteis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Ver mensagens pendentes:
              </p>
              <code className="block text-xs bg-muted p-2 rounded">
                SELECT id, recipient_name, status, created_at FROM messages WHERE status = 'pending' ORDER BY created_at DESC;
              </code>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Ver última mensagem criada:
              </p>
              <code className="block text-xs bg-muted p-2 rounded">
                SELECT id, recipient_name, status, created_at FROM messages ORDER BY created_at DESC LIMIT 1;
              </code>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
