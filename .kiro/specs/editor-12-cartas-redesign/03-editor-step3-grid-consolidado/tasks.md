# Spec 2.1 — Tarefas

## Preparação

- [x] **P1.** Verificar visualmente que `CardGridView` aceita 12 cartas sem layout quebrado
- [x] **P2.** Confirmar que `CARD_COLLECTION_CONFIG` está em `src/types/interactive-wizard.ts` e tem `totalSteps`

## Implementação

- [x] **T1.** Criar `Step3AllCards.tsx` reaproveitando lógica de Step3Cards1to4:
  - Mesmo `useState` para activeModal e activeCardId
  - Mesmos handlers (handleEditMessage, handleEditPhoto, handleSaveMessage, handleSavePhoto, handleRemovePhoto)
  - Renderizar 3 `<CardGridView>` com slices: cards.slice(0,4), cards.slice(4,8), cards.slice(8,12)
  - Cada um precedido por header H3 com emoji e label
- [x] **T2.** Microcopy de abertura: "✨ Já preparamos as 12 cartas com IA — toque em qualquer uma para personalizar"
- [x] **T3.** Manter avisos existentes (AI Notice, Photo tip) consolidados em 1 box no topo
- [x] **T4.** Editar `src/app/(fullscreen)/editor/12-cartas/page.tsx`:
  - Remover imports: Step3Cards1to4, Step4Cards5to8, Step5Cards9to12
  - Adicionar import: Step3AllCards
  - Atualizar `STEP_NAMES`
  - Substituir 3 blocos AnimatePresence por 1 bloco com Step3AllCards
  - Step4Preview em `currentStep === 3`
- [x] **T5.** Editar `src/types/interactive-wizard.ts`:
  - `CARD_COLLECTION_CONFIG.totalSteps: 4` (já inclui redução da Spec 2.3)
- [x] **T6.** Deletar arquivos:
  - `src/app/(fullscreen)/editor/12-cartas/steps/Step3Cards1to4.tsx` ✅
  - `src/app/(fullscreen)/editor/12-cartas/steps/Step4Cards5to8.tsx` ✅
  - `src/app/(fullscreen)/editor/12-cartas/steps/Step5Cards9to12.tsx` ✅

## Verificação

- [x] **V1.** `npm run build` passa
- [x] **V2.** `npx tsc --noEmit` passa (erros apenas em testes pré-existentes)
- [ ] **V3.** Smoke test no editor `/editor/12-cartas`:
  1. Abrir editor — deve carregar com 4 bolinhas no progress
  2. Step 1: preencher nomes
  3. Step 2: ver intro + foto capa
  4. Step 3 (novo): ver 12 cartas agrupadas em 3 seções
  5. Editar mensagem de carta 1 — modal abre, salva, fecha
  6. Editar foto de carta 5 — modal abre, salva, fecha
  7. Step 4: chega no Preview + Checkout
- [ ] **V4.** Mobile (DevTools 375px): scroll vertical suportável, sem layout quebrado
- [ ] **V5.** Validation: `useInteractiveWizardValidation` para o novo step 2 (cards) continua funcionando

## Out of scope

- Refator do `CardGridView`
- Nudge de personalização → MVP 2
