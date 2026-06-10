"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBabyShowerEditor } from '@/contexts/BabyShowerEditorContext';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';
// LANÇAMENTO GRATUITO — preço desativado: import { usePrices } from '@/hooks/usePrices';
import { analytics } from '@/lib/analytics';

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

export function Step4Contact() {
  const { data, updateData, prevStep, goToCheckout, isLoading, error } = useBabyShowerEditor();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmEmail, setConfirmEmail] = useState('');
  // LANÇAMENTO GRATUITO — preço desativado (reativar com o checkout):
  // const { prices } = usePrices();
  // const babyShowerPrice = prices['baby-shower'];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.contactName.trim()) e.contactName = 'Digite seu nome';
    if (!data.contactEmail.trim()) {
      e.contactEmail = 'Digite seu email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
      e.contactEmail = 'Email inválido';
    }
    if (!confirmEmail.trim()) {
      e.confirmEmail = 'Confirme seu email';
    } else if (confirmEmail.toLowerCase() !== data.contactEmail.toLowerCase()) {
      e.confirmEmail = 'Os emails não coincidem';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ contactPhone: formatPhone(e.target.value) });
  };

  const handleCheckout = async () => {
    if (validate()) {
      analytics.completeEditor('baby-shower');
      // LANÇAMENTO GRATUITO — sem pagamento (reativar com o checkout):
      // analytics.initiatePayment('baby-shower', babyShowerId || 'unknown');
      await goToCheckout();
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 10 }}
        className="text-6xl mb-6"
      >
        🎉
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-serif text-3xl md:text-4xl text-center mb-3 text-gray-800"
      >
        Quase lá!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-gray-600 mb-8 max-w-md"
      >
        Só precisamos dos seus dados para enviar o link do convite e o painel 📧
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-2.5 h-2.5 rounded-full transition-all ${step === 5 ? 'bg-pink-400 scale-125' : 'bg-pink-200'}`}
            />
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">👤 Seu Nome:</label>
          <input
            type="text"
            value={data.contactName}
            onChange={(e) => updateData({ contactName: e.target.value })}
            placeholder="Como podemos te chamar?"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.contactName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
            }`}
          />
          {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">📧 Seu Email:</label>
          <input
            type="email"
            value={data.contactEmail}
            onChange={(e) => updateData({ contactEmail: e.target.value })}
            placeholder="email@exemplo.com"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.contactEmail ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
            }`}
          />
          {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">📧 Confirme seu Email:</label>
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="Digite novamente seu email"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.confirmEmail ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
            }`}
          />
          {errors.confirmEmail && <p className="text-red-500 text-sm mt-1">{errors.confirmEmail}</p>}
          <p className="text-xs text-gray-500 mt-1">Enviaremos o link do convite e o painel para este email</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">📱 Seu Telefone (opcional):</label>
          <input
            type="tel"
            value={data.contactPhone}
            onChange={handlePhoneChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
          />
        </div>

        {/* LANÇAMENTO GRATUITO — caixa de preço desativada (reativar quando voltar a cobrar): */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-gray-800">Grátis 🎉</p>
          <p className="text-sm text-emerald-600 font-medium mt-1">🎁 Lançamento gratuito por tempo limitado!</p>
        </div>
        {/*
        // PREÇO (DESATIVADO):
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6 text-center">
          {babyShowerPrice?.priceFromFormatted && (
            <p className="text-gray-500 line-through text-sm">De {babyShowerPrice.priceFromFormatted}</p>
          )}
          <p className="text-3xl font-bold text-gray-800">{babyShowerPrice?.priceFormatted || 'R$ 19,90'}</p>
          <p className="text-sm text-pink-600 font-medium mt-1">🎁 Promoção de Lançamento!</p>
        </div>
        */}

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
          <p className="font-medium text-gray-800 text-sm">O que você recebe:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Link do convite para compartilhar com convidados</li>
            <li>✅ QR Code para imprimir</li>
            <li>✅ Confirmação de presença (RSVP)</li>
            <li>✅ Lista de presentes com reserva automática</li>
            <li>✅ Painel para acompanhar tudo + recados</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button onClick={prevStep} variant="outline" size="lg" className="flex-1" disabled={isLoading}>
            ← Voltar
          </Button>
          <Button
            onClick={handleCheckout}
            size="lg"
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              'Criar meu Chá de Fralda →'
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center">✨ Gratuito · sem cartão de crédito</p>
      </motion.div>
    </div>
  );
}
