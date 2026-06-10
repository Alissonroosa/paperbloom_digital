"use client";

import { motion } from 'framer-motion';
import { useBabyShowerEditor } from '@/contexts/BabyShowerEditorContext';
import { Button } from '@/components/ui/Button';

export function Step2Event() {
  const { data, updateData, nextStep, prevStep } = useBabyShowerEditor();

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 10 }}
        className="text-6xl mb-6"
      >
        📍
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-serif text-3xl md:text-4xl text-center mb-3 text-gray-800"
      >
        Detalhes do evento
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-gray-600 mb-8 max-w-md"
      >
        Onde e quando será o chá? (tudo opcional, preencha o que quiser)
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
              className={`w-2.5 h-2.5 rounded-full transition-all ${step === 2 ? 'bg-pink-400 scale-125' : 'bg-pink-200'}`}
            />
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">📅 Data e hora:</label>
          <input
            type="datetime-local"
            value={data.eventDate}
            onChange={(e) => updateData({ eventDate: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">🏠 Local (nome):</label>
          <input
            type="text"
            value={data.locationName}
            onChange={(e) => updateData({ locationName: e.target.value })}
            placeholder="Ex: Casa da vovó, Salão de festas..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">🗺️ Endereço:</label>
          <input
            type="text"
            value={data.locationAddress}
            onChange={(e) => updateData({ locationAddress: e.target.value })}
            placeholder="Rua, número, bairro, cidade"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">🔗 Link do Google Maps (opcional):</label>
          <input
            type="url"
            value={data.locationMapsUrl}
            onChange={(e) => updateData({ locationMapsUrl: e.target.value })}
            placeholder="https://maps.google.com/..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={prevStep} variant="outline" size="lg" className="flex-1">
            ← Voltar
          </Button>
          <Button onClick={nextStep} size="lg" className="flex-1 bg-pink-400 hover:bg-pink-500 text-white font-semibold">
            Continuar →
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
