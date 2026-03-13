"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGenderRevealEditor } from '@/contexts/GenderRevealEditorContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function Step1BabyInfo() {
  const { data, updateData, nextStep } = useGenderRevealEditor();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.boyName.trim()) {
      newErrors.boyName = 'Digite o nome caso seja menino';
    }
    if (!data.girlName.trim()) {
      newErrors.girlName = 'Digite o nome caso seja menina';
    }
    if (!data.actualGender) {
      newErrors.actualGender = 'Selecione o sexo real do bebê';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 10 }}
        className="text-6xl mb-6"
      >
        🧸
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-serif text-3xl md:text-4xl text-center mb-3 text-gray-800"
      >
        Vamos começar pelo mais importante!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-gray-600 mb-8 max-w-md"
      >
        Qual nome vocês escolheram para o bebê? E o mais importante... é menino ou menina? 🤫
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Progress indicator - inside container */}
        <div className="flex justify-between items-center mb-2">
          <Link 
            href="/"
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            ← Voltar
          </Link>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === 1 ? 'bg-pink-400 scale-125' : 'bg-gray-300'
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
        {/* Boy Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💙 Se for menino, o nome será:
          </label>
          <input
            type="text"
            value={data.boyName}
            onChange={(e) => updateData({ boyName: e.target.value })}
            placeholder="Ex: Miguel, Arthur, Heitor..."
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              errors.boyName ? 'border-red-300 bg-red-50' : 'border-blue-200 focus:border-blue-400'
            }`}
          />
          {errors.boyName && (
            <p className="text-red-500 text-sm mt-1">{errors.boyName}</p>
          )}
        </div>

        {/* Girl Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            💖 Se for menina, o nome será:
          </label>
          <input
            type="text"
            value={data.girlName}
            onChange={(e) => updateData({ girlName: e.target.value })}
            placeholder="Ex: Helena, Alice, Laura..."
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.girlName ? 'border-red-300 bg-red-50' : 'border-pink-200 focus:border-pink-400'
            }`}
          />
          {errors.girlName && (
            <p className="text-red-500 text-sm mt-1">{errors.girlName}</p>
          )}
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            🤫 E o segredo que só vocês sabem...
          </label>
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={() => updateData({ actualGender: 'menino' })}
              className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all ${
                data.actualGender === 'menino'
                  ? 'border-blue-400 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="text-3xl mb-2">💙</div>
              <div className="font-medium text-gray-800">É Menino!</div>
            </button>
            <button
              type="button"
              onClick={() => updateData({ actualGender: 'menina' })}
              className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all ${
                data.actualGender === 'menina'
                  ? 'border-pink-400 bg-pink-50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
              }`}
            >
              <div className="text-3xl mb-2">💖</div>
              <div className="font-medium text-gray-800">É Menina!</div>
            </button>
          </div>
          {errors.actualGender && (
            <p className="text-red-500 text-sm mt-2 text-center">{errors.actualGender}</p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="pt-4"
        >
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-semibold shadow-lg"
          >
            Continuar →
          </Button>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-xs text-gray-400 mt-8 text-center"
      >
        Fique tranquilo(a), o segredo está seguro conosco! 🤐
      </motion.p>
    </div>
  );
}
