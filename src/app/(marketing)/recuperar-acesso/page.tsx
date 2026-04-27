'use client';

import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error' | 'rate-limited';

export default function RecuperarAcessoPage() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');

    try {
      const res = await fetch('/api/painel/recuperar-acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.status === 429) {
        setState('rate-limited');
        return;
      }

      if (!res.ok) {
        setState('error');
        return;
      }

      setState('success');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif text-[#8B5F5F] mb-2">
            Recuperar acesso
          </h1>
          <p className="text-sm text-muted-foreground">
            Informe o email usado na compra e enviaremos os links dos seus painéis.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E6C2C2] rounded-2xl p-8 shadow-sm">
          {state === 'success' ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-4">💌</div>
              <p className="text-[#4A4A4A] text-sm leading-relaxed">
                Se houver compras associadas a esse email, você receberá os links em instantes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#8B5F5F] mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={state === 'loading'}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6C2C2] bg-[#FFFAFA] text-[#4A4A4A] placeholder:text-[#c4b0b0] focus:outline-none focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent transition disabled:opacity-60"
                />
              </div>

              {/* Error messages */}
              {state === 'rate-limited' && (
                <p className="text-sm text-red-500 mb-4">
                  Muitas tentativas. Tente novamente em 1 hora.
                </p>
              )}
              {state === 'error' && (
                <p className="text-sm text-red-500 mb-4">
                  Ocorreu um erro. Por favor, tente novamente.
                </p>
              )}

              <button
                type="submit"
                disabled={state === 'loading' || !email}
                className="w-full py-3 px-6 rounded-full bg-[#D4A5A5] text-white font-serif text-base tracking-wide hover:bg-[#c49090] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {state === 'loading' ? 'Enviando...' : 'Enviar links'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
