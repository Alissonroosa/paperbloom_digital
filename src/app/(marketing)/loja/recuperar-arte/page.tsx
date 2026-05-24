'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export default function RecuperarArtePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/loja/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok && response.status !== 200) {
        throw new Error('Erro na requisição');
      }

      setSubmitted(true);
    } catch {
      setError('Ocorreu um erro. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFAFA] to-white flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span
            style={{ fontFamily: 'Georgia, serif' }}
            className="text-3xl text-[#D4A5A5] mb-3 block"
          >
            🌸
          </span>
          <h1
            style={{ fontFamily: 'Georgia, serif' }}
            className="text-3xl font-bold text-[#8B5F5F] mb-3"
          >
            Recuperar minha arte
          </h1>
          <p className="text-[#4A4A4A] text-sm leading-relaxed">
            Digite o email usado na compra e enviaremos os links das suas artes.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E6C2C2] shadow-sm p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✅</span>
              </div>
              <h2
                style={{ fontFamily: 'Georgia, serif' }}
                className="text-xl text-[#8B5F5F] mb-3"
              >
                Email enviado!
              </h2>
              <p className="text-[#4A4A4A] text-sm leading-relaxed">
                Se houver compras com esse email, você receberá um email em alguns minutos.
                Verifique também o spam.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email da compra</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button
                type="submit"
                id="btn-recuperar-arte"
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? 'Enviando...' : 'Recuperar minha arte'}
              </Button>

              <p className="text-xs text-center text-[#a09090]">
                Por segurança, não informamos quais emails possuem compras.
              </p>
            </form>
          )}
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a
            href="/loja"
            className="text-sm text-[#D4A5A5] hover:text-[#8B5F5F] transition-colors"
          >
            ← Voltar para a loja
          </a>
        </div>
      </div>
    </div>
  );
}
