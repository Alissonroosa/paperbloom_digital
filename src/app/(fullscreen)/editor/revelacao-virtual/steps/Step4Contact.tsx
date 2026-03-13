"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGenderRevealEditor } from '@/contexts/GenderRevealEditorContext';
import { Button } from '@/components/ui/Button';
import { Loader2, ExternalLink } from 'lucide-react';
import { usePrices } from '@/hooks/usePrices';

// Função para formatar telefone
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

export function Step4Contact() {
  const { data, updateData, prevStep, goToCheckout, isLoading, error } = useGenderRevealEditor();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmEmail, setConfirmEmail] = useState('');
  const { prices } = usePrices();
  const genderRevealPrice = prices['gender-reveal'];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.contactName.trim()) {
      newErrors.contactName = 'Digite seu nome';
    }
    if (!data.contactEmail.trim()) {
      newErrors.contactEmail = 'Digite seu email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
      newErrors.contactEmail = 'Email inválido';
    }
    if (!confirmEmail.trim()) {
      newErrors.confirmEmail = 'Confirme seu email';
    } else if (confirmEmail.toLowerCase() !== data.contactEmail.toLowerCase()) {
      newErrors.confirmEmail = 'Os emails não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    updateData({ contactPhone: formatted });
  };

  const handleCheckout = async () => {
    if (validate()) {
      await goToCheckout();
    }
  };

  const babyName = data.actualGender === 'menino' ? data.boyName : data.girlName;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 10 }}
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
        Só precisamos dos seus dados para enviar os links da revelação de {babyName || 'seu bebê'}! 📧
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Progress indicator - inside container */}
        <div className="flex justify-between items-center mb-2">
          <div className="w-16" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === 4 ? 'bg-pink-400 scale-125' : 'bg-pink-300'
                }`}
              />
            ))}
          </div>
          <a
            href="/demo/revelacao-virtual"
            target="_blank"
            className="flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm font-medium"
          >
            <ExternalLink size={14} />
            Demo
          </a>
        </div>

        {/* Contact Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👤 Seu Nome:
          </label>
          <input
            type="text"
            value={data.contactName}
            onChange={(e) => updateData({ contactName: e.target.value })}
            placeholder="Como podemos te chamar?"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.contactName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
            }`}
          />
          {errors.contactName && (
            <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
          )}
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📧 Seu Email:
          </label>
          <input
            type="email"
            value={data.contactEmail}
            onChange={(e) => updateData({ contactEmail: e.target.value })}
            placeholder="email@exemplo.com"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.contactEmail ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
            }`}
          />
          {errors.contactEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
          )}
        </div>

        {/* Confirm Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📧 Confirme seu Email:
          </label>
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="Digite novamente seu email"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.confirmEmail ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
            }`}
          />
          {errors.confirmEmail && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmEmail}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Enviaremos os links da revelação para este email
          </p>
        </div>

        {/* Contact Phone (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📱 Seu Telefone (opcional):
          </label>
          <input
            type="tel"
            value={data.contactPhone}
            onChange={handlePhoneChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
          />
        </div>

        {/* Price Box */}
        <div className="bg-gradient-to-r from-blue-50 to-pink-50 border border-pink-200 rounded-xl p-6 text-center">
          {genderRevealPrice?.priceFromFormatted && (
            <p className="text-gray-500 line-through text-sm">De {genderRevealPrice.priceFromFormatted}</p>
          )}
          <p className="text-3xl font-bold text-gray-800">
            {genderRevealPrice?.priceFormatted || 'R$ 19,90'}
          </p>
          <p className="text-sm text-pink-600 font-medium mt-1">
            🎁 Promoção de Lançamento!
          </p>
        </div>

        {/* What you get */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
          <p className="font-medium text-gray-800 text-sm">O que você recebe:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Link para compartilhar com convidados</li>
            <li>✅ QR Code para imprimir</li>
            <li>✅ Dashboard para acompanhar votos</li>
            <li>✅ Mensagens dos convidados</li>
            <li>✅ Revelação com confetes animados</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={prevStep}
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={isLoading}
          >
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
                Processando...
              </>
            ) : (
              'Finalizar Compra →'
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          🔒 Pagamento seguro via Mercado Pago
        </p>
      </motion.div>
    </div>
  );
}
