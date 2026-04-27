# Spec 2.3 — Tarefas

## Preparação

- [x] **P1.** Validar que Spec 2.1 já está implementada (`CARD_COLLECTION_CONFIG.totalSteps === 4`)
- [x] **P2.** Inspecionar componentes de viewer
- [x] **P3.** Verificar onde `contactPhone` é validado — removido do form
- [x] **P4.** Verificar schema do banco — `contact_phone` já é NULLABLE (sem migration nova)

## Implementação

- [x] **T1.** Criar `Step4Preview.tsx`:
  - useState para contactName, contactEmail, errors, isCheckingOut
  - **Removido**: tudo relacionado a `contactPhone`
  - Manter: validateFields, handleFinalize, analytics calls
  - setStepValidation com índice 3
- [x] **T2.** Bloco preview no topo do step:
  - Header gradiente com título da 1ª carta
  - Foto com fallback da capa
  - Mensagem da 1ª carta
- [x] **T3.** Bloco "11 cartas embaçadas":
  - Grid 4×3 com 11 placeholders
  - Cada placeholder: aspect-ratio 3:4, fundo neutro, blur, ícone de cadeado (Lock de lucide-react)
  - Microcopy: "🔒 Libere as 11 restantes agora"
- [x] **T4.** Form (bloco inferior):
  - Apenas: contactName, contactEmail (sem telefone)
  - Order summary no formato Spec 1.2
  - WizardNavigation com `finalizeLabel="💌 Presentear ${truncatedName} agora"` (truncar >30 chars)
- [x] **T5.** Editar `src/app/(fullscreen)/editor/12-cartas/page.tsx`:
  - Import: `Step4Preview`
  - `currentStep === 3`: renderiza `<Step4Preview />`
  - `STEP_NAMES[3]`: 'Pré-visualização e Checkout'
- [x] **T6.** Editar `src/types/interactive-wizard.ts`:
  - `CARD_COLLECTION_CONFIG.totalSteps: 4`
- [x] **T7.** API `/api/checkout/card-collection` aceita só `collectionId` — telefone não era obrigatório
- [x] **T8.** `contact_phone` já NULLABLE no banco — sem migration nova
- [x] **T9.** Deletar `Step6Contact.tsx` ✅

## Verificação

- [x] **V1.** `npm run build` passa
- [x] **V2.** `npx tsc --noEmit` passa (erros apenas em testes pré-existentes)
- [ ] **V3.** Smoke test E2E completo:
  1. Abrir `/editor/12-cartas` — 4 bolinhas no progress
  2. Step 1: nomes
  3. Step 2: intro + foto capa
  4. Step 3: editar 1-2 cartas
  5. Step 4: ver 1ª carta + 11 embaçadas
  6. Submeter form sem telefone
  7. Redirect pro Mercado Pago funciona
  8. Webhook processa pedido sem erro
- [ ] **V4.** Mobile (375px): demo ao vivo carrega, scroll suave
- [ ] **V5.** Coleção criada antes da Spec (com telefone): editar volta a funcionar (não regredir)

## Out of scope

- Schema migration removendo coluna `contact_phone` (deixar nullable basta)
- Página `/delivery` ou `/dashboard` (Fase 3)
- Mudanças no Mercado Pago além de aceitar `contactPhone` opcional
- Captura de telefone para marketing (futuro)
