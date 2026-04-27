# Spec 1.1 — Tarefas

## Implementação

- [x] **T1.** Criar componente `src/components/interactive-wizard/PriceBadge.tsx`
  - Props: `productType`, `variant?: 'compact' | 'large'`, `contextLine?: string`, `className?: string`
  - Mapear `productType` (`'digital-message' | 'card-collection' | 'gender-reveal'`) para `priceId` do `usePrices`
  - Render condicional: com `priceFromFormatted` (mostra De/Por + % OFF), sem (mostra só preço + contextLine)
  - Calcular % OFF: `Math.round((1 - priceCents/priceFromCents) * 100)`
  - Estilo: borda sutil, fundo branco semi-transparente com backdrop-blur, texto compacto

- [x] **T2.** Editar `src/components/interactive-wizard/FullscreenStep.tsx`
  - Adicionar prop opcional `showPriceBadge?: boolean` (default: `true`)
  - Adicionar prop opcional `priceContextLine?: string` (passa para PriceBadge)
  - Importar e renderizar `<PriceBadge>` entre o subtítulo e o container principal
  - Usar `config.productType` do contexto

- [x] **T3.** Definir microcopy contextual por step (sem editar steps individuais — passar via prop quando necessário)
  - Para Spec 1.1, deixar o default (sem `priceContextLine`) que mostra "Acesso para sempre"
  - Microcopy específico por step fica como melhoria futura quando Spec 2.x reformular os steps

## Verificação

- [x] **V1.** `npm run build` passa
- [x] **V2.** `npx tsc --noEmit` passa (erros apenas em arquivos de teste pré-existentes, nenhum nos arquivos tocados)
- [ ] **V3.** Abrir `/editor/12-cartas` em DevTools mobile (375px) e validar:
  - Badge aparece em todos os 6 steps
  - Não quebra layout vertical
  - Preço dinâmico carrega (verificar Network tab)
- [ ] **V4.** Testar com `priceFromFormatted` simulado (mockar response do `/api/prices`)
- [ ] **V5.** Confirmar que `/editor/mensagem` e `/editor/revelacao-virtual` também ganham o badge automaticamente (sem regressão)

## Out of scope desta spec

- Mudanças de copy nos CTAs e títulos dos steps → Spec 1.2
- Reorganização visual do checkout (Step 6) → Spec 2.3
- Sistema de promoções sazonais com data de término → futuro
