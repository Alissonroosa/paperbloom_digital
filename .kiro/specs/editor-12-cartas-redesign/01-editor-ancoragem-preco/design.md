# Spec 1.1 — Editor: Ancoragem Persistente de Preço

## Problema

O editor atual de 12 Cartas (6 steps) não exibe preço em nenhum momento até o Step 6 (último). O usuário investe ~30 minutos personalizando 12 cartas e só descobre o valor de R$ 29,90 ao chegar no checkout. Resultado: choque de preço, abandono massivo, taxa de conversão baixa em campanhas Meta Ads que apontam direto para `/editor/12-cartas`.

A LP `/12-cartas` já tem ancoragem "De R$ 39,90 por R$ 29,90" via `usePrices` e `priceFromFormatted`, mas usuários que caem do anúncio direto no editor nunca passam por ela.

## Objetivo

Tornar o preço visível e ancorado em **todos os steps do editor**, sem adicionar fricção ao fluxo, com no máximo uma linha visual no topo de cada step.

## Escopo (in)

1. Criar componente `PriceBadge` reutilizável que:
   - Lê preço dinâmico via `usePrices` baseado no `productType` do wizard
   - Renderiza ancoragem "De R$ X por R$ Y" quando `priceFromFormatted` está presente
   - Renderiza só `R$ Y` quando não há `priceFromFormatted` (fallback gracioso)
   - Mostra badge de % OFF calculado a partir de `priceCents` e `priceFromCents`
   - Tem variantes visuais: `compact` (para barra fixa) e `large` (para checkout)
2. Integrar o `PriceBadge` no `FullscreenStep` no modo `compact`, fixo no topo, abaixo do título e subtítulo
3. Variação de microcopy contextual ao step (acompanha o badge):
   - Steps 1-2: foco em prova social (`+800 presentes entregues`)
   - Steps 3-5: foco em promessa (`Acesso para sempre`)
   - Step 6: foco em entrega instantânea (`Entrega instantânea`)
4. Funcionar em todos os 3 produtos que usam `FullscreenStep`: 12 Cartas, Mensagem Digital, Revelação Virtual (auto-detecta via `config.productType`)
5. Permitir desabilitar via prop `showPriceBadge={false}` para casos que não fazem sentido (ex: testes ou pages que reusam o wrapper)

## Escopo (out)

- Promoções sazonais nominadas com data de término (Dia dos Namorados etc.) — fica para futura spec da Fase 4
- Animações de pulse/atenção no badge — adicionar só se métrica não mover
- Rotação automática do microcopy contextual no mesmo step — versão MVP usa um valor fixo por step
- Tooltips ou modais explicativos sobre a promoção — não necessário no MVP
- Modificações no checkout (Step 6) que não sejam o badge — fica para Spec 1.2 e 2.3

## Mudanças técnicas principais

### Novo arquivo
- `src/components/interactive-wizard/PriceBadge.tsx` — componente do badge

### Arquivos editados
- `src/components/interactive-wizard/FullscreenStep.tsx` — insere `<PriceBadge>` quando `showPriceBadge !== false`

### Arquivos NÃO impactados (intencionalmente)
- Steps individuais (Step1BasicInfo, Step2Intro, Step3-5, Step6Contact) — herdam automaticamente via FullscreenStep
- `usePrices.ts`, `PriceService` no backend, `/api/prices` — comportamento mantido
- Outros editores (mensagem, revelação-virtual) — herdam automaticamente

## Critérios de aceite

### Funcional
- [ ] Em todos os 6 steps de `/editor/12-cartas`, aparece o badge de preço entre o título/subtítulo e o conteúdo
- [ ] Quando o banco retorna `priceFromCents`, o badge mostra "De R$ X" riscado + "R$ Y" + "X% OFF"
- [ ] Quando o banco não retorna `priceFromCents`, o badge mostra apenas "R$ Y" + microcopy contextual
- [ ] O badge é responsivo: em mobile (375px), ocupa ≤ 80px de altura, sem quebrar a hierarquia visual da página
- [ ] O badge usa o `productType` do wizard automaticamente — sem hardcode de produto

### Visual
- [ ] Badge tem cor primária da marca (rosa/pink), não compete com o CTA
- [ ] Texto é legível em mobile (mínimo 12px)
- [ ] Hierarquia clara: preço atual > preço anterior > microcopy

### Técnico
- [ ] `npm run build` passa sem warnings novos
- [ ] Type-check (`tsc --noEmit`) passa
- [ ] Nenhum teste existente quebra
- [ ] Componente é puro (sem side-effects além do `usePrices` que já é cacheado)

### UX
- [ ] Em conexão lenta (3G), o badge mostra fallback (preço default) enquanto carrega `usePrices` — não fica em branco

## Dependências

- ✅ `usePrices` hook existente
- ✅ `PriceService` no backend retornando shape correto
- ✅ `InteractiveWizardContext` expondo `config.productType`

Nenhuma dependência nova a instalar.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Badge polui visual e atrapalha foco no formulário | Média | Usar variante `compact` discreta; testar em mobile antes de mergear |
| Mismatch entre `productType` ('digital-message') e priceId ('message') | Alta | Mapear explicitamente dentro do PriceBadge, com type-safety |
| `usePrices` falha → badge fica vazio | Baixa | Fallback para `DEFAULT_PRICES` já existe no hook, badge sempre renderiza algo |
| Mudança no shape de `ProductPrice` no futuro | Baixa | Componente isolado em arquivo único, fácil de atualizar |

## Estimativa

1-2h de trabalho, contando: criação do componente, integração, ajustes visuais, verificação de build.

## Validação pós-deploy

Acompanhar nos próximos 7-14 dias:
- Taxa de avanço Step1 → Step6 (esperado: leve queda em Step1, mas aumento em conversão final)
- Taxa de conversão Step6 → checkout pago (esperado: aumento)
- Receita por visitante do editor (métrica final)

Se métrica não mover, considerar adicionar microcopy mais agressivo (urgência sazonal, contagem de coleções criadas em tempo real).