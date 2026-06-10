"use client";

import { motion } from 'framer-motion';
import { useBabyShowerEditor } from '@/contexts/BabyShowerEditorContext';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import { BABY_SHOWER_THEMES } from '@/config/baby-shower-themes';
import type { BabyShowerThemeId } from '@/types/baby-shower';

const THEME_ORDER: BabyShowerThemeId[] = ['safari', 'ursos', 'princesa', 'classic'];

const THEME_TAGLINE: Record<BabyShowerThemeId, string> = {
  safari: 'Leões, girafas e aventura',
  ursos: 'Ursinhos fofos e aconchego',
  princesa: 'Coroas, castelos e encanto',
  classic: 'Delicado e atemporal',
};

export function Step4Theme() {
  const { data, updateData, nextStep, prevStep } = useBabyShowerEditor();

  return (
    <div className="min-h-[100dvh] flex flex-col items-center px-4 py-10">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 10 }}
        className="text-6xl mb-4"
      >
        🎨
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-serif text-3xl md:text-4xl text-center mb-3 text-gray-800"
      >
        Escolha o tema
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-gray-600 mb-6 max-w-md"
      >
        O tema dá a cara do convite que seus convidados vão ver — cores, ícones e clima combinando. 💕
      </motion.p>

      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`w-2.5 h-2.5 rounded-full transition-all ${step === 4 ? 'bg-pink-400 scale-125' : 'bg-pink-200'}`}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-lg space-y-6"
      >
        <div className="grid grid-cols-2 gap-3">
          {THEME_ORDER.map((id) => {
            const theme = BABY_SHOWER_THEMES[id];
            const selected = data.theme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => updateData({ theme: id })}
                className="relative rounded-2xl overflow-hidden border-2 transition-all text-left"
                style={{ borderColor: selected ? theme.accent : 'rgba(0,0,0,0.08)' }}
              >
                {/* Preview do tema */}
                <div
                  className="p-5 text-center"
                  style={{ background: `linear-gradient(to bottom right, ${theme.pageBgFrom}, ${theme.pageBgVia}, ${theme.pageBgTo})` }}
                >
                  <div className="flex justify-center gap-1.5 text-2xl mb-2">
                    {theme.decorations.slice(0, 4).map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>
                  <p className="font-serif text-base" style={{ color: theme.heading }}>
                    {theme.name}
                  </p>
                  {/* Mini "botão" pra dar a sensação da cor de destaque */}
                  <div
                    className="mt-2 mx-auto w-20 h-2 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
                <div className="px-3 py-2 bg-white">
                  <p className="text-xs text-gray-600">{THEME_TAGLINE[id]}</p>
                </div>

                {selected && (
                  <div
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
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
