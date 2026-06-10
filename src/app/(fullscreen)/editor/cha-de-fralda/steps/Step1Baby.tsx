"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBabyShowerEditor } from '@/contexts/BabyShowerEditorContext';
import { Button } from '@/components/ui/Button';
import { Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import type { BabyGender } from '@/types/baby-shower';

const GENDER_OPTIONS: { value: BabyGender; label: string; emoji: string }[] = [
  { value: 'menina', label: 'Menina', emoji: '👧' },
  { value: 'menino', label: 'Menino', emoji: '👦' },
  { value: 'surpresa', label: 'Surpresa', emoji: '🎁' },
];

/** Sugestões de mensagem de boas-vindas — {bebe} é trocado pelo nome (ou fallback carinhoso). */
const WELCOME_SUGGESTIONS: { label: string; text: string }[] = [
  { label: '💕 Carinhosa', text: 'Estamos muito felizes em compartilhar esse momento com você! Sua presença é o nosso maior presente.' },
  { label: '🍼 Convite clássico', text: 'Com muito amor, convidamos você para celebrar a chegada {bebe}. Vai ser uma tarde cheia de carinho e alegria!' },
  { label: '🧸 Cheia de amor', text: 'Cada fralda e cada abraço fazem parte dessa nova história. Venha fazer parte da chegada {bebe}!' },
  { label: '🌿 Delicada', text: 'Um chá de fralda cheio de amor para receber {bebe}. Conte com a sua presença e o seu carinho nesse dia especial.' },
  { label: '✨ Animada', text: 'Estamos contando os dias para conhecer {bebe} — e queremos você com a gente nessa festa cheia de fofura!' },
];

export function Step1Baby() {
  const { data, updateData, nextStep } = useBabyShowerEditor();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.hostName.trim()) e.hostName = 'Digite o nome do organizador';
    if (!data.babyGender) e.babyGender = 'Selecione o sexo do bebê';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) nextStep();
  };

  // Resolve {bebe} na sugestão com o nome do bebê (ou um fallback carinhoso).
  const resolveSuggestion = (tpl: string) => {
    const name = data.babyName.trim();
    return tpl.replace(/\{bebe\}/g, name ? `do(a) ${name}` : 'do nosso bebê');
  };

  const applySuggestion = (tpl: string) => {
    updateData({ welcomeMessage: resolveSuggestion(tpl) });
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 10 }}
        className="text-6xl mb-6"
      >
        🍼
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-serif text-3xl md:text-4xl text-center mb-3 text-gray-800"
      >
        Vamos criar seu Chá de Fralda
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-gray-600 mb-8 max-w-md"
      >
        Comece com algumas informações sobre o bebê e quem está organizando 💕
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
              className={`w-2.5 h-2.5 rounded-full transition-all ${step === 1 ? 'bg-pink-400 scale-125' : 'bg-pink-200'}`}
            />
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">👶 Sexo do bebê:</label>
          <div className="grid grid-cols-3 gap-3">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateData({ babyGender: opt.value })}
                className={`flex flex-col items-center gap-1 py-4 rounded-xl border-2 transition-all ${
                  data.babyGender === opt.value
                    ? 'border-pink-400 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-200'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-sm text-gray-700">{opt.label}</span>
              </button>
            ))}
          </div>
          {errors.babyGender && <p className="text-red-500 text-sm mt-1">{errors.babyGender}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">🌸 Nome do bebê (opcional):</label>
          <input
            type="text"
            value={data.babyName}
            onChange={(e) => updateData({ babyName: e.target.value })}
            placeholder="Ex: Helena, Theo..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">👤 Nome do organizador:</label>
          <input
            type="text"
            value={data.hostName}
            onChange={(e) => updateData({ hostName: e.target.value })}
            placeholder="Quem está organizando o chá?"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.hostName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
            }`}
          />
          {errors.hostName && <p className="text-red-500 text-sm mt-1">{errors.hostName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">💑 Nome do(a) parceiro(a) (opcional):</label>
          <input
            type="text"
            value={data.partnerName}
            onChange={(e) => updateData({ partnerName: e.target.value })}
            placeholder="Mamãe e/ou papai"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">👥 Quantos convidados você espera?</label>
          <input
            type="number"
            min={0}
            value={data.guestCount || ''}
            onChange={(e) => updateData({ guestCount: Math.max(0, Number(e.target.value)) })}
            placeholder="Ex: 50"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
          />
          <p className="text-xs text-gray-500 mt-1">
            Usamos esse número para sugerir as quantidades de fraldas e mimos automaticamente. 🍼
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">💌 Mensagem de boas-vindas (opcional):</label>

          <textarea
            value={data.welcomeMessage}
            onChange={(e) => updateData({ welcomeMessage: e.target.value })}
            placeholder="Uma mensagem carinhosa para os convidados..."
            rows={4}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 resize-none"
          />

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-medium transition-colors"
            >
              <Sparkles size={13} />
              Ver sugestões
              {showSuggestions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <p className="text-xs text-gray-500">{data.welcomeMessage.length}/2000</p>
          </div>

          {/* Painel de sugestões — mesmo padrão do editor das 12 Cartas */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid gap-2 pt-1">
                  {WELCOME_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      type="button"
                      onClick={() => applySuggestion(suggestion.text)}
                      className="text-left p-3 rounded-xl border-2 border-pink-100 bg-pink-50 hover:border-pink-300 hover:bg-pink-100 transition-all"
                    >
                      <p className="text-xs font-semibold text-pink-700 mb-1">{suggestion.label}</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{resolveSuggestion(suggestion.text)}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-4">
          <Button onClick={handleNext} size="lg" className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold">
            Continuar →
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
