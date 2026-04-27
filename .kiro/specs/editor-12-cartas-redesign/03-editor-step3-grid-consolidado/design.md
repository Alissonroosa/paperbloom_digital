# Spec 2.1 — Editor: Consolidar Steps 3-5 em Grid Único

## Problema

O editor tem **3 steps consecutivos quase idênticos** (3, 4, 5) — cada um mostrando 4 cartas com a mesma UI, só mudando o título. Para o usuário isso é:

- **Repetição sem propósito**: parece que está andando, mas só vê variações do mesmo layout
- **Sensação de "ainda falta muito"**: 6 steps no progress bar é desanimador
- **Falsa obrigatoriedade**: como cada step pede explicitamente edição, gera culpa em quem aceita o template — apesar dele ser bom

Combinado com o fato de que **as 12 cartas já vêm pré-preenchidas com IA**, a maior parte dos usuários só clica "Continuar" 3x — o que adiciona 3 transições desnecessárias entre o início do editor e o checkout.

## Objetivo

Consolidar Steps 3, 4 e 5 em **1 único step** mostrando as 12 cartas em grid agrupado por categoria. O usuário vê o trabalho pronto, edita o que quiser, e segue. Reduz o editor de **6 → 5 steps** (e abre caminho para Spec 2.3 reduzir para 4).

## Escopo (in)

- Criar `Step3AllCards.tsx` em `src/app/(fullscreen)/editor/12-cartas/steps/`
- Reaproveitar `CardGridView` (já existe — passar todos os 12 cards de uma vez)
- Agrupar visualmente em **3 seções com headers leves**:
  - "💔 Para os momentos difíceis (1-4)"
  - "💝 Para os momentos de amor (5-8)"
  - "🎁 Para os momentos especiais (9-12)"
- Microcopy de abertura: "✨ Já preparamos as 12 cartas com IA — toque em qualquer uma para personalizar"
- Atualizar `src/app/(fullscreen)/editor/12-cartas/page.tsx`:
  - Remover imports de Step3Cards1to4, Step4Cards5to8, Step5Cards9to12
  - Substituir os 3 blocos `currentStep === 2|3|4` por 1 bloco `currentStep === 2` renderizando Step3AllCards
  - Renumerar Step6Contact para `currentStep === 3`
  - Atualizar `STEP_NAMES` (5 entradas em vez de 6)
- Atualizar `CARD_COLLECTION_CONFIG.totalSteps: 6 → 5` em `src/types/interactive-wizard.ts`
- Deletar `Step3Cards1to4.tsx`, `Step4Cards5to8.tsx`, `Step5Cards9to12.tsx`

## Escopo (out)

- Mudanças no componente `CardGridView` em si
- Mudanças nos modais (`EditMessageModal`, `PhotoUploadModal`)
- Mudanças na lógica de geração de templates IA
- Nudge "que tal personalizar pelo menos 1-2?" → MVP 2
- Foto capa única → Spec 2.4 (paralela)

## Mudanças técnicas principais

### Arquivos criados
- `src/app/(fullscreen)/editor/12-cartas/steps/Step3AllCards.tsx`

### Arquivos editados
- `src/app/(fullscreen)/editor/12-cartas/page.tsx` — STEP_NAMES, AnimatePresence blocks
- `src/types/interactive-wizard.ts` — `CARD_COLLECTION_CONFIG.totalSteps`

### Arquivos deletados
- `src/app/(fullscreen)/editor/12-cartas/steps/Step3Cards1to4.tsx`
- `src/app/(fullscreen)/editor/12-cartas/steps/Step4Cards5to8.tsx`
- `src/app/(fullscreen)/editor/12-cartas/steps/Step5Cards9to12.tsx`

## Critérios de aceite

### Funcional
- [ ] Editor abre em 5 steps (não mais 6)
- [ ] Step 3 mostra todas as 12 cartas em grid agrupado por categoria
- [ ] Editar mensagem de uma carta abre `EditMessageModal` corretamente
- [ ] Editar foto de uma carta abre `PhotoUploadModal` corretamente
- [ ] Salvar persiste imediatamente (autosave por carta já existe)
- [ ] `ProgressIndicator` mostra 5 bolinhas, não 6
- [ ] Navegação entre Steps 1, 2, 3 (novo), 4 (Contact) funciona

### Técnico
- [ ] `npm run build` passa
- [ ] `npx tsc --noEmit` passa
- [ ] Sem warnings de imports não usados ou steps removidos

### UX
- [ ] Mobile (375px): grid responsivo (provavelmente 2 cols), scroll vertical aceitável
- [ ] Headers de seção visualmente claros mas leves (não competem com as cartas)
- [ ] Tempo médio até Step 4 (Contact) menor que tempo atual até Step 6

## Dependências

- ✅ `CardGridView` já existe e aceita N cards (validar antes de implementar)
- ✅ Modais já são reaproveitados pelos 3 steps atuais — lógica é idêntica
- ⚠️ Spec 2.4 (foto capa única) idealmente vem antes para reduzir o prompt "Adicione 1 foto em cada carta" — mas não bloqueia

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Scroll longo em mobile com 12 cartas | Alta | Agrupamento visual + grid 2 cols + cards compactos |
| Usuário pula sem editar nada | Média | Microcopy convidativa; nudge fica para MVP 2 |
| Persistência: salvar 12 cartas em paralelo | Baixa | Autosave já é por carta individual, não em batch |
| Quebrar Spec 1.1 (badge de preço) ou Spec 1.2 (copy) | Baixa | Mudanças são na ordem dos steps, não no conteúdo |

## Estimativa

2-3h de trabalho.

## Validação pós-deploy

Acompanhar:
- Tempo médio gasto no novo Step 3 vs soma de Steps 3+4+5 antigos
- Taxa de avanço Step 3 → Step 4 (deve subir significativamente)
- % de cartas editadas (esperado: cair, pois templates ficam mais aceitos)
- Taxa de chegada no checkout (Step 4 novo)
