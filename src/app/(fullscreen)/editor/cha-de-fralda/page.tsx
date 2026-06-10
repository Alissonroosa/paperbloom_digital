"use client";

import { BabyShowerEditorProvider, useBabyShowerEditor } from '@/contexts/BabyShowerEditorContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Step1Baby } from './steps/Step1Baby';
import { Step2Event } from './steps/Step2Event';
import { Step3Gifts } from './steps/Step3Gifts';
import { Step4Theme } from './steps/Step4Theme';
import { Step4Contact } from './steps/Step4Contact';
import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

const STEP_NAMES = ['Bebê e Organizador', 'Detalhes do Evento', 'Lista de Presentes', 'Tema', 'Contato e Pagamento'];

function EditorContent() {
  const { currentStep } = useBabyShowerEditor();
  const hasTrackedStart = useRef(false);
  const lastTrackedStep = useRef<number | null>(null);

  useEffect(() => {
    if (!hasTrackedStart.current) {
      analytics.startEditor('baby-shower');
      hasTrackedStart.current = true;
    }
  }, []);

  useEffect(() => {
    if (lastTrackedStep.current === null) {
      lastTrackedStep.current = currentStep;
      return;
    }
    if (currentStep !== lastTrackedStep.current) {
      analytics.editorStep('baby-shower', currentStep, STEP_NAMES[currentStep - 1] || `Step ${currentStep}`);
      lastTrackedStep.current = currentStep;
    }
  }, [currentStep]);

  const steps = [
    { key: 'step1', node: <Step1Baby /> },
    { key: 'step2', node: <Step2Event /> },
    { key: 'step3', node: <Step3Gifts /> },
    { key: 'step4', node: <Step4Theme /> },
    { key: 'step5', node: <Step4Contact /> },
  ];

  const active = steps[currentStep - 1];

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={active.key}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {active.node}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function ChaDeFraldaEditorPage() {
  return (
    <BabyShowerEditorProvider>
      <EditorContent />
    </BabyShowerEditorProvider>
  );
}
