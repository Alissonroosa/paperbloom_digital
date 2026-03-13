"use client";

import { GenderRevealEditorProvider, useGenderRevealEditor } from '@/contexts/GenderRevealEditorContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Step1BabyInfo } from './steps/Step1BabyInfo';
import { Step2ParentsInfo } from './steps/Step2ParentsInfo';
import { Step3Photos } from './steps/Step3Photos';
import { Step4Contact } from './steps/Step4Contact';

function EditorContent() {
  const { currentStep } = useGenderRevealEditor();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Step1BabyInfo />
          </motion.div>
        )}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Step2ParentsInfo />
          </motion.div>
        )}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Step3Photos />
          </motion.div>
        )}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Step4Contact />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RevelacaoVirtualEditorPage() {
  return (
    <GenderRevealEditorProvider>
      <EditorContent />
    </GenderRevealEditorProvider>
  );
}
