"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGenderRevealEditor } from '@/contexts/GenderRevealEditorContext';
import { Button } from '@/components/ui/Button';
import { Sparkles, X, ExternalLink } from 'lucide-react';

const MESSAGE_SUGGESTIONS = [
  {
    title: "💕 Romântico e Emocionante",
    text: `Oláaa! Se você recebeu esse link, saiba que é uma pessoa muito especial pra gente e vai ser muito importante na vida do baby que está chegando! 🥰

A mamãe e o papai se conheceram há alguns anos, numa história que parecia destino. Foi amor à primeira vista — pelo menos pro papai! 😄

Depois de muitas aventuras juntos, eles descobriram que eu estava a caminho! Foi numa manhã especial, com um teste de farmácia e muitas lágrimas de alegria.

Agora eles estão contando os dias pra me conhecer. E querem que você faça parte desse momento tão especial!`
  },
  {
    title: "😄 Divertido e Descontraído",
    text: `E aí, pessoal! 👋

Se você tá vendo isso, parabéns! Você foi escolhido(a) pra descobrir o segredo mais bem guardado dos últimos meses!

A mamãe tá com um forninho funcionando e o papai tá surtando de ansiedade (mas finge que tá de boa 😂).

Eles queriam muito que você participasse desse momento maluco e emocionante. Então bora lá descobrir se vem aí um mini jogador de futebol ou uma mini princesa!`
  },
  {
    title: "🌟 Simples e Carinhoso",
    text: `Olá, pessoa querida! 💖

Você está recebendo esse convite especial porque faz parte da nossa história e queremos que faça parte desse momento único também.

Em breve nossa família vai crescer e estamos muito felizes em compartilhar essa novidade com você!

Preparamos essa surpresa com muito carinho. Esperamos que goste tanto quanto nós!`
  },
  {
    title: "👨‍👩‍👧 Para a Família",
    text: `Querida família! 🏠💕

Vocês sempre foram nosso porto seguro e agora queremos dividir a maior alegria das nossas vidas!

Depois de muita espera e muitas orações, Deus nos abençoou com esse presente maravilhoso que está a caminho.

Queríamos que vocês fossem os primeiros a descobrir se vem aí mais um netinho ou netinha, sobrinho ou sobrinha pra encher a família de amor!`
  },
];

export function Step2ParentsInfo() {
  const { data, updateData, nextStep, prevStep } = useGenderRevealEditor();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.dadName.trim()) {
      newErrors.dadName = 'Digite o nome do papai';
    }
    if (!data.momName.trim()) {
      newErrors.momName = 'Digite o nome da mamãe';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
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
        💕
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-serif text-3xl md:text-4xl text-center mb-3 text-gray-800"
      >
        Agora conta mais sobre vocês!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-gray-600 mb-8 max-w-md"
      >
        Quem são os papais sortudos que vão receber {babyName || 'o bebê'}? 🥰
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
                  step === 2 ? 'bg-pink-400 scale-125' : step < 2 ? 'bg-pink-300' : 'bg-gray-300'
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

        {/* Dad Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👨 Nome do Papai:
          </label>
          <input
            type="text"
            value={data.dadName}
            onChange={(e) => updateData({ dadName: e.target.value })}
            placeholder="Ex: Lucas, Pedro, João..."
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              errors.dadName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-400'
            }`}
          />
          {errors.dadName && (
            <p className="text-red-500 text-sm mt-1">{errors.dadName}</p>
          )}
        </div>

        {/* Mom Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👩 Nome da Mamãe:
          </label>
          <input
            type="text"
            value={data.momName}
            onChange={(e) => updateData({ momName: e.target.value })}
            placeholder="Ex: Camila, Ana, Maria..."
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 ${
              errors.momName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-pink-400'
            }`}
          />
          {errors.momName && (
            <p className="text-red-500 text-sm mt-1">{errors.momName}</p>
          )}
        </div>

        {/* Story Message */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              💌 Mensagem para quem receber (opcional):
            </label>
            <button
              type="button"
              onClick={() => setShowSuggestions(true)}
              className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 font-medium transition-colors"
            >
              <Sparkles size={14} />
              Ver sugestões
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Conte um pouco da história de vocês! Como se conheceram, como descobriram a gravidez...
          </p>
          <textarea
            value={data.storyMessage}
            onChange={(e) => updateData({ storyMessage: e.target.value })}
            placeholder="Oláaa! Se você recebeu esse link, saiba que é uma pessoa muito especial pra gente..."
            rows={6}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">
            {data.storyMessage.length}/2000 caracteres
          </p>
        </div>

        {/* Suggestions Modal */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSuggestions(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-serif text-lg text-gray-800">✨ Sugestões de Mensagem</h3>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
                  {MESSAGE_SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        updateData({ storyMessage: suggestion.text });
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all"
                    >
                      <p className="font-medium text-gray-800 mb-2">{suggestion.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{suggestion.text.substring(0, 150)}...</p>
                    </button>
                  ))}
                </div>
                <div className="p-4 border-t bg-gray-50">
                  <p className="text-xs text-gray-500 text-center">
                    Clique em uma sugestão para usar como base. Você pode editar depois!
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={prevStep}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            ← Voltar
          </Button>
          <Button
            onClick={handleNext}
            size="lg"
            className="flex-1 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-semibold shadow-lg"
          >
            Continuar →
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
