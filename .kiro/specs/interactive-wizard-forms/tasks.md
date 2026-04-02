# Implementation Plan: Interactive Wizard Forms

## Overview

Este plano implementa o sistema de wizard interativo genérico e migra os editores "12 Cartas" e "Mensagem Digital" para o novo padrão fullscreen, seguindo a referência do editor "Revelação Virtual".

## Tasks

- [x] 1. Criar tipos e configurações do Interactive Wizard
  - [x] 1.1 Criar arquivo de tipos em src/types/interactive-wizard.ts
    - Definir ProductType, GradientConfig, InteractiveWizardConfig
    - Definir AnimationConfig e DEFAULT_ANIMATION_CONFIG
    - Definir StepValidationResult e ValidationConfig
    - Criar CARD_COLLECTION_CONFIG e DIGITAL_MESSAGE_CONFIG
    - _Requirements: 1.1, 1.2, 1.6_

- [x] 2. Implementar InteractiveWizardContext e Provider
  - [x] 2.1 Criar src/contexts/InteractiveWizardContext.tsx
    - Implementar InteractiveWizardState e InteractiveWizardContextType
    - Implementar InteractiveWizardProvider com navegação, validação e auto-save
    - Implementar funções: nextStep, prevStep, goToStep, canNavigateToStep
    - Implementar validação por step e marcação de steps completados
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 2.2 Escrever testes unitários para InteractiveWizardContext
    - Testar navegação entre steps
    - Testar validação e bloqueio de navegação
    - _Requirements: 1.1, 6.3_

- [x] 3. Implementar hooks do Interactive Wizard
  - [x] 3.1 Criar src/hooks/useInteractiveWizard.ts
    - Implementar useInteractiveWizard hook principal
    - Implementar useWizardNavigation hook derivado
    - Implementar useWizardValidation hook derivado
    - _Requirements: 1.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 4. Checkpoint - Verificar contexto e hooks
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implementar componentes visuais compartilhados
  - [x] 5.1 Criar src/components/interactive-wizard/AnimatedEmoji.tsx
    - Implementar animação com scale (0 to 1) e spring physics
    - Suportar delay configurável e className customizável
    - _Requirements: 2.4_

  - [x] 5.2 Criar src/components/interactive-wizard/StepTransition.tsx
    - Implementar transição com Framer Motion AnimatePresence mode="wait"
    - Animar com opacity e x-axis movement (enter from right, exit to left)
    - Duração de 300ms
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 5.3 Criar src/components/interactive-wizard/ProgressIndicator.tsx
    - Exibir dots circulares para cada step
    - Destacar step atual com scale-125 e cor distinta
    - Mostrar steps completados com cor secundária
    - Suportar navegação por clique em steps completados
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.6_

  - [x] 5.4 Criar src/components/interactive-wizard/FullscreenStep.tsx
    - Ocupar 100dvh com conteúdo centralizado
    - Aplicar gradiente de fundo configurável
    - Incluir ProgressIndicator, back link e demo link opcionais
    - Implementar animação staggered do conteúdo (delays: 0.1s, 0.2s, 0.4s, 0.5s, 0.7s)
    - _Requirements: 1.5, 1.6, 2.5, 2.6, 9.1, 9.2, 9.4_

  - [x] 5.5 Criar src/components/interactive-wizard/WizardNavigation.tsx
    - Botão "Continuar →" para steps intermediários
    - Botão "← Voltar" para steps após o primeiro
    - Botão "Finalizar Compra →" para último step
    - Suportar estado de loading e canProceed
    - Touch targets mínimos de 44x44 pixels
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.3_

  - [x] 5.6 Criar src/components/interactive-wizard/index.ts
    - Exportar todos os componentes do módulo
    - _Requirements: 1.1_

- [x] 6. Checkpoint - Verificar componentes visuais
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Migrar Editor 12 Cartas para fullscreen
  - [x] 7.1 Criar src/app/(fullscreen)/editor/12-cartas/page.tsx
    - Mover de (marketing) para (fullscreen) layout
    - Integrar com InteractiveWizardProvider usando CARD_COLLECTION_CONFIG
    - Manter integração com CardCollectionEditorContext existente
    - _Requirements: 4.1, 4.3, 4.6, 4.8_

  - [x] 7.2 Criar steps fullscreen para 12 Cartas
    - Criar src/app/(fullscreen)/editor/12-cartas/steps/Step1Intro.tsx (mensagem inicial)
    - Criar src/app/(fullscreen)/editor/12-cartas/steps/Step2Cards1to4.tsx (cartas 1-4)
    - Criar src/app/(fullscreen)/editor/12-cartas/steps/Step3Cards5to8.tsx (cartas 5-8)
    - Criar src/app/(fullscreen)/editor/12-cartas/steps/Step4Cards9to12.tsx (cartas 9-12)
    - Criar src/app/(fullscreen)/editor/12-cartas/steps/Step5Contact.tsx (dados para envio)
    - Usar emojis temáticos: 💌, 💔, 💝, ✨, 📧
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.7_

  - [x] 7.3 Integrar edição inline de cards no fullscreen
    - Adaptar CardGridView para layout fullscreen
    - Implementar edição de mensagem inline (não modal)
    - Implementar upload de foto inline
    - _Requirements: 4.4, 4.5_

- [x] 8. Checkpoint - Verificar migração 12 Cartas
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Migrar Editor Mensagem Digital para fullscreen
  - [x] 9.1 Criar src/app/(fullscreen)/editor/mensagem/page.tsx
    - Mover de (marketing) para (fullscreen) layout
    - Integrar com InteractiveWizardProvider usando DIGITAL_MESSAGE_CONFIG
    - Manter integração com WizardContext existente
    - _Requirements: 5.1, 5.3, 5.6, 5.8_

  - [x] 9.2 Criar steps fullscreen para Mensagem Digital
    - Criar src/app/(fullscreen)/editor/mensagem/steps/Step1TitleURL.tsx
    - Criar src/app/(fullscreen)/editor/mensagem/steps/Step2Date.tsx
    - Criar src/app/(fullscreen)/editor/mensagem/steps/Step3Message.tsx
    - Criar src/app/(fullscreen)/editor/mensagem/steps/Step4Photos.tsx
    - Criar src/app/(fullscreen)/editor/mensagem/steps/Step5Theme.tsx
    - Criar src/app/(fullscreen)/editor/mensagem/steps/Step6Music.tsx
    - Criar src/app/(fullscreen)/editor/mensagem/steps/Step7Contact.tsx
    - Usar emojis temáticos: 💌, 📅, 💬, 📸, 🎨, 🎵, 📧
    - _Requirements: 5.2, 5.4, 5.5, 5.7_

- [x] 10. Checkpoint - Verificar migração Mensagem Digital
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implementar Auto-Save e Preservação de Dados
  - [x] 11.1 Integrar auto-save no InteractiveWizardContext
    - Salvar em sessionStorage após cada mudança de campo
    - Debounce de 2000ms para evitar escritas excessivas
    - Restaurar estado salvo ao retornar ao editor
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 11.2 Criar componente AutoSaveIndicator para wizard
    - Exibir indicador visual durante salvamento
    - Mostrar timestamp do último salvamento
    - Limpar draft após conclusão da compra
    - _Requirements: 8.4, 8.5, 8.6_

- [x] 12. Implementar Responsividade Mobile
  - [x] 12.1 Ajustar componentes para mobile
    - Usar min-h-[100dvh] para browser chrome mobile
    - Padding responsivo (px-4 mobile, maior desktop)
    - Touch targets mínimos 44x44 pixels
    - Font sizes responsivos (text-3xl mobile, text-4xl desktop)
    - Stack vertical de elementos em mobile
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 12.2 Implementar navegação por gestos touch
    - Swipe left/right para navegação entre steps
    - _Requirements: 9.6_

- [x] 13. Implementar Navegação por Teclado
  - [x] 13.1 Adicionar suporte a teclado no wizard
    - Enter para avançar ao próximo step
    - Escape para voltar ao step anterior
    - _Requirements: 7.5_

- [x] 14. Verificar Compatibilidade com Backend
  - [x] 14.1 Testar integração com APIs existentes
    - Verificar /api/card-collections/* para 12 Cartas
    - Verificar /api/cards/* para 12 Cartas
    - Verificar /api/messages/* para Mensagem Digital
    - Verificar /api/checkout/* para ambos produtos
    - Garantir estrutura de dados inalterada
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 14.2 Implementar tratamento de erros de API
    - Exibir mensagens de erro ao usuário
    - _Requirements: 10.6_

- [x] 15. Final checkpoint - Verificar implementação completa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- O editor de Revelação Virtual serve como referência de implementação
- Os contextos existentes (CardCollectionEditorContext, WizardContext) devem ser preservados
- Checkpoints garantem validação incremental do progresso
